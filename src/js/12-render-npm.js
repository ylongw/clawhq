// ─── MCP SERVERS ───
const MCP_ICONS = {
  'chrome-devtools-mcp': '🔍',
  '@playwright/mcp':     '🎭',
  'mcporter':            '🚢',
  'kicad-sch-api':       '🔧',
};
const MCP_SOURCE_LABELS = {
  'npx-cache':     ['npx', 'mcp-source-npx'],
  'claude-global': ['claude', 'mcp-source-claude'],
};

function renderMcpServers(servers) {
  const grid = document.getElementById('mcpGrid');
  const countEl = document.getElementById('mcpCount');
  if (!servers || !servers.length) {
    grid.innerHTML = '<div class="empty-state">No MCP servers found</div>';
    return;
  }
  countEl.textContent = servers.length;
  grid.innerHTML = servers.map(s => {
    const icon = MCP_ICONS[s.name] || '🔌';
    let sourceLabel = s.source, sourceCls = 'mcp-source-project';
    if (s.source === 'npx-cache') { sourceLabel = 'npx'; sourceCls = 'mcp-source-npx'; }
    else if (s.source === 'claude-global') { sourceLabel = 'claude'; sourceCls = 'mcp-source-claude'; }
    else if (s.source && s.source.startsWith('project:')) {
      sourceLabel = s.source.replace('project:', '');
      sourceCls = 'mcp-source-project';
    }
    return `<div class="mcp-card">
      <div class="mcp-card-icon">${icon}</div>
      <div class="mcp-card-info">
        <div class="mcp-card-header">
          <span class="mcp-card-name">${esc(s.name)}</span>
          ${s.version && s.version !== '-' ? `<span class="mcp-card-version">v${esc(s.version)}</span>` : ''}
          <span class="mcp-source-tag ${sourceCls}">${esc(sourceLabel)}</span>
        </div>
        ${s.description ? `<div class="mcp-card-desc">${esc(s.description)}</div>` : ''}
        <div class="mcp-card-cmd">${esc(s.command)}</div>
      </div>
    </div>`;
  }).join('');
}
