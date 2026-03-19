// ─── RENDER FUNCTIONS ───

function renderHeader(data) {
  const online = data.status.status === 'online';
  const dot = document.getElementById('headerDot');
  const txt = document.getElementById('headerStatusText');
  dot.className = 'header-status-dot ' + (online ? 'online' : 'offline');
  txt.textContent = online ? 'Agent Online' : 'Agent Offline';
}

function renderHero(data) {
  const s = data.status;
  const online = s.status === 'online';
  const el = document.getElementById('heroStatus');
  el.textContent = online ? 'ONLINE' : 'OFFLINE';
  el.className = 'hero-value ' + (online ? 'status-online' : 'status-offline');

  document.getElementById('heroModel').textContent = s.model || '—';
  document.getElementById('heroUptime').textContent = s.uptime || '—';
  document.getElementById('heroPid').textContent = s.pid || '—';

  countUp(document.getElementById('heroSessions'), data.sessions.length);
  countUp(document.getElementById('heroCron'), data.cron.length);
}
