'use strict';
const fs = require('fs');
const path = require('path');
const { HOME, execCmd } = require('../utils');

function getSkills() {
  try {
    const rawAll = execCmd('openclaw skills list --json 2>&1', 15000);
    // Strip log prefix lines like "[openclaw] log file size cap reached..."
    const raw = rawAll.replace(/^\[openclaw\][^\n]*\n?/gm, '').trim();
    const data = JSON.parse(raw);
    return (data.skills || []).map(s => ({
      name: s.name,
      emoji: s.emoji || '🧩',
      description: (s.description || '').substring(0, 100),
      ready: s.eligible && !s.disabled,
      source: s.source || 'unknown',
    }));
  } catch { return []; }
}

function getNpmTools() {
  const npmLib = '/opt/homebrew/lib/node_modules';
  const skip = new Set(['corepack', 'npm']);
  const results = [];

  const readPkg = (pkgName, dir) => {
    const pjPath = path.join(dir, 'package.json');
    if (!fs.existsSync(pjPath)) return;
    let d;
    try { d = JSON.parse(fs.readFileSync(pjPath, 'utf8')); } catch { return; }
    const b = d.bin || {};
    const bins = typeof b === 'object' ? Object.keys(b) : (b ? [b] : []);
    if (!bins.length) return;
    results.push({ pkg: pkgName, version: d.version || '?', bins, cmd: bins[0], description: (d.description || '').substring(0, 90) });
  };

  try {
    for (const entry of fs.readdirSync(npmLib)) {
      if (entry.startsWith('.') || skip.has(entry)) continue;
      if (entry.startsWith('@')) {
        const scopeDir = path.join(npmLib, entry);
        for (const sub of fs.readdirSync(scopeDir)) readPkg(`${entry}/${sub}`, path.join(scopeDir, sub));
      } else {
        readPkg(entry, path.join(npmLib, entry));
      }
    }
  } catch {}

  return results.sort((a, b) => a.cmd.localeCompare(b.cmd));
}

function getMcpServers() {
  const results = [];

  // 1. npx cache
  try {
    const npxDir = path.join(HOME, '.npm/_npx');
    if (fs.existsSync(npxDir)) {
      const seen = new Set();
      for (const hash of fs.readdirSync(npxDir)) {
        const pj = path.join(npxDir, hash, 'package.json');
        if (!fs.existsSync(pj)) continue;
        let meta;
        try { meta = JSON.parse(fs.readFileSync(pj, 'utf8')); } catch { continue; }
        for (const [pkg, ver] of Object.entries(meta.dependencies || {})) {
          if (!pkg.toLowerCase().includes('mcp') || seen.has(pkg)) continue;
          seen.add(pkg);
          const depPj = path.join(npxDir, hash, 'node_modules', pkg, 'package.json');
          let desc = '', resolvedVer = ver.replace(/^\^|~/, '');
          if (fs.existsSync(depPj)) {
            try { const d = JSON.parse(fs.readFileSync(depPj, 'utf8')); desc = (d.description || '').substring(0, 90); resolvedVer = d.version || resolvedVer; } catch {}
          }
          results.push({ name: pkg, version: resolvedVer, description: desc, source: 'npx-cache', command: `npx ${pkg}` });
        }
      }
    }
  } catch {}

  // 2. Claude Code global mcpServers
  try {
    const claudeJson = path.join(HOME, '.claude.json');
    if (fs.existsSync(claudeJson)) {
      const d = JSON.parse(fs.readFileSync(claudeJson, 'utf8'));
      for (const [name, cfg] of Object.entries(d.mcpServers || {})) {
        results.push({ name, version: '-', description: cfg.description || '', source: 'claude-global', command: [cfg.command, ...(cfg.args || [])].join(' ') });
      }
    }
  } catch {}

  // 3. Project-level .mcp.json
  const seenProjects = new Set();
  for (const baseDir of [path.join(HOME, 'Documents/dec'), path.join(HOME, '.openclaw/workspace')]) {
    try {
      if (!fs.existsSync(baseDir)) continue;
      for (const proj of fs.readdirSync(baseDir)) {
        const mcpFile = path.join(baseDir, proj, '.mcp.json');
        if (!fs.existsSync(mcpFile)) continue;
        let d;
        try { d = JSON.parse(fs.readFileSync(mcpFile, 'utf8')); } catch { continue; }
        for (const [name, cfg] of Object.entries(d.mcpServers || {})) {
          const key = `${proj}:${name}`;
          if (seenProjects.has(key)) continue;
          seenProjects.add(key);
          results.push({ name, version: '-', description: cfg.description || `in ${proj}`, source: `project:${proj}`, command: [cfg.command, ...(cfg.args || [])].join(' '), project: proj });
        }
      }
    } catch {}
  }

  return results;
}

function getServices() {
  try {
    const p = path.join(__dirname, '../../data/services.json');
    const d = JSON.parse(fs.readFileSync(p, 'utf8'));
    return d.services || [];
  } catch { return []; }
}

module.exports = { getSkills, getNpmTools, getMcpServers, getServices };
