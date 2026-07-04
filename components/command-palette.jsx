// ⌘K command palette — chapters, projects, and quick actions.
// Opens via ⌘K / Ctrl+K, the nav button, or a 'cmdk:open' window event.

const CMDK_EMAIL = 'sms10221@nyu.edu';

function cmdkMatch(label, q) {
  if (!q) return true;
  const l = label.toLowerCase(), s = q.toLowerCase().trim();
  if (l.includes(s)) return true;
  // subsequence fallback: "gh" → "GitHub"
  let i = 0;
  for (const ch of l) { if (ch === s[i]) i++; if (i === s.length) return true; }
  return false;
}

function CommandPalette({ palette, setTweak }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const isMac = /mac/i.test(navigator.platform || '');

  const close = () => { setOpen(false); setQ(''); setSel(0); setCopied(false); };

  // global shortcuts + nav-button event
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && String(e.key).toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
        setQ(''); setSel(0); setCopied(false);
      } else if (e.key === 'Escape') {
        close();
      }
    };
    const onOpen = () => { setOpen(true); setQ(''); setSel(0); setCopied(false); };
    window.addEventListener('keydown', onKey);
    window.addEventListener('cmdk:open', onOpen);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('cmdk:open', onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => { if (inputRef.current) inputRef.current.focus(); }, 30);
  }, [open]);

  // ── build item list (fresh each render; cheap)
  const dark = palette === 'ink';
  const chapters = [
    { g: 'Chapters', label: 'Home', hint: '§ 00', run: () => navigate('') },
    { g: 'Chapters', label: 'About', hint: '§ 01', run: () => navigate('about') },
    { g: 'Chapters', label: 'Work', hint: '§ 02', run: () => navigate('experience') },
    { g: 'Chapters', label: 'Projects', hint: '§ 03', run: () => navigate('projects') },
    { g: 'Chapters', label: 'Tools', hint: '§ 04', run: () => navigate('tools') },
    { g: 'Chapters', label: 'GitHub', hint: '§ 05', run: () => navigate('github') },
    { g: 'Chapters', label: 'Resume', hint: '§ 06', run: () => navigate('resume') },
    { g: 'Chapters', label: 'Contact', hint: '§ 07', run: () => navigate('contact') },
  ];
  const projects = (window.PROJECTS || []).map((p) => ({
    g: 'Projects',
    label: (p.title || '') + (p.titleIt || ''),
    hint: p.year || '',
    run: () => navigate('projects/' + p.slug),
  }));
  const actions = [
    { g: 'Actions', label: dark ? 'Switch to light mode' : 'Switch to dark mode', hint: '◐',
      run: () => setTweak('palette', dark ? 'anthropic' : 'ink') },
    { g: 'Actions', label: copied ? 'Copied ✓' : 'Copy email — ' + CMDK_EMAIL, hint: '⧉', stay: true,
      run: () => {
        const done = () => { setCopied(true); setTimeout(close, 900); };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(CMDK_EMAIL).then(done, done);
        } else { done(); }
      } },
    { g: 'Actions', label: 'Download resume (PDF)', hint: '↓',
      run: () => window.open('assets/Siddharth_Singh_Resume.pdf', '_blank') },
    { g: 'Actions', label: 'GitHub profile', hint: '↗',
      run: () => window.open('https://github.com/isiddharthsingh', '_blank') },
    { g: 'Actions', label: 'LinkedIn', hint: '↗',
      run: () => window.open('https://linkedin.com/in/isiddharthsingh', '_blank') },
  ];
  const flat = [...chapters, ...projects, ...actions].filter((it) => cmdkMatch(it.label + ' ' + it.g, q));

  const runItem = (it) => {
    if (it.stay) { it.run(); return; }
    close();
    it.run();
  };

  const onInputKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSel((s) => (s + 1) % Math.max(flat.length, 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSel((s) => (s - 1 + Math.max(flat.length, 1)) % Math.max(flat.length, 1)); }
    else if (e.key === 'Enter' && flat[sel]) { e.preventDefault(); runItem(flat[sel]); }
  };

  // keep selection visible (manual scroll — no scrollIntoView)
  useEffect(() => {
    const list = listRef.current; if (!list) return;
    const el = list.querySelector('[data-idx="' + sel + '"]'); if (!el) return;
    if (el.offsetTop < list.scrollTop + 8) list.scrollTop = el.offsetTop - 8;
    else if (el.offsetTop + el.offsetHeight > list.scrollTop + list.clientHeight - 8)
      list.scrollTop = el.offsetTop + el.offsetHeight - list.clientHeight + 8;
  }, [sel, q]);

  if (!open) return null;

  // group rows for rendering, tracking flat index
  let idx = -1;
  let lastGroup = null;
  const rows = [];
  flat.forEach((it) => {
    idx++;
    if (it.g !== lastGroup) {
      lastGroup = it.g;
      rows.push(<div key={'g-' + it.g} className="cmdk-group">{it.g}</div>);
    }
    const i = idx;
    rows.push(
      <div
        key={it.g + '-' + it.label}
        className={'cmdk-item' + (i === sel ? ' sel' : '')}
        data-idx={i}
        onMouseEnter={() => setSel(i)}
        onClick={() => runItem(it)}
      >
        <span className="cmdk-label">{it.label}</span>
        <span className="cmdk-hint mono">{it.hint}</span>
      </div>
    );
  });

  return (
    <div className="cmdk-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}>
      <div className="cmdk" role="dialog" aria-modal="true" aria-label="Command palette">
        <div className="cmdk-input-row">
          <span className="cmdk-prompt mono">›</span>
          <input
            ref={inputRef}
            value={q}
            placeholder="Type a chapter, project, or action…"
            onChange={(e) => { setQ(e.target.value); setSel(0); }}
            onKeyDown={onInputKey}
            spellCheck="false"
          />
          <span className="cmdk-esc mono">esc</span>
        </div>
        <div className="cmdk-list" ref={listRef}>
          {rows.length > 0 ? rows : <div className="cmdk-empty mono">no matches — try “work” or “resume”</div>}
        </div>
        <div className="cmdk-foot mono">↑↓ navigate · ↵ open · {isMac ? '⌘' : 'ctrl'} K toggle</div>
      </div>
    </div>
  );
}

Object.assign(window, { CommandPalette });
