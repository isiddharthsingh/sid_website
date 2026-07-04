// ─── Edit the "Up Next" line here ─────────────────
const UP_NEXT = "Infrastructure that heals itself, agents that reason, correlate, and resolve before a human ever opens the alert. Every system I touch should get a little more autonomous, a little more inevitable. The best software hasn't been built yet, so I keep shipping toward it.";
const GH_HANDLE = 'isiddharthsingh';

// ─── Auto-derived status from GitHub activity ────
// Currently = repo with most push events in last 14 days
// Recently  = latest merged PR, release, or new repo
// Up next   = manual (UP_NEXT)
function useGithubStatus(handle) {
  const [status, setStatus] = useState({ currently: null, recently: null, loading: true });

  useEffect(() => {
    let alive = true;

    // hydrate from the github component's existing cache if present
    try {
      const cached = JSON.parse(localStorage.getItem(`gh-cache-${handle}`) || 'null');
      if (cached && cached.events) {
        const derived = deriveStatus(cached.events, cached.repos);
        if (derived.currently || derived.recently) setStatus({ ...derived, loading: false });
      }
    } catch {}

    (async () => {
      const tryFetch = (url) => fetch(url).then(x => x.ok ? x.json() : null).catch(() => null);

      // 100 events covers ~2 weeks of normal activity
      let events = await tryFetch(`https://api.github.com/users/${handle}/events/public?per_page=100`);
      let repos  = await tryFetch(`https://api.github.com/users/${handle}/repos?sort=pushed&per_page=30`);

      // CORS-proxy fallback if rate-limited
      if (!Array.isArray(events)) {
        events = await tryFetch(`https://corsproxy.io/?https://api.github.com/users/${handle}/events/public?per_page=100`);
      }
      if (!Array.isArray(repos)) {
        repos = await tryFetch(`https://corsproxy.io/?https://api.github.com/users/${handle}/repos?sort=pushed&per_page=30`);
      }
      if (!alive) return;

      let derived = deriveStatus(events, repos);
      setStatus({ ...derived, loading: false });

      // ─── ENRICHMENT: fetch the things GitHub redacts from events ───
      // (PR title, latest commit message)
      const enrichCache = (() => {
        try { return JSON.parse(localStorage.getItem(`gh-enrich-${handle}`) || 'null') || {}; }
        catch { return {}; }
      })();
      const TEN_MIN = 10 * 60 * 1000;
      const getCached = (k) => {
        const e = enrichCache[k];
        return (e && Date.now() - e.ts < TEN_MIN) ? e.v : null;
      };
      const setCached = (k, v) => { enrichCache[k] = { ts: Date.now(), v }; };

      const tasks = [];

      // Enrich CURRENTLY with latest commit on the active repo
      if (derived.currently) {
        const repoFull = `${repos?.find(r => r.name === derived.currently.repo)?.owner?.login || 'isiddharthsingh'}/${derived.currently.repo}`;
        // find the matching repo full_name from events for accuracy
        const fromEvents = (events || []).find(e => e.type === 'PushEvent' && e.repo.name.endsWith('/' + derived.currently.repo));
        const fullName = fromEvents?.repo.name || repoFull;
        const key = `commit:${fullName}`;
        const cached = getCached(key);
        if (cached) {
          derived = { ...derived, currently: { ...derived.currently, latestMsg: cached } };
        } else {
          tasks.push(
            tryFetch(`https://api.github.com/repos/${fullName}/commits?per_page=1`)
              .then(commits => {
                if (Array.isArray(commits) && commits[0]?.commit?.message) {
                  const msg = commits[0].commit.message.split('\n')[0].slice(0, 100);
                  setCached(key, msg);
                  return { kind: 'currently', latestMsg: msg };
                }
                return null;
              })
          );
        }
      }

      // Enrich RECENTLY with PR title if it's a PR with a number but no title
      if (derived.recently?.kind === 'pr' && /^PR #\d+$/.test(derived.recently.title)) {
        const number = derived.recently.title.replace('PR #', '');
        const fromEvents = (events || []).find(e => e.type === 'PullRequestEvent' && (e.payload?.number == number || e.payload?.pull_request?.number == number));
        const fullName = fromEvents?.repo.name;
        if (fullName) {
          const key = `pr:${fullName}#${number}`;
          const cached = getCached(key);
          if (cached) {
            derived = { ...derived, recently: { ...derived.recently, title: cached.title, url: cached.url || derived.recently.url } };
          } else {
            tasks.push(
              tryFetch(`https://api.github.com/repos/${fullName}/pulls/${number}`)
                .then(pr => {
                  if (pr?.title) {
                    const v = { title: pr.title, url: pr.html_url };
                    setCached(key, v);
                    return { kind: 'recently', ...v };
                  }
                  return null;
                })
            );
          }
        }
      }

      // apply any cached enrichments synchronously
      if (alive) setStatus({ ...derived, loading: tasks.length > 0 });

      const results = await Promise.all(tasks);
      if (!alive) return;
      let next = derived;
      for (const r of results) {
        if (!r) continue;
        if (r.kind === 'currently') {
          next = { ...next, currently: { ...next.currently, latestMsg: r.latestMsg } };
        } else if (r.kind === 'recently') {
          next = { ...next, recently: { ...next.recently, title: r.title, url: r.url } };
        }
      }
      setStatus({ ...next, loading: false });

      // persist enrichment cache
      try { localStorage.setItem(`gh-enrich-${handle}`, JSON.stringify(enrichCache)); } catch {}
    })();

    return () => { alive = false; };
  }, [handle]);

  return status;
}

