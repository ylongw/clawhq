// ─── ELEVATION SWITCH (replaces glass intensity for flat Claude theme) ───
// L = airy/minimal border, M = default, H = more defined/prominent
const GLASS_PRESETS = {
  light: {
    '--surface':            'hsl(48, 25%, 99%)',
    '--surface-hover':      'hsl(46, 22%, 97%)',
    '--border':             'hsl(40, 12%, 92%)',
    '--border-strong':      'hsl(38, 14%, 86%)',
    '--card-bg':            'hsl(48, 25%, 99%)',
    '--card-bg-hover':      'hsl(46, 22%, 97%)',
    '--glass-border':       'hsl(40, 12%, 92%)',
    '--glass-border-strong':'hsl(38, 14%, 86%)'
  },
  medium: {
    '--surface':            'hsl(44, 30%, 98%)',
    '--surface-hover':      'hsl(42, 25%, 96%)',
    '--border':             'hsl(38, 18%, 88%)',
    '--border-strong':      'hsl(35, 20%, 80%)',
    '--card-bg':            'hsl(44, 30%, 98%)',
    '--card-bg-hover':      'hsl(42, 25%, 96%)',
    '--glass-border':       'hsl(38, 18%, 88%)',
    '--glass-border-strong':'hsl(35, 20%, 80%)'
  },
  heavy: {
    '--surface':            'hsl(40, 28%, 96%)',
    '--surface-hover':      'hsl(38, 24%, 94%)',
    '--border':             'hsl(35, 22%, 82%)',
    '--border-strong':      'hsl(32, 24%, 74%)',
    '--card-bg':            'hsl(40, 28%, 96%)',
    '--card-bg-hover':      'hsl(38, 24%, 94%)',
    '--glass-border':       'hsl(35, 22%, 82%)',
    '--glass-border-strong':'hsl(32, 24%, 74%)'
  }
};

function setGlassIntensity(level) {
  const preset = GLASS_PRESETS[level] || GLASS_PRESETS.medium;
  const root = document.documentElement;
  Object.entries(preset).forEach(([k, v]) => root.style.setProperty(k, v));

  document.querySelectorAll('.glass-switch').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.glass === level);
  });

  try { localStorage.setItem('clawhq.glassIntensity', level); } catch {}
}

function initGlassIntensity() {
  let lv = 'medium';
  try { lv = localStorage.getItem('clawhq.glassIntensity') || 'medium'; } catch {}
  if (!GLASS_PRESETS[lv]) lv = 'medium';
  setGlassIntensity(lv);
}
