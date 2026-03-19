// ─── SERVICES NAVIGATION ───

// Group by category for display order
const SVC_CATEGORY_ORDER = ['Monitor', 'Download', 'Media', 'NAS', 'Security', 'Smart Home', 'Network'];

function renderServices(services) {
  const grid = document.getElementById('svcGrid');
  const countEl = document.getElementById('svcCount');
  if (!services || !services.length) {
    grid.innerHTML = '<div class="empty-state">No services configured</div>';
    return;
  }
  countEl.textContent = services.length;

  // Sort by category order then name
  const sorted = [...services].sort((a, b) => {
    const ai = SVC_CATEGORY_ORDER.indexOf(a.category);
    const bi = SVC_CATEGORY_ORDER.indexOf(b.category);
    const ci = (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi);
    return ci !== 0 ? ci : a.name.localeCompare(b.name);
  });

  grid.innerHTML = sorted.map(s => {
    const modeCls  = s.mode === 'cf-tunnel' ? 'svc-cf' : 'svc-relay';
    const modeLabel = s.mode === 'cf-tunnel' ? 'CF Tunnel' : 'relay46';
    return `<a class="svc-card" href="${esc(s.url)}" target="_blank" rel="noopener">
      <div class="svc-icon">${esc(s.icon || '🌐')}</div>
      <div class="svc-info">
        <div class="svc-header">
          <span class="svc-name">${esc(s.name)}</span>
          <span class="svc-badge ${modeCls}">${modeLabel}</span>
        </div>
        <div class="svc-cat">${esc(s.category || '')}</div>
        ${s.description ? `<div class="svc-desc">${esc(s.description)}</div>` : ''}
        <div class="svc-url">${esc(s.url)}</div>
      </div>
    </a>`;
  }).join('');
}
