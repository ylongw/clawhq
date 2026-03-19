'use strict';
const { execCmdAsync } = require('../utils');

const PATTERNS = [
  { name: 'Claude Code', pattern: /claude/i,     exclude: /gateway|openclaw|Chrome/i, icon: '🤖', tmuxName: 'cc'   },
  { name: 'Copilot',     pattern: /gh\s+copilot/i, exclude: null,                      icon: '🐙', tmuxName: 'ghcp' },
  { name: 'Codex',       pattern: /\bcodex\b/i,  exclude: /node_modules/i,             icon: '📦', tmuxName: 'codex'},
];
const KNOWN_NAMES = { cc: 'Claude Code', ghcp: 'Copilot', codex: 'Codex' };
const KNOWN_ICONS = { cc: '🤖', ghcp: '🐙', codex: '📦' };

async function getCodingAgents() {
  const agents = [];
  try {
    const psRaw = await execCmdAsync('ps aux 2>/dev/null');
    for (const line of psRaw.split('\n')) {
      for (const p of PATTERNS) {
        if (!p.pattern.test(line)) continue;
        if (p.exclude && p.exclude.test(line)) continue;
        if (/\bgrep\b/.test(line)) continue;
        const parts = line.split(/\s+/);
        if (parts.length < 11) continue;
        const pid = parts[1];
        if (agents.find(a => a.pid === pid)) continue;
        agents.push({
          name: p.name, icon: p.icon, pid,
          cpuPct: parts[2], memPct: parts[3], startTime: parts[8] || '',
          command: parts.slice(10).join(' ').substring(0, 120),
          tmuxName: p.tmuxName, tmuxStatus: 'none',
        });
      }
    }

    const tmuxRaw = await execCmdAsync('tmux list-sessions 2>/dev/null');
    if (tmuxRaw) {
      const tmuxSessions = {};
      for (const line of tmuxRaw.split('\n')) {
        const m = line.match(/^(\S+?):\s+\d+\s+windows/);
        if (m) tmuxSessions[m[1]] = line.includes('attached') ? 'attached' : 'detached';
      }
      for (const agent of agents) {
        if (tmuxSessions[agent.tmuxName]) agent.tmuxStatus = tmuxSessions[agent.tmuxName];
      }
      for (const [name, status] of Object.entries(tmuxSessions)) {
        if (KNOWN_NAMES[name] && !agents.find(a => a.tmuxName === name)) {
          agents.push({
            name: KNOWN_NAMES[name], icon: KNOWN_ICONS[name], pid: '-',
            cpuPct: '-', memPct: '-', startTime: '-',
            command: `tmux session: ${name}`, tmuxName: name, tmuxStatus: status,
          });
        }
      }
    }
  } catch {}
  return agents;
}

module.exports = { getCodingAgents };
