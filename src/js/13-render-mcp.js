// ─── MAIN REFRESH ───
async function refresh() {
  try {
    const res = await fetch('/api/data');
    const data = await res.json();
    if (data.error) return;

    renderHeader(data);
    renderHero(data);
    renderResources(data.system);
    renderSessions(data.sessions || []);
    renderSubagents(data.subagents || []);
    renderCodingAgents(data.codingAgents || []);
    renderCron(data.cron || []);
    renderActivity(data.activity || []);
    if (data.skills && data.skills.length) renderSkills(data.skills);
    if (data.npmTools) renderNpmTools(data.npmTools);
    if (data.mcpServers) renderMcpServers(data.mcpServers);
    if (data.services)   renderServices(data.services);

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    document.getElementById('lastUpdateText').textContent = now;
    document.getElementById('footerTime').textContent = now;
  } catch (e) {
    document.getElementById('lastUpdateText').textContent = 'Error';
  }
}
