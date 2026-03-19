// ─── COUNT-UP ANIMATION ───
const _counters = {};
function countUp(el, targetStr) {
  const parsed = parseInt(targetStr);
  if (isNaN(parsed)) {
    el.textContent = targetStr;
    return;
  }
  const key = el.id || Math.random();
  if (_counters[key]) cancelAnimationFrame(_counters[key]);
  const startVal = parseInt(el.textContent) || 0;
  const start = performance.now();
  const duration = 600;

  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(startVal + (parsed - startVal) * ease);
    if (progress < 1) _counters[key] = requestAnimationFrame(step);
  }
  _counters[key] = requestAnimationFrame(step);
}

// ─── CPU ARC ───
function setCpuArc(pct) {
  const arc = document.getElementById('cpuArcPath');
  const txt = document.getElementById('cpuGaugePct');
  if (!arc || !txt) return;
  const offset = ARC_LEN - (ARC_LEN * Math.min(pct, 100) / 100);
  arc.style.strokeDashoffset = offset;
  const clr = pct >= 90 ? 'var(--red)' : pct >= 70 ? 'var(--orange)' : 'var(--blue)';
  arc.style.stroke = clr;
  txt.textContent = pct + '%';
}
