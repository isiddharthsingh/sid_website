// The dossier + guardrails live server-side in netlify/functions/chat.mjs —
// the client only ships the live GitHub/projects context along with the chat.

// Pulls the live status the About section publishes, plus the project
// catalog, into a fresh context block on every turn, so SIDCLAW answers
// with what Siddharth is doing *right now*, not just the static resume.
function buildLiveContext() {
  const parts = [];
  const live = (typeof window !== 'undefined' && window.__siddLive) || null;
  if (live) {
    parts.push(
      `LIVE, RIGHT NOW (auto-synced from GitHub, as of ${live.syncedAt}):\n${live.text}`
    );
    if (live.upNext) parts.push(`UP NEXT / NORTH STAR:\n${live.upNext}`);
  }
  const projects = (typeof window !== 'undefined' && window.PROJECTS) || null;
  if (Array.isArray(projects) && projects.length) {
    const lines = projects.map(p =>
      `- ${p.title}${p.titleIt ? ' ' + p.titleIt : ''} (${p.year}, ${p.category}): ${p.desc} Stack: ${(p.stack || []).join(', ')}.${p.links?.github ? ' Repo: ' + p.links.github : ''}`
    );
    parts.push('PROJECT CATALOG (from the Projects page):\n' + lines.join('\n'));
  }
  return parts.length ? '\n\nLIVE CONTEXT (prefer this over the static dossier when they overlap):\n' + parts.join('\n\n') : '';
}

function ChatBot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [msgs, setMsgs] = useState([
    { role: 'assistant', text: "Hi, I'm SIDCLAW. I'm wired into every page here plus Siddharth's live GitHub activity, so ask me what he's shipping right now, his stack, projects, or experience." },
  ]);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [msgs, open, busy]);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const send = async (text) => {
    const q = (text || input).trim();
    if (!q || busy) return;
    setInput('');
    const next = [...msgs, { role: 'user', text: q }];
    setMsgs(next);
    setBusy(true);

    try {
      const history = next
        .filter(m => m.role !== 'system')
        .map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.text }));

      const res = await fetch('/.netlify/functions/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, live: buildLiveContext() }),
      });
      if (!res.ok) throw new Error('chat backend ' + res.status);
      const data = await res.json();
      setMsgs(m => [...m, { role: 'assistant', text: data.reply || '…' }]);
    } catch (e) {
      setMsgs(m => [...m, { role: 'assistant', text: "Couldn't reach the model. Try again in a sec." }]);
    } finally {
      setBusy(false);
    }
  };

  const suggestions = [
    'What is Siddharth shipping right now?',
    'Any recent PRs or commits?',
    'What AI projects has he built?',
    'How can I contact him?',
  ];

  return (
    <>
      <button
        className={'sidd-fab' + (open ? ' open' : '')}
        onClick={() => setOpen(o => !o)}
        aria-label="Open assistant"
      >
        <span className="sidd-fab-dot"></span>
        <span className="sidd-fab-label">{open ? 'Close' : 'Ask SIDCLAW'}</span>
      </button>

      <div className={'sidd-chat' + (open ? ' open' : '')} role="dialog" aria-label="SIDCLAW assistant">
        <div className="sidd-chat-head">
          <div>
            <div className="sidd-chat-name">SIDCLAW <span className="sidd-live"></span></div>
            <div className="sidd-chat-sub">Live-synced · every page + GitHub</div>
          </div>
          <button className="sidd-chat-x" onClick={() => setOpen(false)} aria-label="Close">×</button>
        </div>

        <div className="sidd-chat-body" ref={scrollRef} data-lenis-prevent>
          {msgs.map((m, i) => (
            <div key={i} className={'sidd-msg sidd-msg-' + m.role}>
              {m.role === 'assistant' && <div className="sidd-msg-tag">SIDCLAW</div>}
              <div className="sidd-msg-text">{m.text}</div>
            </div>
          ))}
          {busy && (
            <div className="sidd-msg sidd-msg-assistant">
              <div className="sidd-msg-tag">SIDCLAW</div>
              <div className="sidd-msg-text"><span className="sidd-typing"><i></i><i></i><i></i></span></div>
            </div>
          )}
        </div>

        {msgs.length < 3 && !busy && (
          <div className="sidd-chips">
            {suggestions.map(s => (
              <button key={s} className="sidd-chip" onClick={() => send(s)}>{s}</button>
            ))}
          </div>
        )}

        <form
          className="sidd-chat-input"
          onSubmit={(e) => { e.preventDefault(); send(); }}
        >
          <input
            ref={inputRef}
            type="text"
            placeholder="Ask about Siddharth…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={busy}
          />
          <button type="submit" disabled={busy || !input.trim()} aria-label="Send">→</button>
        </form>
      </div>
    </>
  );
}

Object.assign(window, { ChatBot });
