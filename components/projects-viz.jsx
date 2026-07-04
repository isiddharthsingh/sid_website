// ─── Auto-playing tick driver
function useTick(ms = 16) {
  const [t, setT] = useState(0);
  useEffect(() => {
    let raf = 0;
    let start = performance.now();
    const loop = (now) => {
      setT(now - start);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  return t;
}

// ─────────────────────────────────────────────
// VIZ 1 — TRADING TERMINAL (CryptoStream AI)
// ─────────────────────────────────────────────
function VizTerminal() {
  const t = useTick();
  const seconds = t / 1000;

  const candles = React.useMemo(() => {
    const arr = [];
    let price = 64200;
    for (let i = 0; i < 36; i++) {
      const drift = Math.sin(i * 0.4) * 80 + Math.cos(i * 0.17) * 40;
      const open = price;
      const close = price + drift + (i % 3 === 0 ? 60 : -30);
      const high = Math.max(open, close) + Math.abs(Math.sin(i * 1.3)) * 35;
      const low = Math.min(open, close) - Math.abs(Math.cos(i * 0.9)) * 30;
      arr.push({ open, close, high, low });
      price = close;
    }
    return arr;
  }, []);

  const liveDrift = Math.sin(seconds * 1.4) * 40 + Math.cos(seconds * 0.6) * 25;
  const last = candles[candles.length - 1];
  const livePrice = last.close + liveDrift;
  const liveOpen = last.close;
  const liveHigh = Math.max(liveOpen, livePrice) + 15;
  const liveLow = Math.min(liveOpen, livePrice) - 15;
  const fullCandles = [...candles, { open: liveOpen, close: livePrice, high: liveHigh, low: liveLow, live: true }];

  const allHighs = fullCandles.map(c => c.high);
  const allLows = fullCandles.map(c => c.low);
  const yMax = Math.max(...allHighs) + 20;
  const yMin = Math.min(...allLows) - 20;
  const yRange = yMax - yMin;

  const w = 100, h = 60;
  const padX = 4;
  const candleW = (w - padX * 2) / fullCandles.length;
  const yOf = (p) => h - ((p - yMin) / yRange) * h;

  const symbols = [
    { sym: 'BTC-USD', base: 64320, vary: 1.4, dec: 2 },
    { sym: 'ETH-USD', base: 3128, vary: 0.8, dec: 2 },
    { sym: 'SOL-USD', base: 152.4, vary: 0.5, dec: 2 },
    { sym: 'LINK-USD', base: 18.2, vary: 0.3, dec: 3 },
    { sym: 'AVAX-USD', base: 36.7, vary: 0.4, dec: 2 },
  ];
  const tickerData = symbols.map((s, i) => {
    const drift = Math.sin(seconds * 0.7 + i) * s.vary;
    return { sym: s.sym, price: (s.base + drift).toFixed(s.dec), delta: drift };
  });

  const throughput = Math.floor(820 + Math.sin(seconds * 0.5) * 160 + Math.sin(seconds * 2.1) * 60);
  const livePriceFmt = livePrice.toFixed(2);
  const dayChange = ((livePrice - candles[0].open) / candles[0].open) * 100;

  return (
    <div className="viz-term">
      <div className="vt-head">
        <div className="vt-head-left">
          <span className="vt-dot"></span>
          <span className="vt-mono">CRYPTOSTREAM · KAFKA</span>
        </div>
        <div className="vt-head-right">
          <span className="vt-mono vt-dim">throughput</span>
          <span className="vt-mono">{throughput.toLocaleString()} msg/s</span>
        </div>
      </div>
      <div className="vt-price-row">
        <div>
          <div className="vt-mono vt-dim">BTC-USD · 1m</div>
          <div className="vt-price">${livePriceFmt}</div>
        </div>
        <div className={'vt-delta ' + (dayChange >= 0 ? 'up' : 'down')}>
          {dayChange >= 0 ? '▲' : '▼'} {Math.abs(dayChange).toFixed(2)}%
        </div>
      </div>
      <svg className="vt-chart" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        {[0.25, 0.5, 0.75].map(g => (
          <line key={g} x1="0" x2={w} y1={h * g} y2={h * g} stroke="rgba(245,240,232,0.06)" strokeWidth="0.15" />
        ))}
        {fullCandles.map((c, i) => {
          const x = padX + i * candleW + candleW / 2;
          const up = c.close >= c.open;
          const color = up ? '#a8e6c7' : '#e8a594';
          const bodyTop = yOf(Math.max(c.open, c.close));
          const bodyH = Math.max(0.4, Math.abs(yOf(c.open) - yOf(c.close)));
          return (
            <g key={i} opacity={c.live ? 1 : 0.85}>
              <line x1={x} x2={x} y1={yOf(c.high)} y2={yOf(c.low)} stroke={color} strokeWidth="0.2" />
              <rect x={x - candleW * 0.32} y={bodyTop} width={candleW * 0.64} height={bodyH} fill={color} opacity={c.live ? 1 : 0.55}>
                {c.live && <animate attributeName="opacity" values="0.6;1;0.6" dur="1.4s" repeatCount="indefinite" />}
              </rect>
            </g>
          );
        })}
        <line x1="0" x2={w} y1={yOf(livePrice)} y2={yOf(livePrice)} stroke="rgba(193,101,68,0.7)" strokeWidth="0.18" strokeDasharray="0.6 0.6" />
      </svg>
      <div className="vt-ticker">
        {tickerData.map((d, i) => (
          <div key={i} className="vt-ticker-cell">
            <span className="vt-mono vt-dim">{d.sym}</span>
            <span className="vt-mono">{d.price}</span>
            <span className={'vt-tick-delta ' + (d.delta >= 0 ? 'up' : 'down')}>
              {d.delta >= 0 ? '+' : ''}{d.delta.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// VIZ 2 — TALEWEAVER (polaroid + story)
// ─────────────────────────────────────────────
function VizStory() {
  const t = useTick();
  const phase = (t / 1000) % 12;
  const developP = Math.min(1, Math.max(0, phase / 2.5));
  const labelP = Math.min(1, Math.max(0, (phase - 2.5) / 1.5));
  const story = "On a quiet shore at golden hour, a lone figure faced the open sea. The tide drew breath, and the gulls wrote slow circles overhead. She had not come to remember, only to listen, and to begin again.";
  const typeStart = 4;
  const typeP = Math.min(1, Math.max(0, (phase - typeStart) / 7));
  const visibleChars = Math.floor(typeP * story.length);
  const typed = story.slice(0, visibleChars);
  const labels = ['person', 'beach', 'ocean', 'sunset', 'gull'];
  const visibleLabels = Math.floor(labelP * labels.length);

  return (
    <div className="viz-story">
      <div className="vs-stage">
        <div className="vs-polaroid" style={{ transform: `rotate(${-3 + (phase < 4 ? 0 : -1)}deg) translateY(${phase < 4 ? 0 : -8}px)` }}>
          <div className="vs-photo" style={{ filter: `blur(${(1 - developP) * 8}px) saturate(${0.3 + developP * 0.7})`, opacity: 0.4 + developP * 0.6 }}>
            <div className="vs-sun" style={{ opacity: developP }}></div>
            <div className="vs-horizon"></div>
            <div className="vs-figure" style={{ opacity: developP }}></div>
            {developP > 0.6 && (
              <>
                <div className="vs-gull" style={{ left: '20%', top: '22%' }}>~</div>
                <div className="vs-gull" style={{ left: '70%', top: '15%' }}>~</div>
              </>
            )}
          </div>
          <div className="vs-polaroid-cap">IMG_0428.JPG</div>
          {labels.slice(0, visibleLabels).map((l, i) => {
            const positions = [
              { left: '32%', top: '60%' },
              { left: '12%', top: '78%' },
              { left: '56%', top: '50%' },
              { left: '70%', top: '28%' },
              { left: '20%', top: '20%' },
            ];
            return (
              <div key={l} className="vs-label" style={positions[i]}>
                <span className="vs-label-dot"></span>
                {l} <em>{(0.94 - i * 0.07).toFixed(2)}</em>
              </div>
            );
          })}
        </div>
        <div className="vs-arrow" style={{ opacity: phase > 3.5 ? 1 : 0 }}>→</div>
        <div className="vs-story-panel" style={{ opacity: phase > 3.5 ? 1 : 0.2 }}>
          <div className="vs-story-head">
            <span className="vs-mono vs-dim">GPT · STORY</span>
            <span className="vs-mono">{Math.floor(typeP * 100)}%</span>
          </div>
          <div className="vs-story-body">
            {typed}<span className="vs-caret">▌</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// VIZ 3 — DINING CONCIERGE (SMS + map)
// ─────────────────────────────────────────────
function VizDining() {
  const t = useTick();
  const phase = (t / 1000) % 14;
  const script = [
    { who: 'user', text: 'brunch in soho, no eggs', at: 0.5 },
    { who: 'bot', text: 'On it. Searching…', at: 1.6 },
    { who: 'bot', text: '3 spots within 0.4 mi. Open now.', at: 3.0 },
    { who: 'user', text: 'book the first one for 1pm', at: 5.0 },
    { who: 'bot', text: '✓ Confirmed at Jack’s. Email sent.', at: 7.0 },
  ];
  const visible = script.filter(m => phase > m.at);
  const isTyping = (phase > 1.0 && phase < 1.6) || (phase > 2.4 && phase < 3.0) || (phase > 6.0 && phase < 7.0);
  const pinP = Math.min(1, Math.max(0, (phase - 3.0) / 1.6));
  const pinsVisible = Math.floor(pinP * 3);

  return (
    <div className="viz-din">
      <div className="vd-phone">
        <div className="vd-phone-bar"><span>9:41</span><span>● ● ●</span></div>
        <div className="vd-phone-head">
          <div className="vd-avatar">D</div>
          <div>
            <div className="vd-name">Dining Concierge</div>
            <div className="vd-sub">active now</div>
          </div>
        </div>
        <div className="vd-msgs">
          {visible.map((m, i) => (<div key={i} className={'vd-msg vd-' + m.who}>{m.text}</div>))}
          {isTyping && (<div className="vd-msg vd-bot vd-typing"><span></span><span></span><span></span></div>)}
        </div>
      </div>
      <div className="vd-map">
        <div className="vd-map-head">
          <span className="vd-mono vd-dim">SOHO · MANHATTAN</span>
          <span className="vd-mono">3 results</span>
        </div>
        <svg className="vd-map-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
          <g stroke="rgba(245,240,232,0.10)" strokeWidth="0.4">
            <line x1="0" x2="100" y1="20" y2="20" />
            <line x1="0" x2="100" y1="42" y2="42" />
            <line x1="0" x2="100" y1="62" y2="62" />
            <line x1="0" x2="100" y1="82" y2="82" />
            <line x1="22" x2="22" y1="0" y2="100" />
            <line x1="48" x2="48" y1="0" y2="100" />
            <line x1="72" x2="72" y1="0" y2="100" />
          </g>
          <rect x="22" y="42" width="26" height="20" fill="rgba(193,101,68,0.06)" />
          <rect x="48" y="62" width="24" height="20" fill="rgba(245,240,232,0.04)" />
          <g>
            <circle cx="38" cy="55" r="5" fill="rgba(193,101,68,0.15)">
              <animate attributeName="r" values="3;8;3" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="38" cy="55" r="1.6" fill="#c16544" />
          </g>
        </svg>
        {[
          { x: 28, y: 30, n: '1', name: "Jack's" },
          { x: 62, y: 48, n: '2', name: 'Le Coucou' },
          { x: 70, y: 72, n: '3', name: 'Balthazar' },
        ].slice(0, pinsVisible).map((p, i) => (
          <div key={i} className="vd-pin" style={{ left: p.x + '%', top: p.y + '%' }}>
            <span className="vd-pin-num">{p.n}</span>
            <span className="vd-pin-name">{p.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { VizTerminal, VizStory, VizDining });
