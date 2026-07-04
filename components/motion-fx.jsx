// ───────────────────────────────────────────────────────────
// motion-fx.jsx — the lean 2026 motion stack
//   • Lenis     → buttery momentum scroll (window-wide)
//   • Motion    → inView + animate for element reveals
//   • @starting-style (in motion.css) → route-level entry
//   • HeroOrb   → abstract Lottie/SVG hero piece
// ───────────────────────────────────────────────────────────

// ───── reduced motion guard ─────
const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ───── Lenis bootstrap (singleton) ─────
// Two feels, wired to the "Scroll" tweak:
//   apple  → momentum carry, premium glide (lerp 0.085)
//   subtle → tighter, closer to native trackpad (lerp 0.16)
const SCROLL_PROFILES = {
  apple:  { lerp: 0.085, wheelMultiplier: 1.0,  touchMultiplier: 1.5 },
  subtle: { lerp: 0.16,  wheelMultiplier: 1.05, touchMultiplier: 1.6 },
};

function bootLenis(mode = 'apple') {
  if (typeof window === 'undefined') return null;
  if (prefersReducedMotion || !window.Lenis) return null;
  if (window.__lenis) return window.__lenis;

  const cfg = SCROLL_PROFILES[mode] || SCROLL_PROFILES.apple;
  const lenis = new window.Lenis({
    lerp: cfg.lerp,
    smoothWheel: true,
    smoothTouch: false,
    wheelMultiplier: cfg.wheelMultiplier,
    touchMultiplier: cfg.touchMultiplier,
  });

  document.documentElement.classList.add('lenis-smooth');
  function raf(time) {
    if (window.__lenis !== lenis) return; // stop old loop after a reconfigure
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Route changes should jump to top through Lenis (not the bare scrollTo)
  window.addEventListener('hashchange', () => {
    try { window.__lenis && window.__lenis.scrollTo(0, { immediate: true }); } catch (_) {}
  });

  window.__lenis = lenis;
  window.__lenisMode = mode;
  return lenis;
}

// Swap scroll feel live (Tweaks → Scroll). Lenis has no setter for lerp,
// so we tear the instance down and rebuild it in place.
function setScrollIntensity(mode) {
  if (!window.Lenis || prefersReducedMotion) return;
  if (window.__lenisMode === mode) return;
  const old = window.__lenis;
  window.__lenis = null;
  if (old) { try { old.destroy(); } catch (_) {} }
  bootLenis(mode);
}
window.__setScrollIntensity = setScrollIntensity;

function useLenis(mode) {
  useEffect(() => { bootLenis(mode || 'apple'); }, []);
}

// ───── ScrollProgress — thin clay bar at top, tied to Lenis ─────
function ScrollProgress() {
  const ref = useRef(null);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      if (!ref.current) return;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
      ref.current.style.width = pct + '%';
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);
  return <div ref={ref} className="scroll-progress" aria-hidden="true" />;
}

// ───── Reveal — wraps children, animates them in on intersect ─────
//
// <Reveal>           single element fade+rise
// <Reveal as="div" delay={120}>...</Reveal>
//
function Reveal({ as: Tag = 'div', delay = 0, mode = 'reveal', className = '', children, ...rest }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion) { el.classList.add('is-in'); return; }
    if (!window.Motion || !window.Motion.inView) {
      // graceful fallback to IntersectionObserver
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            setTimeout(() => el.classList.add('is-in'), delay);
            io.unobserve(el);
          }
        });
      }, { rootMargin: '-10% 0px -10% 0px' });
      io.observe(el);
      return () => io.disconnect();
    }
    const stop = window.Motion.inView(el, () => {
      setTimeout(() => el.classList.add('is-in'), delay);
      return () => {};
    }, { margin: '-10% 0px -10% 0px' });
    return stop;
  }, [delay]);

  return (
    <Tag ref={ref} data-motion={mode} className={className} {...rest}>
      {children}
    </Tag>
  );
}

// ───── Stagger — children animate in sequentially ─────
function Stagger({ as: Tag = 'div', step = 60, className = '', children, ...rest }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // assign --i to each direct child
    Array.from(el.children).forEach((c, i) => {
      c.style.setProperty('--i', String(i));
    });
    if (prefersReducedMotion) { el.classList.add('is-in'); return; }
    if (!window.Motion || !window.Motion.inView) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) { el.classList.add('is-in'); io.unobserve(el); }
        });
      }, { rootMargin: '-8% 0px -8% 0px' });
      io.observe(el);
      return () => io.disconnect();
    }
    const stop = window.Motion.inView(el, () => {
      el.classList.add('is-in');
      return () => {};
    }, { margin: '-8% 0px -8% 0px' });
    return stop;
  }, [children]);
  return (
    <Tag ref={ref} data-motion="stagger" style={{ '--step': step + 'ms' }} className={className} {...rest}>
      {children}
    </Tag>
  );
}

