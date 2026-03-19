'use strict';
const fs = require('fs');
const path = require('path');
const { HOME, execCmd, formatAge, formatTokens } = require('../utils');

function loadSessionMeta() {
  const sessionsFile = path.join(HOME, '.openclaw/agents/main/sessions/sessions.json');
  try {
    const byKey = JSON.parse(fs.readFileSync(sessionsFile, 'utf8'));
    const bySessionId = {};
    for (const [, meta] of Object.entries(byKey)) {
      const sid = meta?.sessionId;
      if (!sid) continue;
      const prev = bySessionId[sid];
      if (!prev) { bySessionId[sid] = meta; continue; }
      const score = m => (m.label ? 2 : 0) + (m.displayName ? 1 : 0) + (m.groupChannel ? 1 : 0);
      if (score(meta) > score(prev)) bySessionId[sid] = meta;
    }
    return { byKey, bySessionId };
  } catch {
    return { byKey: {}, bySessionId: {} };
  }
}

function formatSessionLabel(key, meta = null) {
  if (key === 'agent:main:main') return '🏠 Main Session';
  if (meta?.label) {
    if (/^cron:/i.test(meta.label)) return '⏰ ' + meta.label.replace(/^cron:\s*/i, '');
    return meta.label;
  }
  if (meta?.displayName) return '💬 ' + meta.displayName;
  if (meta?.groupChannel && meta?.channel) return `💬 ${meta.channel}: ${meta.groupChannel}`;
  if (key.includes('subag')) return '🤖 Subagent: ...' + key.slice(-6);
  if (key.includes('cron')) return '⏰ Cron: ...' + key.slice(-6);
  if (key.includes('disco')) return '💬 Discord: ...' + key.slice(-6);
  return key;
}

function parseActiveSessions(rawJson, sessionsMetaIndex = { byKey: {}, bySessionId: {} }) {
  let data = null;
  try { data = JSON.parse(rawJson); } catch { return []; }
  const items = Array.isArray(data?.sessions) ? data.sessions : [];
  const { byKey, bySessionId } = sessionsMetaIndex;
  const seenSessionIds = new Set();
  const sessions = [];

  for (const s of [...items].sort((a, b) => (a.ageMs || 0) - (b.ageMs || 0))) {
    const key = s.key || '';
    if (!key || key.includes(':run:')) continue;
    const sessionId = s.sessionId || null;
    const meta = (sessionId && bySessionId[sessionId]) || byKey[key] || null;
    if (sessionId && seenSessionIds.has(sessionId)) continue;
    if (sessionId) seenSessionIds.add(sessionId);

    const contextTokens = s.contextTokens || 200000;
    const totalTokens = typeof s.totalTokens === 'number' ? s.totalTokens : 0;
    const pctNum = totalTokens > 0 ? Math.min(100, Math.round((totalTokens / contextTokens) * 100)) : null;
    const ageMs = s.ageMs || 0;
    const state = ageMs < 120000 ? 'RUNNING' : ageMs < 900000 ? 'IDLE' : 'STALE';

    const modelName = s.model || 'unknown';
    const providerRaw = s.modelProvider || '';
    let provider = 'unknown';
    if (providerRaw === 'onekey-codex') provider = 'OneKey Codex';
    else if (providerRaw === 'anthropic') provider = 'Anthropic';
    else if (providerRaw === 'openai' || providerRaw === 'openai-codex') provider = 'OpenAI';
    else if (!providerRaw) {
      if (/gpt|codex|o1|o3|o4/i.test(modelName)) provider = 'OpenAI (inferred)';
      else if (/claude|sonnet|opus|haiku/i.test(modelName)) provider = 'Anthropic (inferred)';
      else if (/gemini/i.test(modelName)) provider = 'Google (inferred)';
    } else { provider = providerRaw; }

    sessions.push({
      kind: s.kind || 'direct',
      label: formatSessionLabel(key, meta),
      key, age: formatAge(ageMs), model: s.model || 'unknown',
      provider, providerRaw,
      tokens: formatTokens(totalTokens, contextTokens),
      tokenPct: pctNum !== null ? `${pctNum}%` : '?',
      state,
    });
  }
  return sessions;
}

