import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { evaluateFlags } from "../lib/index.js";

describe("evaluateFlags", () => {
  it("sends the API key and evaluation context to the bulk endpoint", async () => {
    let requestUrl;
    let requestOptions;
    const fetcher = async (url, options) => {
      requestUrl = url;
      requestOptions = options;
      return new Response(JSON.stringify({ values: { checkout: true } }), {
        status: 200,
      });
    };

    await assert.doesNotReject(
      evaluateFlags({
        apiKey: "client-key",
        environment: "test",
        subjectId: "user-1",
        fetcher,
      }),
    );

    assert.equal(
      requestUrl.href,
      "http://localhost:9099/v1/flags/evaluate-all",
    );
    assert.equal(requestOptions.method, "POST");
    assert.equal(requestOptions.headers["X-API-Key"], "client-key");
    assert.deepEqual(JSON.parse(requestOptions.body), {
      subjectId: "user-1",
      environment: "test",
      attributes: {},
    });
  });

  it("encodes flag keys as a single URL path segment", async () => {
    let requestUrl;
    await evaluateFlags(
      {
        apiKey: "client-key",
        environment: "test",
        subjectId: "user-1",
        baseUrl: "https://flags.example/api",
        fetcher: async (url) => {
          requestUrl = url;
          return new Response(JSON.stringify({ value: true }), { status: 200 });
        },
      },
      "checkout/new",
    );

    assert.equal(
      requestUrl.href,
      "https://flags.example/api/v1/flags/checkout%2Fnew/evaluate",
    );
  });

  it("rejects unsuccessful responses with the HTTP status", async () => {
    await assert.rejects(
      evaluateFlags(
        {
          apiKey: "client-key",
          environment: "test",
          subjectId: "user-1",
          fetcher: async () => new Response(null, { status: 403 }),
        },
        "checkout",
      ),
      (error) => error.name === "FeatureFlagApiError" && error.status === 403,
    );
  });

  it("rejects malformed bulk responses instead of silently returning defaults", async () => {
    await assert.rejects(
      evaluateFlags({
        apiKey: "client-key",
        environment: "test",
        subjectId: "user-1",
        fetcher: async () =>
          new Response(JSON.stringify({ values: [] }), { status: 200 }),
      }),
      /values object/,
    );
  });
});
