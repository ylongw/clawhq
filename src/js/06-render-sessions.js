function renderSubagents(subs) {
  document.getElementById('saCount').textContent = subs.length;
  const wrap = document.getElementById('subagentsWrap');
  if (!subs.length) {
    wrap.innerHTML = '<div class="empty-state">No active sub-agents</div>';
    return;
  }
  wrap.innerHTML = '<div class="subagents-flex">' + subs.map(sa => {
    const hasTool = !!sa.currentTool;
    return `<div class="sa-card">
      <div class="sa-card-header">
        <div class="sa-dot ${sa.status}"></div>
        <div class="sa-name">${esc(sa.label)}</div>
        <div class="sa-duration">${formatDuration(sa.durationMs)}</div>
      </div>
      <div class="sa-stats-row">
        <div class="sa-stat">
          <div class="sa-stat-label">Tools</div>
          <div class="sa-stat-value ${sa.status === 'running' ? 'green' : ''}">${sa.totalToolCalls}</div>
        </div>
        <div style="flex:1"></div>
        <div class="sa-tool-pill ${hasTool ? '' : 'idle'}">
          ${hasTool ? toolIcon(sa.currentTool) + ' ' + esc(sa.currentTool) : 'idle'}
        </div>
      </div>
    </div>`;
  }).join('') + '</div>';
}
