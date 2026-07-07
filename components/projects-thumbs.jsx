// Abstract SVG thumbnails for the project catalog — one bespoke drawing per
// accent, same visual language as the three originals in projects.jsx:
// var(--clay) accents, currentColor strokes at low opacity, mono captions.
// Registered in PROJECT_THUMBS; ProjectThumb (projects.jsx) checks here first.

// FuteurSecure — post-quantum lattice field behind a shield
function ThumbShield() {
  return (
    <svg viewBox="0 0 200 130" className="thumb-svg" preserveAspectRatio="xMidYMid slice">
      <rect width="200" height="130" fill="var(--bg-2)"/>
      {Array.from({ length: 60 }, (_, i) => (
        <circle key={i} cx={20 + (i % 12) * 15} cy={16 + Math.floor(i / 12) * 16} r="1" fill="currentColor" opacity="0.14"/>
      ))}
      <path d="M100 18 L128 29 V58 C128 77 115 89 100 95 C85 89 72 77 72 58 V29 Z" fill="var(--bg)" stroke="var(--clay)" strokeWidth="1.6"/>
      <path d="M100 31 L115 38 V57 C115 68 108 75 100 79 C92 75 85 68 85 57 V38 Z" fill="var(--clay)" opacity="0.22"/>
      <circle cx="100" cy="53" r="5" fill="none" stroke="var(--clay)" strokeWidth="1.4"/>
      <line x1="100" y1="58" x2="100" y2="67" stroke="var(--clay)" strokeWidth="1.4"/>
      <text x="14" y="112" fontFamily="ui-monospace, monospace" fontSize="7" fill="currentColor" opacity="0.55">KYBER · DILITHIUM · NIST</text>
    </svg>
  );
}

// Futeur Vault — vault dial beside credential rows, one password revealed
function ThumbVault() {
  return (
    <svg viewBox="0 0 200 130" className="thumb-svg" preserveAspectRatio="xMidYMid slice">
      <rect width="200" height="130" fill="var(--bg-2)"/>
      <g transform="translate(56 58)">
        <circle r="33" fill="var(--bg)" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.2"/>
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1="0" y1="-29" x2="0" y2="-24" stroke="currentColor" strokeOpacity="0.3" transform={`rotate(${i * 30})`}/>
        ))}
        <circle r="15" fill="none" stroke="var(--clay)" strokeWidth="1.6"/>
        <g stroke="var(--clay)" strokeWidth="1.6">
          <line y1="-15" y2="-7"/><line y1="15" y2="7"/>
          <line x1="-15" x2="-7"/><line x1="15" x2="7"/>
        </g>
        <circle r="3.5" fill="var(--clay)"/>
      </g>
      <g transform="translate(106 28)">
        {[0, 1, 2].map(i => (
          <g key={i} transform={`translate(0 ${i * 21})`}>
            <rect width="78" height="15" rx="3" fill="var(--bg)" stroke="currentColor" strokeOpacity="0.16"/>
            <circle cx="9" cy="7.5" r="3" fill="var(--clay)" opacity={0.45 + i * 0.22}/>
            {i === 1 ? (
              <text x="18" y="10" fontFamily="ui-monospace, monospace" fontSize="6.5" fill="var(--clay)">Kx9#mQ2v</text>
            ) : (
              Array.from({ length: 8 }, (_, d) => <circle key={d} cx={20 + d * 6.5} cy="7.5" r="1.3" fill="currentColor" opacity="0.4"/>)
            )}
          </g>
        ))}
      </g>
      <text x="14" y="112" fontFamily="ui-monospace, monospace" fontSize="7" fill="currentColor" opacity="0.55">SUPABASE · SHARED · REVOCABLE</text>
    </svg>
  );
}

