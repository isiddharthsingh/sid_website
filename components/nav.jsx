function Nav({ route, palette, onToggleTheme }) {
  const [time, setTime] = useState('');
  const [open, setOpen] = useState(false);
  const isMac = /mac/i.test(navigator.platform || '');
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const opts = { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', hour12: false };
      setTime(new Intl.DateTimeFormat('en-US', opts).format(d) + ' NYC');
    };
    tick();
    const id = setInterval(tick, 1000 * 30);
    return () => clearInterval(id);
  }, []);

  // close on route change
  useEffect(() => { setOpen(false); }, [route]);

  const links = [
    { id: 'about',      label: '01 / About' },
    { id: 'experience', label: '02 / Work' },
    { id: 'projects',   label: '03 / Projects' },
    { id: 'tools',      label: '04 / Tools' },
    { id: 'github',     label: '05 / GitHub' },
    { id: 'resume',     label: '06 / Resume' },
    { id: 'contact',    label: '07 / Contact' },
  ];

  const goto = (id) => (e) => {
    e.preventDefault();
    setOpen(false);
    navigate(id === 'home' ? '' : id);
  };

  // route active state — projects/<slug> still highlights "Projects"
  const activeRoot = (route || '').split('/')[0];

  return (
    <nav className="nav">
      <a href="#" onClick={goto('home')} className="nav-logo">Siddharth.</a>
      <div className={'nav-links' + (open ? ' open' : '')}>
        {links.map(l => (
          <a
            key={l.id}
            href={'#/' + l.id}
            onClick={goto(l.id)}
            className={activeRoot === l.id ? 'active' : ''}
          >{l.label}</a>
        ))}
      </div>
      <div className="nav-right">
        <button
          className="nav-cmdk"
          aria-label="Open command menu"
          title={(isMac ? '⌘' : 'Ctrl+') + 'K'}
          onClick={() => window.dispatchEvent(new CustomEvent('cmdk:open'))}
        >
          <span>{isMac ? '⌘' : 'ctrl'}</span><span>K</span>
        </button>
        <button
          className="nav-theme"
          aria-label={palette === 'ink' ? 'Switch to light mode' : 'Switch to dark mode'}
          title="Toggle theme"
          onClick={onToggleTheme}
        >◐</button>
        <div className="nav-clock">
          <span className="dot"></span>
          <span>{time}</span>
        </div>
      </div>
      <button
        className={'nav-burger' + (open ? ' open' : '')}
        aria-label="Menu"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <span></span><span></span><span></span>
      </button>
    </nav>
  );
}

Object.assign(window, { Nav });
