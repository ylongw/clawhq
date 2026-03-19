function renderCodingAgents(agents) {
  const card = document.getElementById('codingAgentsCard');
  document.getElementById('caCount').textContent = agents.length;
  if (!agents.length) { card.style.display = 'none'; return; }
  card.style.display = '';
  const list = document.getElementById('codingAgentsList');
  list.innerHTML = agents.map(a => {
    const tmuxClass = a.tmuxStatus === 'attached' ? 'attached' : a.tmuxStatus === 'detached' ? 'detached' : 'none';
    const tmuxLabel = a.tmuxStatus === 'none' ? 'No tmux' : a.tmuxStatus;
    const tmuxCmd = a.tmuxStatus !== 'none' ? `tmux attach -t ${a.tmuxName}` : '';
    return `<div class="ca-item">
      <span class="ca-icon">${a.icon}</span>
      <div class="ca-info">
        <div class="ca-name">${esc(a.name)}</div>
        <div class="ca-detail">PID ${esc(a.pid)} · CPU ${esc(a.cpuPct)}% · MEM ${esc(a.memPct)}%</div>
      </div>
      ${a.pid !== '-' ? '<span class="ca-running">running</span>' : ''}
      <span class="ca-tmux ${tmuxClass}"
        ${tmuxCmd ? `onclick="navigator.clipboard.writeText('${tmuxCmd}')" title="Copy: ${esc(tmuxCmd)}"` : ''}
      >${esc(tmuxLabel)}</span>
    </div>`;
  }).join('');
}
