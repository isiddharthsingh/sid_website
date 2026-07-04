// ───── tiny hash router ─────
function useHashRoute() {
  const [route, setRoute] = useState(() => (window.location.hash.replace('#/', '') || 'home'));
  useEffect(() => {
    const onHash = () => {
      setRoute(window.location.hash.replace('#/', '') || 'home');
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  return route;
}

function navigate(to) {
  const target = to ? '#/' + to : '';
  if ((window.location.hash || '') === target) return;
  const el = document.querySelector('.route-fade');
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!el || reduce || window.__routeExiting) {
    window.location.hash = target;
    return;
  }
  // play a short exit animation before the hash change remounts the page
  window.__routeExiting = true;
  el.classList.add('route-exit');
  setTimeout(() => {
    window.__routeExiting = false;
    window.location.hash = target;
  }, 210);
}

Object.assign(window, { useHashRoute, navigate });

// ───── Tweaks defaults
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": "anthropic",
  "grain": 0.06,
  "cursorGlow": true,
  "scrollIntensity": "apple"
}/*EDITMODE-END*/;

const PALETTES = {
  anthropic: { bg: '#F5F0E8', bg2: '#EBE3D5', bg3: '#1A1915', ink: '#1A1915', clay: '#D97757', ink2: '#3D3A33', dim: '#6B6258', faint: '#A89E8F', lineRGB: '26,25,21', label: 'Anthropic Cream' },
  ink:       { bg: '#1A1915', bg2: '#24221D', bg3: '#0F0E0B', ink: '#F5F0E8', clay: '#D97757', ink2: '#D8D2C6', dim: '#A89E8F', faint: '#6B6258', lineRGB: '245,240,232', label: 'Anthropic Ink' },
  clay:      { bg: '#EFE4D2', bg2: '#E0D2BB', bg3: '#2A1A12', ink: '#2A1A12', clay: '#C75A38', ink2: '#4A3327', dim: '#7A6355', faint: '#A89484', lineRGB: '42,26,18', label: 'Burnt Clay' },
  slate:     { bg: '#E8E6E1', bg2: '#D8D5CE', bg3: '#1F2024', ink: '#1F2024', clay: '#9A6B4A', ink2: '#3C3E45', dim: '#6B6E78', faint: '#A3A6AD', lineRGB: '31,32,36', label: 'Quiet Slate' },
};

function applyPalette(key) {
  const p = PALETTES[key] || PALETTES.anthropic;
  const root = document.documentElement;
  root.style.setProperty('--bg', p.bg);
  root.style.setProperty('--bg-2', p.bg2);
  root.style.setProperty('--bg-3', p.bg3);
  root.style.setProperty('--ink', p.ink);
  root.style.setProperty('--clay', p.clay);
  root.style.setProperty('--ink-2', p.ink2);
  root.style.setProperty('--ink-dim', p.dim);
  root.style.setProperty('--ink-faint', p.faint);
  root.style.setProperty('--line', 'rgba(' + p.lineRGB + ',0.14)');
  root.style.setProperty('--line-strong', 'rgba(' + p.lineRGB + ',0.32)');
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', p.bg);
}

function HomeIndex() {
  const items = [
    { id: 'experience', num: '02', t: 'Work', s: 'Six roles. Four years. Built things that stayed up.' },
    { id: 'projects',   num: '03', t: 'Projects', s: 'Pipelines, agents, and serverless concierges.' },
    { id: 'tools',      num: '04', t: 'Tools', s: 'The workshop, languages, infra, and AI stack.' },
    { id: 'github',     num: '05', t: 'GitHub', s: 'Live commits, repos, and contribution heatmap.' },
    { id: 'resume',     num: '06', t: 'Resume', s: 'Two pages. The CV uncut.' },
    { id: 'contact',    num: '07', t: 'Contact', s: 'Email, phone, LinkedIn, direct lines.' },
  ];
  return (
    <section className="home-index" data-screen-label="Index">
      <div className="section-marker"><span className="num">—</span> Index</div>
      <div className="home-index-head">
        <h2>Six <span className="it">chapters.</span></h2>
        <p>Each section is its own page. Pick one.</p>
      </div>
      <div className="home-index-grid">
        {items.map(i => (
          <a key={i.id} className="home-index-card" href={'#/' + i.id} onClick={(e) => { e.preventDefault(); navigate(i.id); }}>
            <div className="hc-num">§ {i.num}</div>
            <div className="hc-title">{i.t}</div>
            <div className="hc-sub">{i.s}</div>
            <div className="hc-arrow">↗</div>
          </a>
        ))}
      </div>
    </section>
  );
}

function PageWrap({ children }) {
  return <main className="page">{children}</main>;
}

const KNOWN_ROOTS = ['', 'home', 'about', 'experience', 'projects', 'tools', 'github', 'resume', 'contact'];

function NotFound({ route }) {
  const suggestions = [
    { id: '', label: 'home' },
    { id: 'about', label: 'about' },
    { id: 'experience', label: 'work' },
    { id: 'projects', label: 'projects' },
    { id: 'resume', label: 'resume' },
    { id: 'contact', label: 'contact' },
  ];
  return (
    <main className="page nf" data-screen-label="404">
      <div className="nf-term">
        <div className="nf-bar"><span></span><span></span><span></span><em>siddharth — zsh</em></div>
        <div className="nf-body">
          <div><span className="nf-p">$</span>open "#/{route}"</div>
          <div className="nf-err">zsh: no such chapter: {route}</div>
          <div>did you mean one of these?</div>
          <div className="nf-suggest">
            {suggestions.map((s) => (
              <button key={s.label} onClick={() => navigate(s.id)}>cd ~/{s.label}</button>
            ))}
          </div>
          <div><span className="nf-p">$</span><span className="nf-cursor"></span></div>
        </div>
      </div>
    </main>
  );
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const route = useHashRoute();

  // ── Lean 2026 motion stack: Lenis smooth scroll, global
  useLenis(t.scrollIntensity);

  // Wire the "Scroll" tweak (apple / subtle) to Lenis live
  useEffect(() => { window.__setScrollIntensity && window.__setScrollIntensity(t.scrollIntensity); }, [t.scrollIntensity]);

  // Signal the static preloader that the app has rendered
  useEffect(() => {
    const id = requestAnimationFrame(() => { window.__appReady = true; });
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => { applyPalette(t.palette); }, [t.palette]);
  useEffect(() => {
    const g = document.getElementById('grain');
    if (g) g.style.opacity = String(t.grain);
  }, [t.grain]);

  useEffect(() => {
    const el = document.getElementById('cursor-glow');
    if (!el) return;
    if (!t.cursorGlow) { el.style.opacity = '0'; return; }
    const onMove = (e) => {
      el.style.opacity = '1';
      el.style.left = e.clientX + 'px';
      el.style.top = e.clientY + 'px';
    };
    const onLeave = () => { el.style.opacity = '0'; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
    };
  }, [t.cursorGlow]);

  const root = (route || '').split('/')[0];
  const slug = (route || '').split('/')[1];
  let page;
  switch (root) {
    case 'experience': page = <PageWrap><Experience /></PageWrap>; break;
    case 'projects':
      page = slug
        ? <PageWrap><ProjectDetail slug={slug} /></PageWrap>
        : <PageWrap><Projects /></PageWrap>;
      break;
    case 'tools':      page = <PageWrap><Tools /></PageWrap>; break;
    case 'github':     page = <PageWrap><Github /></PageWrap>; break;
    case 'resume':     page = <PageWrap><Resume /></PageWrap>; break;
    case 'contact':    page = <PageWrap><Contact /></PageWrap>; break;
    case 'about':      page = <PageWrap><About /></PageWrap>; break;
    default:
      page = KNOWN_ROOTS.includes(root) ? (
        <>
          <Hero />
          <About />
          <HomeIndex />
        </>
      ) : (
        <NotFound route={route} />
      );
  }

  return (
    <>
      <Nav
        route={route}
        palette={t.palette}
        onToggleTheme={() => setTweak('palette', t.palette === 'ink' ? 'anthropic' : 'ink')}
      />
      <CommandPalette palette={t.palette} setTweak={setTweak} />
      <ScrollProgress />
      <MotionEnhancers route={route} />
      <div className="route-fade" key={route}>
        {page}
      </div>

      <ChatBot />

      <TweaksPanel title="Tweaks">
        <TweakSection label="Palette">
          <TweakSelect
            label="Color system"
            value={t.palette}
            onChange={(v) => setTweak('palette', v)}
            options={Object.entries(PALETTES).map(([k, v]) => ({ value: k, label: v.label }))}
          />
        </TweakSection>
        <TweakSection label="Atmosphere">
          <TweakSlider label="Grain" min={0} max={0.4} step={0.01} value={t.grain} onChange={(v) => setTweak('grain', v)} />
          <TweakToggle label="Cursor glow" value={t.cursorGlow} onChange={(v) => setTweak('cursorGlow', v)} />
        </TweakSection>
        <TweakSection label="Motion">
          <TweakRadio label="Scroll" value={t.scrollIntensity} onChange={(v) => setTweak('scrollIntensity', v)}
            options={[{ value: 'apple', label: 'Apple' }, { value: 'subtle', label: 'Subtle' }]} />
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
