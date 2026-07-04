function Github() {
  const handle = 'isiddharthsingh';
  const [user, setUser] = useState(null);
  const [repos, setRepos] = useState([]);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);
  const [commits, setCommits] = useState([]);
  const [contrib, setContrib] = useState(null); // { weeks: [[{date, count, level}, x7], x53], total }

  useEffect(() => {
    let alive = true;
    const cacheKey = `gh-cache-${handle}`;

    // Hydrate immediately from localStorage so visitors never see "—"
    try {
      const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null');
      if (cached && cached.user) setUser(cached.user);
      if (cached && cached.repos) setRepos(cached.repos);
      if (cached && cached.events) setEvents(cached.events);
      if (cached && cached.contrib) setContrib(cached.contrib);
      if (cached && cached.commits) setCommits(cached.commits);
    } catch {}

    (async () => {
      const tryFetch = (url) => fetch(url).then(x => x.ok ? x.json() : null).catch(() => null);

      // 1) Try GitHub API directly
      const [u, r, e, c] = await Promise.all([
        tryFetch(`https://api.github.com/users/${handle}`),
        tryFetch(`https://api.github.com/users/${handle}/repos?sort=pushed&per_page=100`),
        tryFetch(`https://api.github.com/users/${handle}/events/public?per_page=30`),
        tryFetch(`https://github-contributions-api.jogruber.de/v4/${handle}?y=last`),
      ]);
      if (!alive) return;

      let userData = (u && u.login) ? u : null;
      let reposData = Array.isArray(r) ? r : null;
      let eventsData = Array.isArray(e) ? e : null;
      let contribData = (c && Array.isArray(c.contributions)) ? c : null;

      // 2) Fallback: scrape user profile via a CORS-friendly proxy if the direct API was rate-limited
      if (!userData) {
        try {
          const proxied = await fetch(`https://corsproxy.io/?https://api.github.com/users/${handle}`).then(x => x.ok ? x.json() : null);
          if (proxied && proxied.login) userData = proxied;
        } catch {}
      }
      if (!reposData) {
        try {
          const proxied = await fetch(`https://corsproxy.io/?https://api.github.com/users/${handle}/repos?sort=pushed&per_page=100`).then(x => x.ok ? x.json() : null);
          if (Array.isArray(proxied)) reposData = proxied;
        } catch {}
      }

      if (userData) setUser(userData);
      if (reposData) setRepos(reposData);
      if (eventsData) setEvents(eventsData);
      if (contribData) setContrib(contribData);

      // Build commit feed
      let commitData = [];
      if (eventsData) {
        const pushes = eventsData.filter(x => x.type === 'PushEvent').slice(0, 12);
        const inline = [];
        const toFetch = [];
        pushes.forEach(ev => {
          const cs = ev.payload && ev.payload.commits;
          if (cs && cs.length) {
            cs.slice(0, 1).forEach(cc => inline.push({
              msg: cc.message.split('\n')[0],
              repo: ev.repo.name.split('/')[1],
              when: ev.created_at,
              sha: cc.sha.slice(0, 7),
            }));
          } else if (ev.payload && ev.payload.head) {
            toFetch.push({ ev, sha: ev.payload.head, url: `https://api.github.com/repos/${ev.repo.name}/commits/${ev.payload.head}` });
          }
        });
        if (inline.length) { setCommits(inline); commitData = inline; }
        const fetched = await Promise.all(
          toFetch.map(t => tryFetch(t.url).then(json => ({ t, json })))
        );
        if (!alive) return;
        const more = fetched.filter(x => x.json && x.json.commit).map(({ t, json }) => ({
          msg: (json.commit.message || '').split('\n')[0] || 'commit',
          repo: t.ev.repo.name.split('/')[1], when: t.ev.created_at, sha: t.sha.slice(0, 7),
        }));
        const merged = [];
        pushes.forEach(ev => {
          const fromInline = inline.find(cc => cc.when === ev.created_at && cc.repo === ev.repo.name.split('/')[1]);
          if (fromInline) { merged.push(fromInline); return; }
          const fromFetched = more.find(cc => cc.when === ev.created_at && cc.repo === ev.repo.name.split('/')[1]);
          if (fromFetched) merged.push(fromFetched);
          else if (ev.payload && ev.payload.head) {
            merged.push({
              msg: `Pushed to ${(ev.payload.ref || '').replace('refs/heads/', '')}`,
              repo: ev.repo.name.split('/')[1], when: ev.created_at, sha: ev.payload.head.slice(0, 7),
            });
          }
        });
        if (merged.length) { setCommits(merged.slice(0, 12)); commitData = merged.slice(0, 12); }
      }

      // Cache everything we got for next visit
      try {
        localStorage.setItem(cacheKey, JSON.stringify({
          user: userData, repos: reposData, events: eventsData, contrib: contribData, commits: commitData, ts: Date.now(),
        }));
      } catch {}
    })();
    return () => { alive = false; };
  }, []);

  // Real heatmap from contributions API; fall back to event-only if endpoint fails
  const heatmap = React.useMemo(() => buildHeatmap(contrib, events), [contrib, events]);
  const recentPushes = events.filter(e => e.type === 'PushEvent');
  const totalContribs = contrib ? contrib.total[Object.keys(contrib.total)[Object.keys(contrib.total).length - 1]] || heatmap.total : heatmap.total;

  return (
    <section className="github" id="github" data-screen-label="GitHub">
      <div className="section-marker"><span className="num">05</span> Dispatches</div>
      <div className="gh-head">
        <h2><span className="line-1">Live from</span> <span className="it line-2">/{handle}</span></h2>
        <p className="lede">A working dispatch from the editor's terminal. Stats, contributions, and the latest commits, pulled fresh from <a href={`https://github.com/${handle}`} target="_blank" rel="noreferrer">github.com/{handle}</a>.</p>
      </div>

      <div className="gh-stats">
        <div className="gh-stat"><div className="lbl">Public repositories</div><div className="val"><span className="it">{user ? user.public_repos : (repos.length ? repos.length : '—')}</span></div></div>
        <div className="gh-stat"><div className="lbl">Followers on GitHub</div><div className="val"><span className="it">{user ? user.followers : '—'}</span></div></div>
        <div className="gh-stat"><div className="lbl">Contributions · last 12 months</div><div className="val"><span className="it">{totalContribs || '—'}</span></div></div>
      </div>

      <div className="gh-contrib">
        <div className="gh-contrib-head">
          <span>{heatmap.total} contributions · last 52 weeks</span>
          <span>less ▢ ▢ ▣ ▣ ▰ more</span>
        </div>
        <div className="gh-heatmap">
          <div className="gh-months">
            {heatmap.monthLabels.map((m, i) => (
              <span key={i} style={{gridColumn: m.col + 1}}>{m.label}</span>
            ))}
          </div>
          <div className="gh-grid-wrap">
            <div className="gh-days">
              <span>Mon</span><span>Wed</span><span>Fri</span>
            </div>
            <div className="gh-grid">
              {heatmap.cells.map((d, i) => (
                <div
                  key={i}
                  className={'gh-day' + (d.level > 0 ? ` l${d.level}` : '') + (d.empty ? ' empty' : '')}
                  title={d.empty ? '' : `${d.count} contribution${d.count === 1 ? '' : 's'} on ${d.date}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="gh-feed">
        <div className="gh-feed-head"><span className="live-dot"></span> Live commit feed</div>
        {error && <div className="gh-empty">Could not reach GitHub.</div>}
        {commits.length === 0 && !error && <div className="gh-empty">Loading live commits…</div>}
        {commits.map((c, i) => (
          <div className="gh-commit" key={i}>
            <div className="when">{timeAgo(c.when)}</div>
            <div className="msg">{c.msg} <span className="sha">· {c.sha}</span></div>
            <div className="repo">{c.repo}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function buildHeatmap(contrib, events) {
  // Build a 53-col × 7-row grid ending today, Sunday-first (col-major: col*7 + row)
  const today = new Date(); today.setHours(0,0,0,0);
  const todayDow = today.getDay(); // 0=Sun..6=Sat
  const totalCols = 53;
  const totalDays = totalCols * 7;
  // Last cell (col 52, row=todayDow) = today.
  // Cell at index i corresponds to date = today - (totalDays - 1 - i + (6 - todayDow)) days
  // Simpler: walk back from today, fill from end.
  const cells = new Array(totalDays).fill(null).map(() => ({ date: '', count: 0, level: 0, empty: true }));

  // Map of yyyy-mm-dd -> count
  const map = new Map();
  if (contrib && Array.isArray(contrib.contributions)) {
    contrib.contributions.forEach(c => map.set(c.date, c));
  } else if (events && events.length) {
    events.forEach(ev => {
      const d = new Date(ev.created_at); d.setHours(0,0,0,0);
      const key = isoDate(d);
      const cur = map.get(key) || { date: key, count: 0, level: 0 };
      cur.count += 1;
      cur.level = Math.min(4, Math.ceil(cur.count / 2));
      map.set(key, cur);
    });
  }

  // Last column row index for "today" should be todayDow.
  // We fill backwards from (col=52, row=todayDow).
  let total = 0;
  let monthMarks = [];
  let lastMonth = -1;
  for (let i = 0; i < totalDays; i++) {
    // Compute the date for cell at column-major position
    // index = col*7 + row; reverse: col = floor(i/7), row = i%7
    const col = Math.floor(i / 7);
    const row = i % 7;
    // Days back from today: lastCol(52)+todayDow corresponds to today (i.e., position 52*7+todayDow)
    // We want positions before that to be earlier dates.
    const targetIndex = 52 * 7 + todayDow;
    const diffPositions = targetIndex - i;
    const d = new Date(today.getTime() - diffPositions * 86400000);
    const key = isoDate(d);
    const rec = map.get(key);
    const count = rec ? rec.count : 0;
    const level = rec ? (rec.level != null ? rec.level : levelize(count)) : 0;
    cells[i] = {
      date: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
      count, level, empty: i > targetIndex,
    };
    if (!cells[i].empty) total += count;
    // Month label at row 0 (top of column) when month changes
    if (row === 0 && !cells[i].empty) {
      const m = d.getMonth();
      if (m !== lastMonth) {
        monthMarks.push({ col, label: d.toLocaleDateString('en-US', { month: 'short' }) });
        lastMonth = m;
      }
    }
  }
  return { cells, total, monthLabels: monthMarks };
}

function isoDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function levelize(c) {
  if (c <= 0) return 0;
  if (c <= 2) return 1;
  if (c <= 5) return 2;
  if (c <= 9) return 3;
  return 4;
}

function timeAgo(iso) {
  const t = new Date(iso).getTime();
  const s = Math.floor((Date.now() - t) / 1000);
  if (s < 60) return s + 's ago';
  if (s < 3600) return Math.floor(s/60) + 'm ago';
  if (s < 86400) return Math.floor(s/3600) + 'h ago';
  if (s < 604800) return Math.floor(s/86400) + 'd ago';
  return Math.floor(s/604800) + 'w ago';
}

Object.assign(window, { Github });