// ───── HeroOrb — the "Lottie/Rive" hero piece ─────
//
//  • Ships with a pure-SVG abstract geometric loop (Lottie-grade
//    motion: 4 concentric rings spinning at different speeds, a
//    dashed orbital arc, and a clay bloom).
//  • Also mounts a <div class="hero-lottie"> slot. If you drop
//    a Lottie JSON at assets/hero.lottie.json, lottie-web auto-
//    loads it and the SVG dims behind it.
//
function HeroOrb() {
  const lottieMount = useRef(null);
  const orbRef = useRef(null);
  const anim = useRef(null);
  const y = useScrollY();
  const mouse = useRef({ x: 0, y: 0 });

  // Parallax on scroll: orb drifts down + rotates slightly
  useEffect(() => {
    if (!orbRef.current) return;
    const vh = window.innerHeight;
    const t = clamp(y / vh, 0, 1.5);
    orbRef.current.style.transform = `translate3d(${mouse.current.x}px, ${t * 80 + mouse.current.y}px, 0) rotate(${t * 25}deg)`;
  }, [y]);

  // Magnetic mouse parallax
  useEffect(() => {
    const onMove = (e) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      mouse.current.x = (e.clientX - cx) * 0.025;
      mouse.current.y = (e.clientY - cy) * 0.025;
      if (orbRef.current) {
        const vh = window.innerHeight;
        const t = clamp(window.scrollY / vh, 0, 1.5);
        orbRef.current.style.transform = `translate3d(${mouse.current.x}px, ${t * 80 + mouse.current.y}px, 0) rotate(${t * 25}deg)`;
      }
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  // NOTE: the pure-SVG orb is the intended hero piece. We no longer
  // fetch assets/hero.lottie.json on every load (it 404'd and cost a
  // request each visit). Drop a Lottie in at runtime via
  // window.heroLottie.load(url) and it overlays on top.
  useEffect(() => {
    return () => {
      if (anim.current) { try { anim.current.destroy(); } catch (_) {} }
    };
  }, []);

  // Expose imperative loader for tweaking
  useEffect(() => {
    window.heroLottie = {
      load: (url) => {
        if (anim.current) { try { anim.current.destroy(); } catch (_) {} }
        fetch(url).then(r => r.json()).then(json => {
          anim.current = window.lottie.loadAnimation({
            container: lottieMount.current,
            renderer: 'svg', loop: true, autoplay: true,
            animationData: json,
          });
          lottieMount.current.classList.add('loaded');
        });
      },
    };
  }, []);

  return (
    <div className="hero-orb" aria-hidden="true">
      <div className="hero-orb-inner" ref={orbRef}>
      <div className="hero-lottie" ref={lottieMount}></div>
      <svg className="orb-svg" viewBox="-200 -200 400 400" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="bloomG" cx="0" cy="0" r="180" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="var(--clay)" stopOpacity="0.55" />
            <stop offset="45%" stopColor="var(--clay)" stopOpacity="0.16" />
            <stop offset="100%" stopColor="var(--clay)" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="ringG" x1="0" y1="-180" x2="0" y2="180" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="var(--clay)" stopOpacity="0.95" />
            <stop offset="100%" stopColor="var(--ink)" stopOpacity="0.25" />
          </linearGradient>
        </defs>

        {/* soft bloom (breathing) */}
        <circle className="orb-bloom" r="170" fill="url(#bloomG)" />

        {/* dashed rings, spinning at different rates */}
        <g className="orb-ring r1">
          <circle r="180" fill="none" stroke="var(--clay)" strokeOpacity="0.55" strokeWidth="1" strokeDasharray="2 8" />
        </g>
        <g className="orb-ring r2">
          <circle r="148" fill="none" stroke="url(#ringG)" strokeWidth="1" strokeDasharray="18 6" />
        </g>
        <g className="orb-ring r3">
          <circle r="118" fill="none" stroke="var(--ink)" strokeOpacity="0.32" strokeWidth="0.7" strokeDasharray="1 5" />
        </g>
        <g className="orb-ring r4">
          <circle r="86" fill="none" stroke="var(--clay)" strokeOpacity="0.7" strokeWidth="0.8" strokeDasharray="30 6" />
        </g>
        <g className="orb-ring r5">
          <circle r="54" fill="none" stroke="var(--clay)" strokeOpacity="0.5" strokeWidth="0.6" strokeDasharray="1 4" />
        </g>

        {/* sweeping orbital arc — fast dash flow */}
        <g className="orb-ring r2">
          <path
            className="orb-arc"
            d="M -148 0 A 148 148 0 1 1 148 0"
            fill="none"
            stroke="var(--clay)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray="6 6"
          />
        </g>
        <g className="orb-ring r4" style={{ animationDuration: '8s' }}>
          <path
            className="orb-arc"
            d="M 0 -86 A 86 86 0 0 1 86 0"
            fill="none"
            stroke="var(--clay)"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeDasharray="4 4"
          />
        </g>

        {/* satellites — pulse */}
        <g className="orb-ring r1"><circle className="orb-pulse orb-satellite" cx="180" cy="0" r="3.5" fill="var(--clay)" /></g>
        <g className="orb-ring r2"><circle className="orb-pulse orb-satellite" cx="0" cy="-148" r="3" fill="var(--clay)" style={{ animationDelay: '0.5s' }} /></g>
        <g className="orb-ring r3"><circle className="orb-pulse" cx="-118" cy="0" r="2.4" fill="var(--ink)" opacity="0.7" style={{ animationDelay: '1s' }} /></g>
        <g className="orb-ring r4"><circle className="orb-pulse orb-satellite" cx="0" cy="86" r="2.6" fill="var(--clay)" style={{ animationDelay: '1.5s' }} /></g>
        <g className="orb-ring r5"><circle className="orb-pulse orb-satellite" cx="54" cy="0" r="2.2" fill="var(--clay)" style={{ animationDelay: '0.8s' }} /></g>

        {/* center */}
        <circle r="2.4" fill="var(--clay)" className="orb-pulse" />
      </svg>
      </div>
    </div>
  );
}

Object.assign(window, { useLenis, ScrollProgress, Reveal, Stagger, HeroOrb });