// ISAC USA — globe with connection arcs between student nodes
function ThumbGlobe() {
  return (
    <svg viewBox="0 0 200 130" className="thumb-svg" preserveAspectRatio="xMidYMid slice">
      <defs>
        <clipPath id="isacClip"><circle cx="100" cy="60" r="38"/></clipPath>
      </defs>
      <rect width="200" height="130" fill="var(--bg-2)"/>
      <circle cx="100" cy="60" r="38" fill="var(--bg)" stroke="currentColor" strokeOpacity="0.3"/>
      <g fill="none" stroke="currentColor">
        <ellipse cx="100" cy="60" rx="15" ry="38" strokeOpacity="0.15"/>
        <ellipse cx="100" cy="60" rx="28" ry="38" strokeOpacity="0.1"/>
        <g clipPath="url(#isacClip)">
          <ellipse cx="100" cy="42" rx="50" ry="9" strokeOpacity="0.13"/>
          <line x1="62" y1="60" x2="138" y2="60" strokeOpacity="0.16"/>
          <ellipse cx="100" cy="78" rx="50" ry="9" strokeOpacity="0.13"/>
        </g>
      </g>
      <g fill="none" stroke="var(--clay)" strokeWidth="0.9" opacity="0.85">
        <path d="M78 48 Q 100 26 124 44"/>
        <path d="M84 76 Q 108 60 128 68"/>
        <path d="M124 44 Q 130 58 128 68"/>
      </g>
      {[[78, 48], [124, 44], [84, 76], [128, 68]].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="4" fill="var(--clay)" opacity="0.25"/>
          <circle cx={x} cy={y} r="1.8" fill="var(--clay)"/>
        </g>
      ))}
      <text x="14" y="112" fontFamily="ui-monospace, monospace" fontSize="7" fill="currentColor" opacity="0.55">ISAC-USA.ORG · LIVE</text>
    </svg>
  );
}

// AI Market Analysis — Airflow DAG: three sources → ETL → warehouse
function ThumbDag() {
  const sources = [{ y: 30, l: 'reddit' }, { y: 56, l: 'github' }, { y: 82, l: 'coingecko' }];
  return (
    <svg viewBox="0 0 200 130" className="thumb-svg" preserveAspectRatio="xMidYMid slice">
      <rect width="200" height="130" fill="var(--bg-2)"/>
      <g fill="none" stroke="currentColor" strokeOpacity="0.3">
        {sources.map(s => <path key={s.l} d={`M48 ${s.y} C 70 ${s.y}, 74 56, 93 56`}/>)}
        <line x1="115" y1="56" x2="140" y2="56"/>
      </g>
      {sources.map(s => (
        <g key={s.l}>
          <circle cx="40" cy={s.y} r="7.5" fill="var(--bg)" stroke="currentColor" strokeOpacity="0.35"/>
          <text x="40" y={s.y - 12} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="6" fill="currentColor" opacity="0.5">{s.l}</text>
        </g>
      ))}
      <circle cx="104" cy="56" r="10" fill="var(--clay)"/>
      <text x="104" y="58.5" textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="5.5" fill="var(--bg)">ETL</text>
      <g transform="translate(144 42)">
        <rect width="30" height="28" rx="4" fill="var(--bg)" stroke="currentColor" strokeOpacity="0.35"/>
        <line x1="4" y1="10" x2="26" y2="10" stroke="currentColor" strokeOpacity="0.25"/>
        <line x1="4" y1="19" x2="26" y2="19" stroke="currentColor" strokeOpacity="0.25"/>
        <circle cx="8" cy="5.5" r="1.2" fill="#7BA98A"/>
      </g>
      <text x="159" y="84" textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="6" fill="currentColor" opacity="0.5">postgres</text>
      <text x="14" y="112" fontFamily="ui-monospace, monospace" fontSize="7" fill="currentColor" opacity="0.55">3 DAGS · CELERY · DAILY</text>
    </svg>
  );
}