function deriveStatus(events, repos) {
  if (!Array.isArray(events)) return { currently: null, recently: null };

  // ─ CURRENTLY: repo with most pushes in last 14 days ─
  const cutoff = Date.now() - 14 * 24 * 60 * 60 * 1000;
  const pushTally = new Map(); // repoFull -> { count, latestMsg, latest }
  events
    .filter(e => e.type === 'PushEvent' && new Date(e.created_at).getTime() >= cutoff)
    .forEach(e => {
      const repoFull = e.repo.name;
      const commits = (e.payload && e.payload.commits) || [];
      const cur = pushTally.get(repoFull) || { count: 0, latestMsg: '', latest: 0 };
      cur.count += Math.max(1, commits.length);
      const t = new Date(e.created_at).getTime();
      if (t > cur.latest) {
        cur.latest = t;
        cur.latestMsg = commits[0]?.message?.split('\n')[0] || '';
      }
      pushTally.set(repoFull, cur);
    });

  let currently = null;
  if (pushTally.size) {
    const [topRepo, top] = [...pushTally.entries()].sort((a, b) => b[1].count - a[1].count)[0];
    const shortName = topRepo.split('/')[1];
    const repoMeta = (repos || []).find(r => r.full_name === topRepo);
    const desc = repoMeta && repoMeta.description ? repoMeta.description : null;
    currently = {
      repo: shortName,
      repoUrl: `https://github.com/${topRepo}`,
      count: top.count,
      latestMsg: top.latestMsg,
      desc,
    };
  }

  // ─ RECENTLY: latest merged PR, release, new repo/branch, or push to a different repo ─
  let recently = null;
  const isMergedPR = (e) =>
    e.type === 'PullRequestEvent' &&
    (e.payload?.action === 'merged' ||
     (e.payload?.action === 'closed' && e.payload?.pull_request?.merged));
  const mergedPR = events.find(isMergedPR);
  const release  = events.find(e => e.type === 'ReleaseEvent' && e.payload?.action === 'published');
  const newRepo  = events.find(e => e.type === 'CreateEvent' && e.payload?.ref_type === 'repository');
  const newBranch = events.find(e => e.type === 'CreateEvent' && e.payload?.ref_type === 'branch');

  if (mergedPR) {
    const pr = mergedPR.payload?.pull_request;
    const prNumber = pr?.number || mergedPR.payload?.number;
    const repoFull = mergedPR.repo.name;
    recently = {
      kind: 'pr',
      title: pr?.title || (prNumber ? `PR #${prNumber}` : 'a pull request'),
      repo: repoFull.split('/')[1],
      url: pr?.html_url || (prNumber ? `https://github.com/${repoFull}/pull/${prNumber}` : `https://github.com/${repoFull}/pulls`),
      when: mergedPR.created_at,
    };
  } else if (release) {
    recently = {
      kind: 'release',
      title: release.payload?.release?.name || release.payload?.release?.tag_name || 'a release',
      repo: release.repo.name.split('/')[1],
      url: release.payload?.release?.html_url || `https://github.com/${release.repo.name}/releases`,
      when: release.created_at,
    };
  } else if (newRepo) {
    recently = {
      kind: 'repo',
      title: newRepo.repo.name.split('/')[1],
      repo: newRepo.repo.name.split('/')[1],
      url: `https://github.com/${newRepo.repo.name}`,
      when: newRepo.created_at,
    };
  } else {
    // last resort: latest push to a *different* repo than "Currently"
    const currentRepo = currently?.repo;
    const otherPush = events.find(e =>
      e.type === 'PushEvent' &&
      e.repo.name.split('/')[1] !== currentRepo
    );
    if (otherPush) {
      const commit = (otherPush.payload?.commits || [])[0];
      recently = {
        kind: 'commit',
        title: commit?.message?.split('\n')[0] || 'pushed an update',
        repo: otherPush.repo.name.split('/')[1],
        url: commit?.sha
          ? `https://github.com/${otherPush.repo.name}/commit/${commit.sha}`
          : `https://github.com/${otherPush.repo.name}`,
        when: otherPush.created_at,
      };
    } else if (newBranch) {
      // even further fallback: a new branch
      recently = {
        kind: 'commit',
        title: `branch ${newBranch.payload?.ref || ''}`.trim(),
        repo: newBranch.repo.name.split('/')[1],
        url: `https://github.com/${newBranch.repo.name}`,
        when: newBranch.created_at,
      };
    }
  }

  return { currently, recently };
}

