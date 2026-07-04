// ───────────────────────────────────────────────────────────
// motion-plus.jsx — additive motion layer (keeps the DNA)
//   • useMagnetic   → links/CTAs drift toward the cursor
//   • useTilt       → cards get a subtle pointer-driven 3D tilt
//   • useCountUp    → numeric stats roll up when scrolled into view
//   • MotionEnhancers → wires the three above, re-running on route change
// All effects are pointer-only and fully disabled under reduced-motion.
// ───────────────────────────────────────────────────────────

const mpReduce =
  typeof window !== 'undefined' && window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ───── magnetic: element eases toward the cursor while hovered ─────
function attachMagnetic(el, strength = 0.32, radius = 90) {
  let raf = 0;
  let tx = 0, ty = 0, cx = 0, cy = 0;
  const tick = () => {
    cx += (tx - cx) * 0.18;
    cy += (ty - cy) * 0.18;
    el.style.transform = `translate(${cx.toFixed(2)}px, ${cy.toFixed(2)}px)`;
    if (Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1) {
      raf = requestAnimationFrame(tick);
    } else { raf = 0; }
  };
  const onMove = (e) => {
    const r = el.getBoundingClientRect();
    const mx = e.clientX - (r.left + r.width / 2);
    const my = e.clientY - (r.top + r.height / 2);
    tx = Math.max(-radius, Math.min(radius, mx)) * strength;
    ty = Math.max(-radius, Math.min(radius, my)) * strength;
    if (!raf) raf = requestAnimationFrame(tick);
  };
  const onLeave = () => {
    tx = 0; ty = 0;
    el.classList.remove('is-magnet');
    if (!raf) raf = requestAnimationFrame(tick);
  };
  const onEnter = () => el.classList.add('is-magnet');
  el.addEventListener('mouseenter', onEnter);
  el.addEventListener('mousemove', onMove);
  el.addEventListener('mouseleave', onLeave);
  return () => {
    cancelAnimationFrame(raf);
    el.removeEventListener('mouseenter', onEnter);
    el.removeEventListener('mousemove', onMove);
    el.removeEventListener('mouseleave', onLeave);
    el.style.transform = '';
  };
}

// ───── tilt: card rotates toward the cursor in 3D, lifts slightly ─────
function attachTilt(el, max = 6) {
  let raf = 0;
  let rx = 0, ry = 0, tz = 0, trx = 0, tryy = 0, ttz = 0;
  const tick = () => {
    rx += (trx - rx) * 0.16;
    ry += (tryy - ry) * 0.16;
    tz += (ttz - tz) * 0.16;
    el.style.transform =
      `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateZ(${tz.toFixed(1)}px)`;
    const settled = Math.abs(trx - rx) < 0.05 && Math.abs(tryy - ry) < 0.05 && Math.abs(ttz - tz) < 0.05;
    if (!settled) { raf = requestAnimationFrame(tick); }
    else { raf = 0; if (ttz === 0) el.style.transform = ''; }
  };
  const onMove = (e) => {
    el.classList.add('is-tilt');
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    tryy = px * max * 2;
    trx = -py * max * 2;
    ttz = 14;
    if (!raf) raf = requestAnimationFrame(tick);
  };
  const onLeave = () => { trx = 0; tryy = 0; ttz = 0; el.classList.remove('is-tilt'); if (!raf) raf = requestAnimationFrame(tick); };
  el.addEventListener('mousemove', onMove);
  el.addEventListener('mouseleave', onLeave);
  return () => {
    cancelAnimationFrame(raf);
    el.removeEventListener('mousemove', onMove);
    el.removeEventListener('mouseleave', onLeave);
    el.style.transform = '';
  };
}

// ───── count-up: roll a numeric stat from 0 → its value on first view ─────
function animateCount(el) {
  if (el.dataset.counted) return null;
  const raw = el.textContent.trim();
  const m = raw.match(/^(\D*)(\d[\d,]*\.?\d*)(\D*)$/);
  if (!m) return null;                       // skip "—", empty, non-numeric
  const prefix = m[1], suffix = m[3];
  const numStr = m[2].replace(/,/g, '');
  const target = parseFloat(numStr);
  if (!isFinite(target)) return null;
  const decimals = (numStr.split('.')[1] || '').length;
  const hasComma = m[2].indexOf(',') !== -1;
  el.dataset.counted = '1';

  const fmt = (v) => {
    let s = decimals ? v.toFixed(decimals) : String(Math.round(v));
    if (hasComma) s = Number(s).toLocaleString('en-US');
    return prefix + s + suffix;
  };

  const dur = 1300;
  const start = performance.now();
  const ease = (t) => 1 - Math.pow(1 - t, 3);
  let raf = 0;
  const step = (now) => {
    const t = Math.min(1, (now - start) / dur);
    el.textContent = fmt(target * ease(t));
    if (t < 1) { raf = requestAnimationFrame(step); }
    else { el.textContent = raw; }   // restore exact original (keeps +, %, etc.)
  };
  el.textContent = fmt(0);
  raf = requestAnimationFrame(step);
  return () => cancelAnimationFrame(raf);
}

// ───── wires all three; re-runs whenever `route` changes ─────
function MotionEnhancers({ route }) {
  useEffect(() => {
    if (mpReduce) return;
    const cleanups = [];
    // give the route-fade remount a beat to paint
    const t = setTimeout(() => {
      // magnetic — links, contact rows, the chat launcher, card arrows
      document.querySelectorAll(
        '.contact-link, .sidd-fab, [data-magnetic]'
      ).forEach((el) => cleanups.push(attachMagnetic(el, 0.22, 70)));

      // tilt — the bigger interactive cards
      document.querySelectorAll(
        '.home-index-card, .proj-card'
      ).forEach((el) => cleanups.push(attachTilt(el, 5)));

      // count-up — static numeric stats
      const counters = document.querySelectorAll(
        '.about-stats .num, .exp-metric-num'
      );
      if (counters.length) {
        const io = new IntersectionObserver((entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              const target = e.target.querySelector('.it') || e.target;
              const stop = animateCount(target);
              if (stop) cleanups.push(stop);
              io.unobserve(e.target);
            }
          });
        }, { threshold: 0.6 });
        counters.forEach((c) => io.observe(c));
        cleanups.push(() => io.disconnect());
      }
    }, 80);

    return () => { clearTimeout(t); cleanups.forEach((fn) => fn && fn()); };
  }, [route]);

  return null;
}

Object.assign(window, { MotionEnhancers, attachMagnetic, attachTilt, animateCount });
