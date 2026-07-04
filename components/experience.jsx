const EXPERIENCE = [
  {
    date: '2025 – Now',
    year: '2025',
    role: 'Senior Software Engineer',
    company: 'Arvo AI',
    location: 'New York',
    summary: 'Designing an autonomous incident-response agent that investigates production alerts end-to-end.',
    impact: [
      { num: '240', unit: 'reasoning steps', note: 'per investigation, across 40+ tools' },
      { num: '5', unit: 'cloud providers', note: 'unified by one connector layer' },
      { num: '~90%', unit: 'time saved', note: 'on outreach automation' },
    ],
    bullets: [
      'AI-powered incident RCA platform, 240-step reasoning across 40+ tools and 4 LLM providers, built on a LangGraph ReAct agent with context trimming and live streaming.',
      'Multi-cloud infra spanning 5 providers and 15+ monitoring platforms with credential-isolated execution (STS, OAuth2) via a pluggable connector architecture.',
      'Alert correlation engine combining topology, time-window, and similarity strategies on a Memgraph-backed scoring system with 11-method discovery.',
      '3-collection RAG with episodic agent memory, hybrid search, heading-aware chunking, session-scoped indexing on Weaviate.',
      'Internal lead-management platform replacing 5–6h of manual outreach with a 30–40m automated flow.',
    ],
    stack: ['LangGraph', 'Weaviate', 'Memgraph', 'AWS', 'GCP', 'OAuth2', 'Python'],
  },
  {
    date: 'Jun – Dec 2025',
    year: '2025',
    role: 'Software Developer',
    company: 'Kamen Yotov',
    location: 'New York',
    summary: 'Built an AI productivity assistant unifying Slack, Trello, Gmail, and Calendar into one workflow.',
    impact: [
      { num: '50%', unit: 'less coordination', note: 'manual time saved' },
      { num: '+40%', unit: 'visibility', note: 'across boards & inbox' },
    ],
    bullets: [
      'AI productivity assistant integrating Slack, Trello, Gmail, Google Calendar, cut manual coordination 50%.',
      'Automation tools for task creation, board management, and Gmail-to-Slack summaries, visibility +40%.',
    ],
    stack: ['Slack Bolt', 'Google APIs', 'Trello', 'Node'],
  },
  {
    date: 'Jul – Dec 2025',
    year: '2025',
    role: 'Software Developer',
    company: 'NY Wealth Planning',
    location: 'New York',
    summary: 'Owned the ISAC website end-to-end, landing pages, webinars, automation, volunteer DB.',
    impact: [
      { num: '1', unit: 'site, end-to-end', note: 'design through deploy' },
    ],
    bullets: [
      'Landing pages, webinar pages with registration & filtering, WhatsApp automation, volunteer databases.',
      'Built UIs and data flows for functional, responsive web apps.',
    ],
    stack: ['React', 'Node', 'WhatsApp API'],
  },
  {
    date: 'Feb – May 2025',
    year: '2025',
    role: 'Software Developer',
    company: 'Futeur AI',
    location: 'New York',
    summary: 'Shipped post-quantum security infrastructure and a real-time threat detection platform.',
    impact: [
      { num: '100%', unit: 'NIST compliance', note: 'CRYSTALS-Kyber/Dilithium' },
      { num: '85%', unit: 'fewer vulns', note: 'after PQ rollout' },
      { num: '+70%', unit: 'retention', note: 'from analytics dashboards' },
    ],
    bullets: [
      'Microservices on Next.js with CI/CD, 40% perf gain, 75% fewer deploy failures, 65% faster sign-ups via Clerk OAuth.',
      'Post-quantum cryptography (CRYSTALS-Kyber/Dilithium) with plug-and-play DB integration, 100% NIST compliance, 85% vuln reduction.',
      'Security platform integrating OSSEC HIDS, Wazuh, Suricata, 60% fewer false positives, +45% detection accuracy.',
      'Distributed logging on Hyperledger Fabric with analytics dashboards, +70% retention.',
    ],
    stack: ['Next.js', 'Clerk', 'CRYSTALS', 'Wazuh', 'Hyperledger', 'Suricata'],
  },
  {
    date: 'Sep 2024 – May 2025',
    year: '2024',
    role: 'Web Developer',
    company: 'New York University',
    location: 'New York',
    summary: 'Modernized the department site and shipped personalized faculty pages.',
    impact: [
      { num: '+20%', unit: 'engagement', note: 'on the new department site' },
      { num: '+30%', unit: 'accessibility', note: 'across faculty profiles' },
    ],
    bullets: [
      'Department site on Java + React, +20% engagement via load-time and responsive optimizations.',
      'Personalized faculty sites with secure login, custom layouts, +30% accessibility & visibility.',
    ],
    stack: ['Java', 'React', 'OAuth'],
  },
  {
    date: 'Jul 2021 – Aug 2023',
    year: '2021',
    role: 'Cloud Engineer',
    company: 'Cognizant',
    location: 'Hyderabad, India',
    summary: 'Two years on a GCP infrastructure team, pipelines, deploys, and the audit posture underneath.',
    impact: [
      { num: '+35%', unit: 'team efficiency', note: 'after GKE & automation' },
      { num: '+40%', unit: 'deploy speed', note: 'on Cloud Build / Run' },
      { num: '100%', unit: 'audit ready', note: 'IAM + VPC hardening' },
    ],
    bullets: [
      'Scalable GCP infra, Compute Engine, GKE, automated workflows. Team efficiency +35%.',
      'CI/CD on Cloud Build, Cloud Run, Terraform, deploy speed & reliability +40%.',
      'ETL on Dataflow + BigQuery; provisioning on Kubernetes & Deployment Manager.',
      'IAM, VPC peering, firewalls, 100% audit readiness, 30% fewer vulnerabilities.',
    ],
    stack: ['GCP', 'GKE', 'Terraform', 'Dataflow', 'BigQuery', 'Cloud Run'],
  },
];

