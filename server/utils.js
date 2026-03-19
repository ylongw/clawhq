'use strict';
const { execSync, exec } = require('child_process');
const os = require('os');

const HOME = os.homedir();
const ENV = {
  ...process.env,
  PATH: `/usr/sbin:/opt/homebrew/bin:/usr/local/bin:${process.env.PATH}`,
};

function execCmd(cmd, timeout = 10000) {
  try {
    return execSync(cmd, { encoding: 'utf8', timeout, env: ENV, maxBuffer: 2 * 1024 * 1024 }).trim();
  } catch (e) {
    return e.stdout ? e.stdout.trim() : '';
  }
}

function execCmdAsync(cmd, timeout = 10000) {
  return new Promise((resolve) => {
    exec(cmd, { encoding: 'utf8', timeout, env: ENV, maxBuffer: 2 * 1024 * 1024 }, (err, stdout) => {
      resolve((stdout || '').trim());
    });
  });
}

async function fetchJSON(url, timeout = 3000) {
  return new Promise((resolve) => {
    const mod = url.startsWith('https') ? require('https') : require('http');
    const req = mod.get(url, { timeout }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch { resolve(null); }
      });
    });
    req.on('error', () => resolve(null));
    req.on('timeout', () => { req.destroy(); resolve(null); });
  });
}

function formatAge(ageMs = 0) {
  if (ageMs < 60000) return 'just now';
  const m = Math.floor(ageMs / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function formatTokens(totalTokens = 0, contextTokens = 200000) {
  if (!totalTokens || totalTokens <= 0) return `unknown/${Math.round(contextTokens / 1000)}k`;
  return `${Math.round(totalTokens / 1000)}k/${Math.round(contextTokens / 1000)}k`;
}

module.exports = { HOME, ENV, execCmd, execCmdAsync, fetchJSON, formatAge, formatTokens };