function getSubAgentDetails() {
  const sessionsFile = path.join(HOME, '.openclaw/agents/main/sessions/sessions.json');
  const sessionsDir = path.join(HOME, '.openclaw/agents/main/sessions');
  const subagents = [];
  try {
    const sessionsData = JSON.parse(fs.readFileSync(sessionsFile, 'utf8'));
    const now = Date.now();

    for (const [key, meta] of Object.entries(sessionsData)) {
      if (!key.includes('subagent')) continue;
      const sessionId = meta.sessionId;
      const label = meta.label || key.split(':').pop().substring(0, 8);
      const updatedAt = meta.updatedAt || 0;
      const ageMs = now - updatedAt;
      const status = ageMs < 60000 ? 'running' : ageMs < 300000 ? 'idle' : 'done';

      let jsonlPath = null;
      if (meta.sessionFile) {
        for (const c of [meta.sessionFile + '.jsonl', meta.sessionFile]) {
          if (fs.existsSync(c)) { jsonlPath = c; break; }
        }
      }
      if (!jsonlPath) {
        try {
          const files = fs.readdirSync(sessionsDir).filter(f => f.startsWith(sessionId) && f.endsWith('.jsonl'));
          if (files.length > 0) jsonlPath = path.join(sessionsDir, files[0]);
        } catch {}
      }

      let totalToolCalls = 0, firstTimestamp = null, lastToolName = null, recentTools = [];

      if (jsonlPath && fs.existsSync(jsonlPath)) {
        try {
          const stat = fs.statSync(jsonlPath);
          const readSize = Math.min(stat.size, 200 * 1024);
          const fd = fs.openSync(jsonlPath, 'r');
          const buffer = Buffer.alloc(readSize);
          fs.readSync(fd, buffer, 0, readSize, Math.max(0, stat.size - readSize));
          fs.closeSync(fd);

          if (stat.size > readSize) {
            try {
              const firstBuf = Buffer.alloc(Math.min(1024, stat.size));
              const fd2 = fs.openSync(jsonlPath, 'r');
              fs.readSync(fd2, firstBuf, 0, firstBuf.length, 0);
              fs.closeSync(fd2);
              firstTimestamp = JSON.parse(firstBuf.toString('utf8').split('\n')[0]).timestamp;
            } catch {}
          }

          for (const line of buffer.toString('utf8').split('\n').filter(Boolean)) {
            try {
              const obj = JSON.parse(line);
              if (!firstTimestamp && obj.timestamp) firstTimestamp = obj.timestamp;
              const msg = obj.message || obj;
              if (msg.role === 'assistant' && Array.isArray(msg.content)) {
                for (const c of msg.content) {
                  if (c.type === 'toolCall') {
                    totalToolCalls++;
                    lastToolName = c.name;
                    recentTools.push({
                      name: c.name, timestamp: obj.timestamp || '',
                      args: typeof c.arguments === 'object' ? JSON.stringify(c.arguments).substring(0, 100) : '',
                    });
                  }
                }
              }
            } catch {}
          }
        } catch {}
      }

      const durationMs = firstTimestamp ? now - new Date(firstTimestamp).getTime() : 0;
      subagents.push({
        key, label, sessionId, status, updatedAt, ageMs, durationMs,
        totalToolCalls, currentTool: lastToolName, recentTools: recentTools.slice(-5).reverse(),
        spawnedBy: meta.spawnedBy || null, groupChannel: meta.groupChannel || null,
      });
    }

    const order = { running: 0, idle: 1, done: 2 };
    subagents.sort((a, b) => (order[a.status] || 9) - (order[b.status] || 9) || b.updatedAt - a.updatedAt);
  } catch {}
  return subagents;
}

module.exports = { loadSessionMeta, formatSessionLabel, parseActiveSessions, getSubAgentDetails };
