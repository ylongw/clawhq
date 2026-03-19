function renderResources(sys) {
  setCpuArc(Math.round(sys.cpuUsage));

  const memPct = sys.memPercent;
  document.getElementById('memValueTxt').textContent = `${sys.memUsed} / ${sys.memTotal} GB (${memPct}%)`;
  const mf = document.getElementById('memFill');
  mf.style.width = memPct + '%';
  mf.className = 'progress-fill ' + progressClass(memPct);

  const diskPct = sys.diskPercent;
  document.getElementById('diskValueTxt').textContent = `${sys.diskUsed} / ${sys.diskTotal} (${diskPct}%)`;
  const df = document.getElementById('diskFill');
  df.style.width = diskPct + '%';
  df.className = 'progress-fill ' + progressClass(diskPct);

  document.getElementById('loadAvgTxt').textContent = sys.loadAvg || '—';
}

function renderSessions(sessions) {
  document.getElementById('sessCount').textContent = sessions.length;
  const list = document.getElementById('sessionList');
  if (!sessions.length) {
    list.innerHTML = '<li><div class="empty-state">No active sessions</div></li>';
    return;
  }
  list.innerHTML = sessions.slice(0, 20).map(s => {
    const pct = parseInt(s.tokenPct) || 0;
    const dotColor = s.kind === 'group' ? '#2a9d5c' : s.label.includes('⏰') ? '#c96a3a' : '#c96a3a';
    const fillClass = pct >= 80 ? 'critical' : pct >= 60 ? 'warn' : '';
    const stateClass = (s.state || 'IDLE').toLowerCase();
    return `<li class="session-item">
      <div class="session-kind-dot" style="background:${dotColor}"></div>
      <div class="session-info">
        <div class="session-name">
          <span class="session-title">${esc(s.label)}</span>
          <span class="session-state ${stateClass}">${esc(s.state || 'IDLE')}</span>
        </div>
        <div class="session-meta">${esc(s.model)} @ ${esc(s.provider || 'unknown')} · Ctx ${esc(s.tokens)} · ${esc(s.age)}</div>
      </div>
      <div class="session-right">
        <div class="session-token-pct">${esc(s.tokenPct || '?')}</div>
        <div class="session-token-bar">
          <div class="session-token-fill ${fillClass}" style="width:${Math.min(pct,100)}%"></div>
        </div>
      </div>
    </li>`;
  }).join('');
}