// PyGPT2 — training loss curve falling toward the val floor
function ThumbLoss() {
  const pts = Array.from({ length: 17 }, (_, i) => {
    const x = i * 10;
    const y = 96 - 58 * Math.exp(-x / 48) - Math.sin(i * 1.7) * 2;
    return `${20 + x},${y.toFixed(1)}`;
  }).join(' ');
  return (
    <svg viewBox="0 0 200 130" className="thumb-svg" preserveAspectRatio="xMidYMid slice">
      <rect width="200" height="130" fill="var(--bg-2)"/>
      {[38, 62, 86].map(y => (
        <line key={y} x1="20" x2="184" y1={y} y2={y} stroke="currentColor" strokeOpacity="0.1" strokeDasharray="2 3"/>
      ))}
      <line x1="20" x2="184" y1="90" y2="90" stroke="currentColor" strokeOpacity="0.25"/>
      <polyline points={pts} fill="none" stroke="var(--clay)" strokeWidth="1.4"/>
      <line x1="20" x2="184" y1="94" y2="94" stroke="#7BA98A" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.7"/>
      <circle cx="180" cy="92.4" r="2.4" fill="var(--clay)"/>
      <text x="176" y="84" textAnchor="end" fontFamily="ui-monospace, monospace" fontSize="7" fill="var(--clay)">loss 3.28</text>
      <text x="20" y="30" fontFamily="ui-monospace, monospace" fontSize="6" fill="currentColor" opacity="0.5">step 0 → 19k</text>
      <text x="14" y="112" fontFamily="ui-monospace, monospace" fontSize="7" fill="currentColor" opacity="0.55">124M PARAMS · DDP · FINEWEB-EDU</text>
    </svg>
  );
}

// GPT Transformer — attention weights fanning between token columns
function ThumbAttention() {
  const chars = ['t', 'h', 'e', ' ', 'c', 'a', 't'];
  const weights = [0.5, 0.1, 0.28, 0.06, 0.2, 0.12, 0];
  const yOf = (i) => 22 + i * 12.5;
  return (
    <svg viewBox="0 0 200 130" className="thumb-svg" preserveAspectRatio="xMidYMid slice">
      <rect width="200" height="130" fill="var(--bg-2)"/>
      {weights.slice(0, 6).map((w, i) => (
        <line key={i} x1="66" y1={yOf(i)} x2="134" y2={yOf(6)}
          stroke={i === 0 ? 'var(--clay)' : 'currentColor'}
          strokeWidth={i === 0 ? 1.4 : 0.8} opacity={i === 0 ? 0.9 : w}/>
      ))}
      {chars.map((c, i) => (
        <text key={'l' + i} x="56" y={yOf(i) + 3} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="9" fill="currentColor" opacity="0.7">{c === ' ' ? '␣' : c}</text>
      ))}
      {chars.map((c, i) => (
        <text key={'r' + i} x="144" y={yOf(i) + 3} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="9"
          fill={i === 6 ? 'var(--clay)' : 'currentColor'} opacity={i === 6 ? 1 : 0.35}>{c === ' ' ? '␣' : c}</text>
      ))}
      <text x="14" y="112" fontFamily="ui-monospace, monospace" fontSize="7" fill="currentColor" opacity="0.55">softmax(QKᵀ/√d)·V · CHAR-LEVEL</text>
    </svg>
  );
}

// Harmony AI — four services orbiting one Slack-first hub
function ThumbHub() {
  const sats = [[44, 28, 'S'], [156, 28, 'T'], [44, 88, 'G'], [156, 88, 'C']];
  return (
    <svg viewBox="0 0 200 130" className="thumb-svg" preserveAspectRatio="xMidYMid slice">
      <rect width="200" height="130" fill="var(--bg-2)"/>
      {sats.map(([x, y], i) => (
        <line key={i} x1="100" y1="58" x2={x} y2={y} stroke="currentColor" strokeOpacity="0.22"/>
      ))}
      {sats.map(([x, y], i) => (
        <circle key={i} cx={(100 + x) / 2} cy={(58 + y) / 2} r="1.6" fill="var(--clay)" opacity="0.8"/>
      ))}
      {sats.map(([x, y, l]) => (
        <g key={l}>
          <rect x={x - 10} y={y - 10} width="20" height="20" rx="5" fill="var(--bg)" stroke="currentColor" strokeOpacity="0.35"/>
          <text x={x} y={y + 3} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="8" fill="currentColor" opacity="0.7">{l}</text>
        </g>
      ))}
      <circle cx="100" cy="58" r="13" fill="var(--clay)"/>
      <text x="100" y="61.5" textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="9" fill="var(--bg)">⌘</text>
      <text x="14" y="112" fontFamily="ui-monospace, monospace" fontSize="7" fill="currentColor" opacity="0.55">SLACK · TRELLO · GMAIL · GCAL</text>
    </svg>
  );
}

