import { createServer } from "node:http";

const port = Number(process.env.MOCK_SERVER_PORT ?? 9099);
const apiKey = process.env.FEATURE_FLAG_API_KEY ?? "dev-client-key";
const allowedOrigin = "http://127.0.0.1:5173";
const flags = {
  "new-dashboard": true,
  "quick-search": true,
  "user-role": "admin",
  "dashboard-settings": {
    density: "comfortable",
    showActivity: true,
  },
};

function sendJson(response, status, body) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  });
  response.end(JSON.stringify(body));
}

async function readJsonBody(request) {
  const chunks = [];
  let length = 0;

  for await (const chunk of request) {
    length += chunk.length;
    if (length > 16_384) {
      throw new Error("Request body exceeds the development server limit.");
    }
    chunks.push(chunk);
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

const server = createServer(async (request, response) => {
  if (request.method === "OPTIONS") {
    response.writeHead(204, {
      "Access-Control-Allow-Origin": allowedOrigin,
      "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    });
    response.end();
    return;
  }

  const url = new URL(request.url ?? "/", `http://127.0.0.1:${port}`);
  if (request.method === "GET" && url.pathname === "/health") {
    sendJson(response, 200, { status: "ok" });
    return;
  }

  if (request.method !== "POST") {
    sendJson(response, 405, { error: "Method not allowed." });
    return;
  }

  if (request.headers["x-api-key"] !== apiKey) {
    sendJson(response, 401, { error: "Invalid development API key." });
    return;
  }

  let body;
  try {
    body = await readJsonBody(request);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid JSON body.";
    sendJson(response, 400, { error: message });
    return;
  }

  if (
    !body ||
    typeof body !== "object" ||
    typeof body.subjectId !== "string" ||
    typeof body.environment !== "string"
  ) {
    sendJson(response, 400, { error: "subjectId and environment are required." });
    return;
  }

  if (url.pathname === "/v1/flags/evaluate-all") {
    sendJson(response, 200, { values: flags });
    return;
  }

  const match = url.pathname.match(/^\/v1\/flags\/([^/]+)\/evaluate$/);
  if (match) {
    let flagKey;
    try {
      flagKey = decodeURIComponent(match[1]);
    } catch {
      sendJson(response, 400, { error: "Invalid flag key." });
      return;
    }

    if (!Object.hasOwn(flags, flagKey)) {
      sendJson(response, 404, { error: `Unknown flag: ${flagKey}` });
      return;
    }

    sendJson(response, 200, { value: flags[flagKey] });
    return;
  }

  sendJson(response, 404, { error: "Unknown evaluation endpoint." });
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Mock feature flag API listening on http://127.0.0.1:${port}`);
});