function ghTimeAgo(iso) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 3600) return Math.max(1, Math.floor(s/60)) + 'm ago';
  if (s < 86400) return Math.floor(s/3600) + 'h ago';
  if (s < 604800) return Math.floor(s/86400) + 'd ago';
  return Math.floor(s/604800) + 'w ago';
}

function About() {
  const status = useGithubStatus(GH_HANDLE);
  const ref = useReveal();

  // Publish live status so SIDCLAW (the chatbot) can answer with what
  // Siddharth is doing *right now*, fresh commits, the latest merged PR —
  // not just the static resume.
  useEffect(() => {
    const c = status.currently, r = status.recently;
    const lines = [];
    if (c) {
      lines.push(`Currently pushing to ${c.repo}, ${c.count} commits in the last 14 days.`);
      if (c.desc) lines.push(`  ${c.repo}: ${c.desc}`);
      if (c.latestMsg) lines.push(`  Latest commit: "${c.latestMsg}"`);
    }
    if (r) {
      const ago = r.when ? ' (' + ghTimeAgo(r.when) + ')' : '';
      if (r.kind === 'pr') lines.push(`Recently merged PR "${r.title}" on ${r.repo}${ago}.`);
      else if (r.kind === 'release') lines.push(`Recently shipped release "${r.title}" on ${r.repo}${ago}.`);
      else if (r.kind === 'repo') lines.push(`Recently started a new repo "${r.title}"${ago}.`);
      else if (r.kind === 'commit') lines.push(`Recent commit on ${r.repo}: "${r.title}"${ago}.`);
    }
    window.__siddLive = {
      currently: c, recently: r, upNext: UP_NEXT,
      text: lines.length
        ? lines.join('\n')
        : 'No live GitHub activity synced yet (rate-limited or offline). Fall back to the dossier below.',
      syncedAt: new Date().toISOString(),
    };
  }, [status]);
  const refManifesto = useReveal();
  const refStatus = useReveal();
  const refPrinciples = useReveal();
  const refFocus = useReveal();
  const refTimeline = useReveal();
  const refOff = useReveal();

  return (
    <section className="about about-rich" id="about" data-screen-label="About">
      <div className="section-marker"><span className="num">01</span> Profile</div>

      {/* ── Headline + lede ── */}
      <div className="about-grid">
        <div className="reveal" ref={ref}>
          <h2 className="about-headline">
            Engineer working at the<br/>intersection of <span className="accent">agents,</span><br/>
            infrastructure, and the <span className="serif-italic">things in between.</span>
          </h2>
        </div>
        <div>
          <div className="about-body">
            <p>
              <span className="dropcap">C</span>urrently at Arvo AI, where I design a 240-step reasoning agent that operates across 40+ tools and 4 LLM providers. Four years deep in cloud infrastructure, distributed systems, and AI agent platforms.
            </p>
            <p>
              Before this, post-quantum cryptography for an enterprise security suite, multi-cloud connector architectures spanning five providers, real-time data pipelines on Kafka and Spark, and the GCP infrastructure that improved a team's deployment speed by 40%.
            </p>
            <p>
              I hold a Master of Science in Computer Science from New York University and live in New York.
            </p>
          </div>
          <div className="about-stats">
            <div className="stat"><div className="num"><span className="it">4+</span></div><div className="lbl">Years building<br/>in production</div></div>
            <div className="stat"><div className="num"><span className="it">15+</span></div><div className="lbl">Systems shipped<br/>across 6 companies</div></div>
            <div className="stat"><div className="num"><span className="it">5</span></div><div className="lbl">Cloud providers,<br/>one connector layer</div></div>
          </div>
        </div>
      </div>

      {/* ── Currently / Recently / Up next ── auto-derived from GitHub ── */}
      <div className="about-status reveal" ref={refStatus}>
        <div className="about-eyebrow">— Status {status.loading ? <span className="status-loading">· syncing with github…</span> : null}</div>
        <div className="about-status-grid">
          <div className="status-cell">
            <div className="status-tag"><span className="status-dot live"></span> Currently</div>
            {status.currently ? (
              <>
                <p>
                  Pushing to{' '}
                  <a className="status-repo" href={status.currently.repoUrl} target="_blank" rel="noreferrer">
                    <span className="it">{status.currently.repo}</span>
                  </a>
                  , <span className="status-num">{status.currently.count}</span> commits in the last 14 days.
                </p>
                {status.currently.desc ? (
                  <p className="status-desc">{status.currently.desc}</p>
                ) : null}
                {status.currently.latestMsg ? (
                  <p className="status-latest">
                    <span className="status-eyebrow">Latest commit</span>
                    <span className="status-msg">“{status.currently.latestMsg}”</span>
                  </p>
                ) : null}
              </>
            ) : (
              <p className="status-fallback">
                At <span className="it">Arvo AI</span>, building an autonomous incident-RCA agent, a LangGraph ReAct loop
                with context trimming, live streaming, and a pluggable connector to 15+ monitoring platforms.
              </p>
            )}
          </div>
          <div className="status-cell">
            <div className="status-tag"><span className="status-dot recent"></span> Recently</div>
            {status.recently ? (
              <p>
                {status.recently.kind === 'pr' && (
                  <>Merged <a className="status-msg" href={status.recently.url} target="_blank" rel="noreferrer">“{status.recently.title}”</a> on{' '}
                  <span className="it">{status.recently.repo}</span> · <span className="status-ago">{ghTimeAgo(status.recently.when)}</span></>
                )}
                {status.recently.kind === 'release' && (
                  <>Shipped <a className="status-msg" href={status.recently.url} target="_blank" rel="noreferrer">{status.recently.title}</a> on{' '}
                  <span className="it">{status.recently.repo}</span> · <span className="status-ago">{ghTimeAgo(status.recently.when)}</span></>
                )}
                {status.recently.kind === 'repo' && (
                  <>Started <a className="status-msg" href={status.recently.url} target="_blank" rel="noreferrer"><span className="it">{status.recently.title}</span></a> · <span className="status-ago">{ghTimeAgo(status.recently.when)}</span></>
                )}
                {status.recently.kind === 'commit' && (
                  <>Latest on <span className="it">{status.recently.repo}</span>: <a className="status-msg" href={status.recently.url} target="_blank" rel="noreferrer">“{status.recently.title}”</a> · <span className="status-ago">{ghTimeAgo(status.recently.when)}</span></>
                )}
              </p>
            ) : (
              <p className="status-fallback">
                Shipped a Memgraph-backed alert correlation engine combining topology, time-window,
                and semantic-similarity strategies; designed an episodic agent memory layer on Weaviate.
              </p>
            )}
          </div>
          <div className="status-cell">
            <div className="status-tag"><span className="status-dot next"></span> Up next</div>
            <p>{UP_NEXT}</p>
          </div>
        </div>
      </div>

      {/* ── What I work on (focus distribution) ── */}
      <div className="about-focus reveal" ref={refFocus}>
        <div className="about-eyebrow">— What I work on</div>
        <div className="focus-grid">
          <div className="focus-row">
            <div className="focus-label">AI agents & RAG</div>
            <div className="focus-bar"><div className="focus-fill" style={{width: '92%'}}></div></div>
            <div className="focus-pct">92%</div>
          </div>
          <div className="focus-row">
            <div className="focus-label">Distributed systems</div>
            <div className="focus-bar"><div className="focus-fill" style={{width: '78%'}}></div></div>
            <div className="focus-pct">78%</div>
          </div>
          <div className="focus-row">
            <div className="focus-label">Cloud infra & DevOps</div>
            <div className="focus-bar"><div className="focus-fill" style={{width: '74%'}}></div></div>
            <div className="focus-pct">74%</div>
          </div>
          <div className="focus-row">
            <div className="focus-label">Streaming & data pipelines</div>
            <div className="focus-bar"><div className="focus-fill" style={{width: '66%'}}></div></div>
            <div className="focus-pct">66%</div>
          </div>
          <div className="focus-row">
            <div className="focus-label">Security & cryptography</div>
            <div className="focus-bar"><div className="focus-fill" style={{width: '58%'}}></div></div>
            <div className="focus-pct">58%</div>
          </div>
          <div className="focus-row">
            <div className="focus-label">Frontend & product UX</div>
            <div className="focus-bar"><div className="focus-fill" style={{width: '52%'}}></div></div>
            <div className="focus-pct">52%</div>
          </div>
        </div>
      </div>

      {/* ── Timeline of formative moments (recent first) ── */}
      <div className="about-timeline reveal" ref={refTimeline}>
        <div className="about-eyebrow">— Marginalia</div>
        <h3 className="about-sub">A few moments that shaped the work.</h3>
        <ol className="timeline-list">
          <li>
            <span className="t-year">2025</span>
            <div>
              <strong>Arvo AI, agent platform from scratch.</strong>
              <p>240-step reasoning agent, 40+ tools, 4 LLM providers. RAG with episodic memory. Where I am now.</p>
            </div>
          </li>
          <li>
            <span className="t-year">2025</span>
            <div>
              <strong>Post-quantum cryptography at Futeur AI.</strong>
              <p>Implemented CRYSTALS-Kyber & Dilithium with plug-and-play DB integration, 100% NIST compliance, 85% vulnerability reduction.</p>
            </div>
          </li>
          <li>
            <span className="t-year">2023</span>
            <div>
              <strong>NYU, Master of Science.</strong>
              <p>Big Data, distributed systems, ML, information security. The semester on Open Source dev rewired how I think about software.</p>
            </div>
          </li>
          <li>
            <span className="t-year">2021</span>
            <div>
              <strong>Joined Cognizant as a Cloud Engineer.</strong>
              <p>Two years deep in GCP, Compute Engine, GKE, Cloud Build, Terraform. Learned that infra is mostly about handling other people's edge cases.</p>
            </div>
          </li>
          <li>
            <span className="t-year">2017</span>
            <div>
              <strong>Started at SRM Institute, Chennai.</strong>
              <p>Bachelor of Technology in Computer Science. First commit to a git repo. First time deploying anything.</p>
            </div>
          </li>
        </ol>
      </div>

      {/* ── Off the clock ── */}
      <div className="about-off reveal" ref={refOff}>
        <div className="about-eyebrow">— Off the clock</div>
        <div className="off-grid">
          <div className="off-cell">
            <div className="off-num">§ i</div>
            <strong>Reading</strong>
            <p>Designing Data-Intensive Applications. Anything by Hillel Wayne. Long-form essays on systems thinking.</p>
          </div>
          <div className="off-cell">
            <div className="off-num">§ ii</div>
            <strong>The gym</strong>
            <p>Lifting, mostly. Progressive overload is just a deploy schedule for the body, small commits, compounding gains.</p>
          </div>
          <div className="off-cell">
            <div className="off-num">§ iii</div>
            <strong>Walking</strong>
            <p>Long walks in NYC, anywhere south of 14th, ideally with no destination.</p>
          </div>
          <div className="off-cell">
            <div className="off-num">§ iv</div>
            <strong>Tinkering</strong>
            <p>Side projects that never ship, the best kind. Most live in <span className="mono">~/scratch/</span>.</p>
          </div>
        </div>
      </div>

      {/* ── Closing pull-quote (small, end-of-page) ── */}
      <div className="about-manifesto small reveal" ref={refManifesto}>
        <span className="quote-mark">“</span>
        <p>
          The interesting problems aren't in any single layer, they live in the seams
          between systems. <span className="it">Agents that reason across tools, infrastructure that survives a bad
          deploy, data that arrives intact at 3am.</span> That's the work.
        </p>
        <span className="quote-cite">— On the work, in five lines</span>
      </div>

      {/* ── Closing CTA strip ── */}
      <div className="about-cta-strip reveal" ref={useReveal()}>
        <div>
          <div className="about-eyebrow">— Want the receipts?</div>
          <h3 className="about-sub">The CV, the work, and a way to say hello.</h3>
        </div>
        <div className="about-cta-actions">
          <a className="btn btn-primary" href="#/projects" onClick={(e) => { e.preventDefault(); navigate('projects'); }}>See projects <span className="arr">↗</span></a>
          <a className="btn btn-secondary" href="#/resume" onClick={(e) => { e.preventDefault(); navigate('resume'); }}>Read resume <span className="arr">↗</span></a>
          <a className="btn btn-secondary" href="#/contact" onClick={(e) => { e.preventDefault(); navigate('contact'); }}>Get in touch <span className="arr">↗</span></a>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { About });