// Hashtable Benchmark — threads racing into buckets, one under lock
function ThumbBuckets() {
  const rows = [0, 1, 2, 3];
  const hits = [0, 2, 1, 3];
  return (
    <svg viewBox="0 0 200 130" className="thumb-svg" preserveAspectRatio="xMidYMid slice">
      <rect width="200" height="130" fill="var(--bg-2)"/>
      {rows.map(i => (
        <g key={i}>
          <text x="24" y={26 + i * 19} fontFamily="ui-monospace, monospace" fontSize="7" fill="currentColor" opacity="0.6">t{i + 1}</text>
          <line x1="36" y1={23 + i * 19} x2="84" y2={23 + hits[i] * 19} stroke="var(--clay)" strokeWidth="0.9" opacity="0.75"/>
        </g>
      ))}
      {rows.map(i => (
        <g key={i}>
          <rect x="88" y={14 + i * 19} width="66" height="14" rx="2" fill="var(--bg)" stroke="currentColor" strokeOpacity="0.3"/>
          {Array.from({ length: 3 }, (_, k) => (
            <rect key={k} x={94 + k * 14} y={18 + i * 19} width="9" height="6" fill="currentColor" opacity={k <= i ? 0.3 : 0.08}/>
          ))}
        </g>
      ))}
      <g transform="translate(162 29)">
        <rect x="0" y="4" width="12" height="9" rx="1.5" fill="var(--clay)"/>
        <path d="M2.5 4 V1.5 A3.5 3.5 0 0 1 9.5 1.5 V4" fill="none" stroke="var(--clay)" strokeWidth="1.6"/>
      </g>
      <text x="14" y="112" fontFamily="ui-monospace, monospace" fontSize="7" fill="currentColor" opacity="0.55">MUTEX · RWLOCK · SPINLOCK · 0 LOST</text>
    </svg>
  );
}

// Resume Maestro — plain draft in, typeset PDF out
function ThumbResume() {
  return (
    <svg viewBox="0 0 200 130" className="thumb-svg" preserveAspectRatio="xMidYMid slice">
      <rect width="200" height="130" fill="var(--bg-2)"/>
      <g transform="translate(30 18)">
        <rect width="52" height="72" fill="var(--bg)" stroke="currentColor" strokeOpacity="0.25"/>
        {Array.from({ length: 8 }, (_, i) => (
          <rect key={i} x="7" y={9 + i * 8} width={i % 3 === 1 ? 26 : 38} height="2.2" fill="currentColor" opacity="0.25"/>
        ))}
      </g>
      <text x="94" y="58" fontFamily="ui-serif, Georgia, serif" fontSize="14" fill="currentColor" opacity="0.5">→</text>
      <g transform="translate(118 18)">
        <rect width="52" height="72" fill="var(--bg)" stroke="currentColor" strokeOpacity="0.25"/>
        <path d="M52 0 L42 0 L52 10 Z" fill="currentColor" opacity="0.12"/>
        {Array.from({ length: 8 }, (_, i) => (
          <rect key={i} x="7" y={9 + i * 8} width={i % 3 === 1 ? 30 : 38} height="2.2"
            fill={i === 1 || i === 4 ? 'var(--clay)' : 'currentColor'} opacity={i === 1 || i === 4 ? 0.85 : 0.3}/>
        ))}
        <rect x="30" y="58" width="18" height="10" rx="2" fill="var(--clay)"/>
        <text x="39" y="65.5" textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="5.5" fill="var(--bg)">PDF</text>
      </g>
      <text x="14" y="112" fontFamily="ui-monospace, monospace" fontSize="7" fill="currentColor" opacity="0.55">GPT-4 · LATEX → PDF</text>
    </svg>
  );
}

