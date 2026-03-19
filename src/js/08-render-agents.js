function renderCron(jobs) {
  document.getElementById('cronCount').textContent = jobs.length;
  const el = document.getElementById('cronList');
  if (!jobs.length) { el.innerHTML = '<div class="empty-state">No scheduled tasks</div>'; return; }
  el.innerHTML = jobs.map(j => {
    const dotColor = j.status === 'ok' ? 'var(--green)' : j.status === 'error' ? 'var(--red)' : 'var(--orange)';
    const bc = j.status === 'ok' ? 'ok' : j.status === 'error' ? 'error' : 'pending';
    return `<div class="cron-item">
      <div class="cron-status-dot" style="background:${dotColor}"></div>
      <div class="cron-info">
        <div class="cron-name">${esc(j.name)}</div>
        <div class="cron-meta">${esc(j.schedule)} · Last: ${esc(j.last || j.lastRun || '—')}</div>
      </div>
      <span class="cron-badge ${bc}">${esc(j.status || 'ok')}</span>
    </div>`;
  }).join('');
}
