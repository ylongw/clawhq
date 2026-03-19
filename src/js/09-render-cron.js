function renderActivity(items) {
  document.getElementById('actCount').textContent = items.length;
  const el = document.getElementById('activityFeed');
  if (!items.length) { el.innerHTML = '<div class="empty-state">No recent activity</div>'; return; }
  el.innerHTML = items.map(a => {
    const cc = channelClass(a.channel);
    return `<div class="activity-item">
      <div class="activity-meta">
        <span class="activity-time">${esc(formatTime(a.timestamp))}</span>
        <span class="activity-channel-badge ${cc}">${esc(a.channel)}</span>
      </div>
      <div class="activity-text">${esc(a.content)}</div>
    </div>`;
  }).join('');
}