// TubeGenie — video player answering questions about itself
function ThumbVideo() {
  return (
    <svg viewBox="0 0 200 130" className="thumb-svg" preserveAspectRatio="xMidYMid slice">
      <rect width="200" height="130" fill="var(--bg-2)"/>
      <g transform="translate(22 20)">
        <rect width="90" height="58" rx="4" fill="var(--bg)" stroke="currentColor" strokeOpacity="0.25"/>
        <path d="M39 20 L57 29 L39 38 Z" fill="var(--clay)"/>
        <line x1="8" y1="50" x2="82" y2="50" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.6"/>
        <line x1="8" y1="50" x2="46" y2="50" stroke="var(--clay)" strokeWidth="1.6"/>
        {[8, 30, 58, 82].map(x => <circle key={x} cx={x} cy="50" r="1.8" fill="currentColor" opacity="0.45"/>)}
      </g>
      <g transform="translate(124 24)" fontFamily="ui-monospace, monospace" fontSize="7">
        <text fill="var(--clay)">Q:</text>
        <rect x="12" y="-5" width="42" height="2.2" fill="currentColor" opacity="0.3"/>
        <rect x="12" y="1" width="30" height="2.2" fill="currentColor" opacity="0.3"/>
        <text y="22" fill="#7BA98A">A:</text>
        <rect x="12" y="17" width="46" height="2.2" fill="currentColor" opacity="0.22"/>
        <rect x="12" y="23" width="46" height="2.2" fill="currentColor" opacity="0.22"/>
        <rect x="12" y="29" width="24" height="2.2" fill="currentColor" opacity="0.22"/>
      </g>
      <text x="14" y="112" fontFamily="ui-monospace, monospace" fontSize="7" fill="currentColor" opacity="0.55">EMBEDCHAIN · CHROMADB · GPT-4</text>
    </svg>
  );
}

// LlamaLingo — chat served off a humming local box
function ThumbLocalchat() {
  return (
    <svg viewBox="0 0 200 130" className="thumb-svg" preserveAspectRatio="xMidYMid slice">
      <rect width="200" height="130" fill="var(--bg-2)"/>
      <g transform="translate(28 24)">
        <rect width="44" height="62" rx="4" fill="var(--bg)" stroke="currentColor" strokeOpacity="0.3"/>
        {[0, 1, 2].map(i => (
          <g key={i}>
            <line x1="6" y1={14 + i * 18} x2="30" y2={14 + i * 18} stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" strokeLinecap="round"/>
            <circle cx="37" cy={14 + i * 18} r="1.6" fill={i === 0 ? '#7BA98A' : i === 1 ? 'var(--clay)' : 'currentColor'} opacity={i === 2 ? 0.3 : 1}/>
          </g>
        ))}
      </g>
      <g transform="translate(92 22)">
        <rect x="28" width="66" height="14" rx="7" fill="var(--clay)" opacity="0.85"/>
        <rect y="20" width="78" height="14" rx="7" fill="currentColor" opacity="0.12"/>
        <rect y="40" width="52" height="14" rx="7" fill="currentColor" opacity="0.12"/>
        {[0, 1, 2].map(i => <circle key={i} cx={12 + i * 9} cy="47" r="1.8" fill="currentColor" opacity="0.5"/>)}
      </g>
      <text x="14" y="112" fontFamily="ui-monospace, monospace" fontSize="7" fill="currentColor" opacity="0.55">LLAMA-3 · LM STUDIO · LOCALHOST</text>
    </svg>
  );
}

// EcoStock — price line over an ESG sentiment field, forecast dashed
function ThumbEsg() {
  return (
    <svg viewBox="0 0 200 130" className="thumb-svg" preserveAspectRatio="xMidYMid slice">
      <rect width="200" height="130" fill="var(--bg-2)"/>
      {[36, 60, 84].map(y => (
        <line key={y} x1="20" x2="184" y1={y} y2={y} stroke="currentColor" strokeOpacity="0.1" strokeDasharray="2 3"/>
      ))}
      <path d="M20 84 L44 78 L68 82 L92 70 L116 73 L140 64 L140 96 L20 96 Z" fill="#7BA98A" opacity="0.22"/>
      <path d="M20 84 L44 78 L68 82 L92 70 L116 73 L140 64" fill="none" stroke="#7BA98A" strokeWidth="1"/>
      <polyline points="20,72 44,64 68,68 92,54 116,58 140,46" fill="none" stroke="var(--clay)" strokeWidth="1.4"/>
      <polyline points="140,46 162,40 184,34" fill="none" stroke="var(--clay)" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.8"/>
      <line x1="140" y1="26" x2="140" y2="96" stroke="currentColor" strokeOpacity="0.25" strokeDasharray="2 2"/>
      <circle cx="140" cy="46" r="2.2" fill="var(--clay)"/>
      <text x="144" y="24" fontFamily="ui-monospace, monospace" fontSize="6" fill="currentColor" opacity="0.5">forecast</text>
      <text x="14" y="112" fontFamily="ui-monospace, monospace" fontSize="7" fill="currentColor" opacity="0.55">VARMAX · ESG + SENTIMENT · AIC 1338</text>
    </svg>
  );
}

