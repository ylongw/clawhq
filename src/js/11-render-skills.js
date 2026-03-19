// ─── NPM TOOLS ───
const NPM_TOOL_ICONS = {
  'openclaw':      '🐾',
  'opencli':       '🌐',
  'gws':           '📧',
  'clawhub':       '🏪',
  'gemini':        '✨',
  'codex':         '📦',
  'agent-browser': '🌍',
  'clawdhub':      '🏪',
};

function renderNpmTools(tools) {
  const grid = document.getElementById('npmToolsGrid');
  const countEl = document.getElementById('npmToolCount');
  if (!tools || !tools.length) {
    grid.innerHTML = '<div class="empty-state">No npm global tools found</div>';
    return;
  }
  countEl.textContent = tools.length;
  grid.innerHTML = tools.map(t => {
    const icon = NPM_TOOL_ICONS[t.cmd] || NPM_TOOL_ICONS[t.bins?.[0]] || '🔧';
    const extraBins = (t.bins || []).filter(b => b !== t.cmd);
    return `<div class="npm-tool-card">
      <div class="npm-tool-icon">${icon}</div>
      <div class="npm-tool-info">
        <div class="npm-tool-header">
          <span class="npm-tool-cmd">${esc(t.cmd)}</span>
          <span class="npm-tool-version">v${esc(t.version)}</span>
        </div>
        <div class="npm-tool-pkg">${esc(t.pkg)}</div>
        ${t.description ? `<div class="npm-tool-desc">${esc(t.description)}</div>` : ''}
        ${extraBins.length ? `<div class="npm-tool-bins">${extraBins.map(b => `<span class="npm-tool-bin-tag">${esc(b)}</span>`).join('')}</div>` : ''}
      </div>
    </div>`;
  }).join('');
}
