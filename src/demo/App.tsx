import {
  FeatureFlag,
  useFeatureFlagApi,
} from "../index";

const apiOptions = {
  apiKey: import.meta.env.VITE_FEATURE_FLAG_API_KEY ?? "dev-client-key",
  environment: "development",
  subjectId: "demo-user",
  baseUrl:
    import.meta.env.VITE_FEATURE_FLAG_API_URL ?? "http://127.0.0.1:9099",
};

export default function App() {
  const { data, loading, error } = useFeatureFlagApi(apiOptions);

  return (
    <main className="page-shell">
      <header className="hero">
        <div className="brand-mark" aria-hidden="true">
          OF
        </div>
        <div>
          <p className="eyebrow">OpenFeature · React SDK</p>
          <h1>Feature flags, in context.</h1>
          <p className="hero-copy">
            One evaluation powers every app and microfrontend.
          </p>
        </div>
        <span className="connection-pill">
          <span className="connection-dot" />
          Local API
        </span>
      </header>

      <section className="feature-grid" aria-label="Feature flag examples">
        <article className="feature-card primary-card">
          <div className="card-kicker">01 / Boolean flag</div>
          <h2>New dashboard</h2>
          <p>Roll out the refreshed dashboard experience.</p>
          <FeatureFlag
            flagKey="new-dashboard"
            defaultValue={false}
            fallback={<span className="status disabled">Classic view</span>}
          >
            <span className="status enabled">Enabled for you</span>
          </FeatureFlag>
        </article>

        <article className="feature-card">
          <div className="card-kicker">02 / String variant</div>
          <h2>Role-based access</h2>
          <p>Only eligible roles see administration tools.</p>
          <FeatureFlag
            flagKey="user-role"
            defaultValue="member"
            matchValue="admin"
            fallback={<span className="status disabled">Member access</span>}
          >
            <span className="status enabled">Admin tools unlocked</span>
          </FeatureFlag>
        </article>

        <article className="feature-card">
          <div className="card-kicker">03 / Rollout control</div>
          <h2>Quick search</h2>
          <p>Ship the new search experience behind a flag.</p>
          <FeatureFlag
            flagKey="quick-search"
            defaultValue={false}
            fallback={<span className="status disabled">Not in this rollout</span>}
          >
            <button className="search-button" type="button">
              Open quick search <kbd>⌘ K</kbd>
            </button>
          </FeatureFlag>
        </article>
      </section>

      <section className="payload-card">
        <div className="payload-heading">
          <div>
            <p className="eyebrow">Live evaluation</p>
            <h2>API response</h2>
          </div>
          <span className={`request-state ${error ? "has-error" : ""}`}>
            {loading ? "Fetching" : error ? "Request failed" : "Up to date"}
          </span>
        </div>
        {error ? (
          <p className="error-message" role="alert">
            {error}
          </p>
        ) : (
          <pre>{JSON.stringify(data, null, 2)}</pre>
        )}
      </section>
      <footer>
        <span>Typed defaults · OpenFeature provider · React components</span>
        <span>Built for shared app experiences</span>
      </footer>
    </main>
  );
}
