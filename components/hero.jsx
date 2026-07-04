// split a word into per-character mask-reveal spans; `base` offsets
// the stagger index so the second line continues the cascade
function splitChars(word, base = 0) {
  return word.split('').map((ch, i) => (
    <span className="char" key={i} style={{ '--li': base + i }}>{ch}</span>
  ));
}

function Hero() {
  const nameRef = useRef(null);
  const lineRef = useRef(null);
  const y = useScrollY();

  useEffect(() => {
    if (!nameRef.current) return;
    const vh = window.innerHeight;
    const t = clamp(y / vh, 0, 1);
    nameRef.current.style.transform = `translateY(${t * -40}px)`;
    nameRef.current.style.opacity = String(1 - t * 0.6);
    if (lineRef.current) {
      lineRef.current.style.transform = `scaleX(${1 - t * 0.6})`;
    }
  }, [y]);

  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <section className="hero" id="top" data-screen-label="Hero">
      <div className="hero-rule top">
        <span>Siddharth Singh</span>
        <span>{today}</span>
      </div>

      <div className="hero-stage">
        <div className="hero-eyebrow">
          <span className="dot"></span>
          <span>Senior Software Engineer · New York</span>
        </div>

        <h1 className="hero-name split" ref={nameRef}>
          <span className="line">{splitChars('Siddharth', 0)}</span>
          <span className="line it">{splitChars('Singh.', 9)}</span>
        </h1>

        <div className="hero-rule mid" ref={lineRef}></div>

        <p className="hero-lede">
          A full-stack engineer building<br/>
          AI agent platforms, distributed systems,<br/>
          and the infrastructure that runs them.
        </p>
      </div>

      <div className="hero-rule bottom">
        <span>↓ Scroll</span>
        <span>01 / 07</span>
        <span>Currently · Arvo AI</span>
      </div>
    </section>
  );
}

Object.assign(window, { Hero });
