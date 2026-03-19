'use strict';
const http = require('http');
const fs   = require('fs');
const path = require('path');

const { execCmdAsync } = require('./server/utils');
const { parseAgentStatus }                           = require('./server/collectors/status');
const { loadSessionMeta, parseActiveSessions, getSubAgentDetails } = require('./server/collectors/sessions');
const { parseSystemResources }                       = require('./server/collectors/system');
const { getCodingAgents }                            = require('./server/collectors/agents');
const { getBrowserTabs }                             = require('./server/collectors/tabs');
const { parseCronJobs }                              = require('./server/collectors/cron');
const { getRecentActivity }                          = require('./server/collectors/activity');
const { getSkills, getNpmTools, getMcpServers, getServices } = require('./server/collectors/tools');

const PORT             = 8902;
const COLLECT_INTERVAL = 5000;

let cachedData = null;
let collecting = false;

async function getAllData() {
  // CPU must run isolated first — parallel commands inflate the delta
  const topRaw = await execCmdAsync("top -l 2 -n 0 2>/dev/null | grep 'CPU usage' | tail -1");

  const [
    statusRaw, sessionsRaw, cronRaw,
    vmRaw, memSizeRaw, dfRaw, loadRaw,
    tabs, codingAgents,
  ] = await Promise.all([
    execCmdAsync('openclaw gateway status 2>&1'),
    execCmdAsync('openclaw sessions --json 2>&1'),
    execCmdAsync("openclaw cron list 2>&1 | grep -v '│\\|◇\\|├\\|─\\|╭\\|╰'"),
    execCmdAsync('vm_stat'),
    execCmdAsync('/usr/sbin/sysctl -n hw.memsize'),
    execCmdAsync('df -k /'),
    execCmdAsync('/usr/sbin/sysctl -n vm.loadavg'),
    getBrowserTabs(),
    getCodingAgents(),
  ]);

  const sessionsMeta = loadSessionMeta();

  return {
    status:       parseAgentStatus(statusRaw),
    sessions:     parseActiveSessions(sessionsRaw, sessionsMeta),
    cron:         parseCronJobs(cronRaw),
    system:       parseSystemResources(topRaw, vmRaw, memSizeRaw, dfRaw, loadRaw),
    activity:     getRecentActivity(),
    subagents:    getSubAgentDetails(),
    codingAgents,
    tabs,
    skills:       getSkills(),
    npmTools:     getNpmTools(),
    mcpServers:   getMcpServers(),
    services:     getServices(),
    timestamp:    new Date().toISOString(),
  };
}

async function collectLoop() {
  if (collecting) return;
  collecting = true;
  try { cachedData = await getAllData(); }
  catch (e) { console.error('[ClawHQ] Collection error:', e.message); }
  finally { collecting = false; }
}

collectLoop();
setInterval(collectLoop, COLLECT_INTERVAL);

// ─── HTTP Server ───
const server = http.createServer((req, res) => {
  if (req.url === '/api/data') {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(cachedData ? JSON.stringify(cachedData) : JSON.stringify({ error: 'Collecting...' }));
  } else if (req.url === '/' || req.url === '/index.html') {
    const htmlPath = path.join(__dirname, 'index.html');
    fs.readFile(htmlPath, (err, content) => {
      if (err) { res.writeHead(500); res.end('Error'); return; }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
    });
  } else {
    res.writeHead(404); res.end('Not found');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🐾 ClawHQ running at http://127.0.0.1:${PORT}`);
  console.log(`   Background collection every ${COLLECT_INTERVAL / 1000}s`);
});
