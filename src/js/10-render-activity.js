let _allSkills = [];
let _showMissing = false;

function toggleMissingSkills() {
  _showMissing = !_showMissing;
  const btn = document.getElementById('skillToggleBtn');
  btn.textContent = _showMissing ? 'Hide Missing' : 'Show Missing';
  renderSkillsUI();
}

function renderSkillsUI() {
  const grid = document.getElementById('skillsGrid');
  const skills = (_showMissing ? _allSkills : _allSkills.filter(s => s.ready))
    .slice().sort((a, b) => a.name.localeCompare(b.name));
  if (!skills.length) {
    grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1">No skills data</div>';
    return;
  }
  grid.innerHTML = skills.map(s => `
    <div class="skill-card">
      <span class="skill-emoji">${esc(s.emoji || '🧩')}</span>
      <div class="skill-info">
        <div class="skill-name">${esc(s.name)}</div>
        <div class="skill-desc">${esc(s.description)}</div>
      </div>
      <div class="skill-dot ${s.ready ? 'ready' : 'missing'}"></div>
    </div>
  `).join('');
}

function renderSkills(skills) {
  if (!skills || !skills.length) return;
  _allSkills = skills;
  document.getElementById('skillCount').textContent = skills.length;
  renderSkillsUI();
}
