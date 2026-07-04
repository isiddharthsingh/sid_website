// Projects index page, a gallery grid that scales to 20+ projects
// with category filtering and search.

function Projects() {
  const ref = useReveal();
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');

  const categories = React.useMemo(() => {
    const set = new Set(['All']);
    PROJECTS.forEach(p => set.add(p.category));
    return [...set];
  }, []);

  const filtered = PROJECTS.filter(p => {
    const okCat = filter === 'All' || p.category === filter;
    const q = query.trim().toLowerCase();
    const okQ = !q || (
      (p.title + ' ' + p.titleIt + ' ' + p.summary + ' ' + p.desc + ' ' + (p.stack || []).join(' '))
        .toLowerCase().includes(q)
    );
    return okCat && okQ;
  });

  return (
    <section className="projects" id="projects" data-screen-label="Projects">
      <div className="section-marker"><span className="num">03</span> Projects</div>

      <div className="projects-head">
        <h2 className="reveal" ref={ref}>Selected <span className="it">works.</span></h2>
        <p className="lede">A catalog of systems shipped, streaming pipelines, multimodal AI, conversational interfaces, agent platforms. Filter by category or search by name and stack.</p>
      </div>

      {/* Toolbar */}
      <div className="proj-toolbar">
        <div className="proj-filters">
          {categories.map(c => (
            <button
              key={c}
              className={'proj-filter' + (filter === c ? ' active' : '')}
              onClick={() => setFilter(c)}
            >
              {c}
              <span className="proj-filter-count">
                {c === 'All' ? PROJECTS.length : PROJECTS.filter(p => p.category === c).length}
              </span>
            </button>
          ))}
        </div>
        <div className="proj-search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
          <input
            type="search"
            placeholder="Search by name, stack, or keyword"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Grid */}
      <div className="proj-grid">
        {filtered.map((p, i) => (
          <ProjectCard key={p.slug} project={p} index={i} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="proj-empty">
          <div className="proj-empty-num">000</div>
          <div className="proj-empty-msg">No matches. Try a different filter or query.</div>
        </div>
      )}

      {/* Footer count */}
      <div className="proj-footer">
        <span className="mono dim">— Showing {filtered.length} of {PROJECTS.length}</span>
        <span className="mono dim">More on GitHub →</span>
      </div>
    </section>
  );
}

function ProjectCard({ project, index }) {
  const ref = useReveal();
  return (
    <a
      ref={ref}
      className="reveal proj-card"
      href={`#/projects/${project.slug}`}
      onClick={(e) => { e.preventDefault(); navigate('projects/' + project.slug); }}
      style={{ '--reveal-delay': (index * 60) + 'ms' }}
    >
      <div className="proj-card-thumb">
        <ProjectThumb accent={project.accent} />
      </div>
      <div className="proj-card-body">
        <div className="proj-card-meta">
          <span className="mono dim">§ {project.num} · {project.year}</span>
          <span className="mono dim">{project.category}</span>
        </div>
        <h3 className="proj-card-title">
          {project.title}<span className="it"> {project.titleIt}</span>
        </h3>
        <p className="proj-card-sum">{project.summary}</p>
        <div className="proj-card-stack">
          {(project.stack || []).slice(0, 4).map(s => <span key={s}>{s}</span>)}
          {project.stack && project.stack.length > 4 && (
            <span className="more">+{project.stack.length - 4}</span>
          )}
        </div>
        <div className="proj-card-cta">Read case <span className="arr">↗</span></div>
      </div>
    </a>
  );
}