function ExperienceItem({ item, idx, isOpen, onToggle, registerRef }) {
  const ref = useRef(null);
  useEffect(() => {
    registerRef(idx, ref.current);
  }, [idx]);

  const words = item.company.split(' ');
  return (
    <article className={'exp-card' + (isOpen ? ' open' : '')} ref={ref} data-year={item.year}>
      <header className="exp-card-head" onClick={onToggle}>
        <div className="exp-card-meta">
          <span className="exp-idx">№ {String(idx + 1).padStart(2, '0')}</span>
          <span className="exp-date">{item.date}</span>
          <span className="exp-loc">— {item.location}</span>
        </div>
        <div className="exp-card-title">
          <div className="exp-role">{item.role}</div>
          <h3 className="exp-company">
            {words.map((w, i) =>
              i === words.length - 1
                ? <span key={i} className="it">{w}</span>
                : <span key={i}>{w} </span>
            )}
          </h3>
          <p className="exp-summary">{item.summary}</p>
        </div>
        <button className="exp-toggle" aria-label="toggle" onClick={(e) => { e.stopPropagation(); onToggle(); }}>
          <span className="exp-toggle-label">{isOpen ? 'Collapse' : 'Read on'}</span>
          <span className="exp-toggle-icon">{isOpen ? '−' : '+'}</span>
        </button>
      </header>

      <div
        className="exp-impact"
        style={{ gridTemplateColumns: `repeat(${item.impact.length}, 1fr)` }}
      >
        {item.impact.map((m, i) => (
          <div className="exp-metric" key={i}>
            <div className="exp-metric-num">{m.num}</div>
            <div className="exp-metric-unit">{m.unit}</div>
            <div className="exp-metric-note">{m.note}</div>
          </div>
        ))}
      </div>

      <div className="exp-detail">
        <div className="exp-detail-grid">
          <div className="exp-detail-label">— Notes from the field</div>
          <ul>{item.bullets.map((b, i) => <li key={i}>{b}</li>)}</ul>
        </div>
        <div className="exp-stack">
          <div className="exp-detail-label">— Stack</div>
          <div className="exp-stack-pills">
            {item.stack.map(s => <span key={s}>{s}</span>)}
          </div>
        </div>
      </div>
    </article>
  );
}

function Experience() {
  const [open, setOpen] = useState(0);
  const [activeYear, setActiveYear] = useState(EXPERIENCE[0].year);
  const refs = useRef({});
  const registerRef = useCallback((i, el) => { refs.current[i] = el; }, []);

  // Track which card is currently "in view" to drive year scrubber
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const vh = window.innerHeight;
        let bestIdx = 0;
        let bestDist = Infinity;
        Object.entries(refs.current).forEach(([k, el]) => {
          if (!el) return;
          const r = el.getBoundingClientRect();
          const center = r.top + r.height / 2;
          const dist = Math.abs(center - vh / 2);
          if (dist < bestDist) { bestDist = dist; bestIdx = parseInt(k); }
        });
        setActiveYear(EXPERIENCE[bestIdx]?.year);
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, []);

  // Unique years in chronological order (oldest → newest)
  const years = Array.from(new Set([...EXPERIENCE].reverse().map(e => e.year)));

  return (
    <section className="experience" id="experience" data-screen-label="Experience">
      <div className="section-marker"><span className="num">02</span> Field Notes</div>

      <div className="experience-head">
        <h2><span className="it">Six</span> roles.<br/>One through-line.</h2>
        <p className="lede">Take a vague problem. Define the contract. Ship the system. Repeat across distributed infra, agent platforms, and the boring middleware in between.</p>
      </div>

      <div className="exp-shell">
        <aside className="exp-rail">
          <div className="exp-rail-label">Years</div>
          <ol className="exp-rail-list">
            {years.map(y => (
              <li key={y} className={y === activeYear ? 'active' : ''}>
                <span className="exp-rail-dot"></span>
                <span className="exp-rail-year">{y}</span>
              </li>
            ))}
          </ol>
          <div className="exp-rail-foot">{EXPERIENCE.length} roles · 2021 → now</div>
        </aside>

        <div className="exp-list">
          {EXPERIENCE.map((e, i) => (
            <ExperienceItem
              key={i}
              item={e}
              idx={i}
              isOpen={open === i}
              onToggle={() => setOpen(open === i ? -1 : i)}
              registerRef={registerRef}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { Experience });