// TypeNinja — keyboard with the backspace crossed out
function ThumbKeys() {
  const rowDefs = [
    { y: 30, x: 24, n: 9 },
    { y: 48, x: 32, n: 8 },
    { y: 66, x: 40, n: 7 },
  ];
  return (
    <svg viewBox="0 0 200 130" className="thumb-svg" preserveAspectRatio="xMidYMid slice">
      <rect width="200" height="130" fill="var(--bg-2)"/>
      {rowDefs.map((r, ri) => (
        <g key={ri}>
          {Array.from({ length: r.n }, (_, i) => (
            <rect key={i} x={r.x + i * 16} y={r.y} width="13" height="13" rx="2.5"
              fill={ri === 1 && i === 3 ? 'var(--clay)' : 'var(--bg)'}
              stroke="currentColor" strokeOpacity={ri === 1 && i === 3 ? 0 : 0.25}/>
          ))}
        </g>
      ))}
      <g>
        <rect x="168" y="30" width="16" height="13" rx="2.5" fill="var(--bg)" stroke="var(--clay)" strokeOpacity="0.9"/>
        <text x="176" y="39.5" textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="7" fill="var(--clay)">⌫</text>
        <line x1="167" y1="44" x2="185" y2="29" stroke="var(--clay)" strokeWidth="1.4"/>
      </g>
      <rect x="56" y="84" width="88" height="11" rx="2.5" fill="var(--bg)" stroke="currentColor" strokeOpacity="0.25"/>
      <text x="184" y="20" textAnchor="end" fontFamily="ui-monospace, monospace" fontSize="8" fill="currentColor" opacity="0.7">92 WPM · 98%</text>
      <text x="14" y="112" fontFamily="ui-monospace, monospace" fontSize="7" fill="currentColor" opacity="0.55">NO BACKSPACE · 20 SENTENCES</text>
    </svg>
  );
}

// SHEMS — a house metering its devices
function ThumbEnergy() {
  const bars = [12, 22, 30, 16];
  const devices = [0.7, 0.45, 0.85];
  return (
    <svg viewBox="0 0 200 130" className="thumb-svg" preserveAspectRatio="xMidYMid slice">
      <rect width="200" height="130" fill="var(--bg-2)"/>
      <path d="M34 58 L72 28 L110 58 V94 H34 Z" fill="var(--bg)" stroke="currentColor" strokeOpacity="0.35"/>
      {bars.map((b, i) => (
        <rect key={i} x={44 + i * 15} y={86 - b} width="9" height={b} fill="var(--clay)" opacity={0.4 + i * 0.15}/>
      ))}
      <path d="M74 14 L68 26 L73 26 L67 40 L78 24 L73 24 L79 14 Z" fill="var(--clay)"/>
      <g transform="translate(126 34)">
        <text fontFamily="ui-monospace, monospace" fontSize="10" fill="currentColor" opacity="0.8">4.2 kWh</text>
        {devices.map((d, i) => (
          <g key={i}>
            <rect x="0" y={10 + i * 13} width="56" height="3" rx="1.5" fill="currentColor" opacity="0.12"/>
            <rect x="0" y={10 + i * 13} width={56 * d} height="3" rx="1.5" fill={i === 2 ? 'var(--clay)' : '#7BA98A'} opacity="0.8"/>
          </g>
        ))}
      </g>
      <text x="14" y="112" fontFamily="ui-monospace, monospace" fontSize="7" fill="currentColor" opacity="0.55">DEVICES · KWH · MULTI-USER</text>
    </svg>
  );
}

const PROJECT_THUMBS = {
  shield: ThumbShield,
  vault: ThumbVault,
  globe: ThumbGlobe,
  dag: ThumbDag,
  loss: ThumbLoss,
  attention: ThumbAttention,
  hub: ThumbHub,
  buckets: ThumbBuckets,
  resume: ThumbResume,
  video: ThumbVideo,
  localchat: ThumbLocalchat,
  esg: ThumbEsg,
  keys: ThumbKeys,
  energy: ThumbEnergy,
};

Object.assign(window, { PROJECT_THUMBS });