// Tiny accent thumbnail per project, abstract, no faked screenshots.
function ProjectThumb({ accent }) {
  if (accent === 'terminal') {
    return (
      <svg viewBox="0 0 200 130" className="thumb-svg" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="tg" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="var(--clay)" stopOpacity="0.15"/>
            <stop offset="1" stopColor="var(--clay)" stopOpacity="0"/>
          </linearGradient>
        </defs>
        <rect width="200" height="130" fill="url(#tg)"/>
        {Array.from({length: 28}, (_, i) => {
          const x = 14 + i * 6.5;
          const h = 8 + Math.abs(Math.sin(i * 0.6) * 32);
          const up = Math.sin(i * 0.6) > 0;
          return <rect key={i} x={x} y={70 - h/2} width="3.5" height={h} fill={up ? '#7BA98A' : 'var(--clay)'} opacity="0.85"/>
        })}
        <line x1="14" x2="186" y1="84" y2="84" stroke="var(--clay)" strokeWidth="0.5" strokeDasharray="2 3" opacity="0.6"/>
        <text x="14" y="112" fontFamily="ui-monospace, monospace" fontSize="7" fill="currentColor" opacity="0.55">BTC-USD · 1m · live</text>
      </svg>
    );
  }
  if (accent === 'story') {
    return (
      <svg viewBox="0 0 200 130" className="thumb-svg" preserveAspectRatio="xMidYMid slice">
        <rect width="200" height="130" fill="var(--bg-2)"/>
        {/* polaroid */}
        <g transform="translate(28 18) rotate(-4)">
          <rect width="64" height="76" fill="var(--bg)" stroke="currentColor" strokeOpacity="0.2"/>
          <rect x="4" y="4" width="56" height="50" fill="var(--clay)" opacity="0.55"/>
          <circle cx="48" cy="20" r="7" fill="#F7E2B5" opacity="0.85"/>
          <line x1="4" y1="40" x2="60" y2="40" stroke="currentColor" strokeOpacity="0.3" strokeWidth="0.6"/>
        </g>
        {/* arrow */}
        <text x="104" y="62" fontFamily="ui-serif, Georgia, serif" fontSize="14" fill="currentColor" opacity="0.5">→</text>
        {/* story lines */}
        <g transform="translate(120 26)" opacity="0.7">
          {Array.from({length: 7}, (_, i) => (
            <rect key={i} x="0" y={i*9} width={i % 3 === 2 ? 36 : 60} height="2.5" fill="currentColor" opacity={0.3 + (i*0.05)}/>
          ))}
        </g>
      </svg>
    );
  }
  if (accent === 'dining') {
    return (
      <svg viewBox="0 0 200 130" className="thumb-svg" preserveAspectRatio="xMidYMid slice">
        <rect width="200" height="130" fill="var(--bg-2)"/>
        {/* phone */}
        <g transform="translate(20 18)">
          <rect width="64" height="96" rx="8" fill="var(--bg)" stroke="currentColor" strokeOpacity="0.18"/>
          <rect x="6" y="14" width="38" height="9" rx="4" fill="currentColor" opacity="0.18"/>
          <rect x="20" y="28" width="38" height="9" rx="4" fill="var(--clay)" opacity="0.7"/>
          <rect x="6" y="42" width="44" height="9" rx="4" fill="currentColor" opacity="0.18"/>
          <rect x="20" y="56" width="32" height="9" rx="4" fill="var(--clay)" opacity="0.7"/>
        </g>
        {/* map */}
        <g transform="translate(98 18)">
          <rect width="84" height="96" fill="var(--bg)" stroke="currentColor" strokeOpacity="0.18"/>
          <line x1="0" x2="84" y1="34" y2="34" stroke="currentColor" strokeOpacity="0.15"/>
          <line x1="0" x2="84" y1="62" y2="62" stroke="currentColor" strokeOpacity="0.15"/>
          <line x1="32" x2="32" y1="0" y2="96" stroke="currentColor" strokeOpacity="0.15"/>
          <line x1="58" x2="58" y1="0" y2="96" stroke="currentColor" strokeOpacity="0.15"/>
          {[[20,22],[48,46],[60,72]].map(([x,y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r="4.5" fill="var(--clay)"/>
              <text x={x} y={y+1.6} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="4.5" fill="var(--bg)">{i+1}</text>
            </g>
          ))}
        </g>
      </svg>
    );
  }
  // default
  return (
    <svg viewBox="0 0 200 130" className="thumb-svg" preserveAspectRatio="xMidYMid slice">
      <rect width="200" height="130" fill="var(--bg-2)"/>
      <circle cx="100" cy="65" r="40" fill="var(--clay)" opacity="0.4"/>
    </svg>
  );
}

// ─────────────────────────────────────────────
// PROJECT DETAIL PAGE
// ─────────────────────────────────────────────
function ProjectDetail({ slug }) {
  const project = PROJECTS.find(p => p.slug === slug);
  const ref = useReveal();

  // sibling navigation
  const idx = PROJECTS.findIndex(p => p.slug === slug);
  const prev = idx > 0 ? PROJECTS[idx - 1] : null;
  const next = idx < PROJECTS.length - 1 ? PROJECTS[idx + 1] : null;

  if (!project) {
    return (
      <section className="proj-detail" data-screen-label="Project · 404">
        <div className="proj-detail-head">
          <a className="proj-back" href="#/projects" onClick={(e) => { e.preventDefault(); navigate('projects'); }}>← All projects</a>
          <h2>Not found.</h2>
          <p className="lede">No project matches that slug.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="proj-detail" data-screen-label={`Project · ${project.title}`}>
      <div className="section-marker"><span className="num">03 · {project.num}</span> Project</div>

      <div className="proj-detail-head reveal" ref={ref}>
        <a className="proj-back" href="#/projects" onClick={(e) => { e.preventDefault(); navigate('projects'); }}>← All projects</a>

        <div className="proj-detail-meta">
          <span>{project.year}</span>
          <span className="dot-sep">·</span>
          <span>{project.category}</span>
          <span className="dot-sep">·</span>
          <span>{project.role}</span>
        </div>

        <h1 className="proj-detail-title">
          {project.title}<span className="it"> {project.titleIt}.</span>
        </h1>

        <p className="proj-detail-lede">{project.desc}</p>

        <div className="proj-detail-actions">
          {project.links?.github && (
            <a className="btn btn-primary" href={project.links.github} target="_blank" rel="noreferrer">
              View on GitHub <span className="arr">↗</span>
            </a>
          )}
          {project.links?.demo && (
            <a className="btn btn-secondary" href={project.links.demo} target="_blank" rel="noreferrer">
              Live demo <span className="arr">↗</span>
            </a>
          )}
        </div>
      </div>

      {/* Featured visual */}
      <div className="proj-detail-hero">
        <div className="proj-detail-hero-frame">
          <ProjectFeaturedViz slug={project.slug} />
        </div>
      </div>

      {/* Body grid: left = highlights, right = stack */}
      <div className="proj-detail-grid">
        <div>
          <div className="proj-detail-eyebrow">— Highlights</div>
          <ul className="proj-detail-list">
            {(project.highlights || []).map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
        </div>
        <aside>
          <div className="proj-detail-eyebrow">— Stack</div>
          <ul className="proj-detail-stack">
            {(project.stack || []).map(s => <li key={s}>{s}</li>)}
          </ul>
        </aside>
      </div>

      {/* Prev / Next */}
      <div className="proj-pager">
        <a
          className={'proj-pager-cell' + (prev ? '' : ' disabled')}
          href={prev ? `#/projects/${prev.slug}` : '#'}
          onClick={(e) => { e.preventDefault(); if (prev) navigate('projects/' + prev.slug); }}
        >
          <span className="dir">← Previous</span>
          {prev ? (
            <span className="proj-pager-title">{prev.title}<span className="it"> {prev.titleIt}</span></span>
          ) : (
            <span className="proj-pager-title dim">Beginning</span>
          )}
        </a>
        <a
          className={'proj-pager-cell right' + (next ? '' : ' disabled')}
          href={next ? `#/projects/${next.slug}` : '#'}
          onClick={(e) => { e.preventDefault(); if (next) navigate('projects/' + next.slug); }}
        >
          <span className="dir">Next →</span>
          {next ? (
            <span className="proj-pager-title">{next.title}<span className="it"> {next.titleIt}</span></span>
          ) : (
            <span className="proj-pager-title dim">End of catalog</span>
          )}
        </a>
      </div>
    </section>
  );
}

// Pick the right featured viz per project
function ProjectFeaturedViz({ slug }) {
  if (slug === 'cryptostream-ai') return <VizTerminal />;
  if (slug === 'taleweaver') return <VizStory />;
  if (slug === 'dining-concierge') return <VizDining />;
  // generic placeholder for future projects
  return (
    <div className="proj-generic-hero">
      <div className="proj-generic-monogram">
        <span>S</span>
      </div>
      <div className="proj-generic-cap">No live demo yet, see GitHub for details.</div>
    </div>
  );
}

Object.assign(window, { Projects, ProjectDetail });
