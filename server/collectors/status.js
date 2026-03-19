'use strict';
const { execCmd } = require('../utils');

function parseAgentStatus(raw) {
  const pidMatch = raw.match(/pid\s+(\d+)/);
  const pid = pidMatch ? pidMatch[1] : null;
  const running = /Runtime:\s*running/i.test(raw);
  let uptime = 'N/A';
  if (pid) {
    try { uptime = execCmd(`ps -o etime= -p ${pid}`).trim(); } catch {}
  }
  return { status: running ? 'online' : 'offline', uptime, model: 'claude-opus-4-6', pid: pid || 'N/A' };
}

module.exports = { parseAgentStatus };
