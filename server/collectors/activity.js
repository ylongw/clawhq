'use strict';
const fs = require('fs');
const path = require('path');
const { HOME, execCmd } = require('../utils');

function getRecentActivity() {
  const sessionsDir = path.join(HOME, '.openclaw/agents/main/sessions');
  try {
    const files = fs.readdirSync(sessionsDir)
      .filter(f => f.endsWith('.jsonl'))
      .map(f => ({ name: f, mtime: fs.statSync(path.join(sessionsDir, f)).mtimeMs }))
      .sort((a, b) => b.mtime - a.mtime)
      .slice(0, 8);

    const activities = [];
    for (const file of files) {
      const fp = path.join(sessionsDir, file.name);
      const content = execCmd(`tail -150 "${fp}" 2>/dev/null`);
      for (const line of content.split('\n').filter(Boolean)) {
        try {
          const obj = JSON.parse(line);
          const msg = obj.message || obj;
          if (msg.role !== 'assistant' || !msg.content) continue;
          let text = typeof msg.content === 'string'
            ? msg.content
            : (Array.isArray(msg.content) ? msg.content.filter(c => c.type === 'text').map(c => c.text).join(' ') : '');
          if (!text || text.length < 15) continue;
          let channel = file.name.replace('.jsonl', '');
          if (channel.includes('topic-'))    channel = 'discord';
          else if (channel.includes('cron')) channel = 'cron';
          else if (channel.includes('subagent')) channel = 'subagent';
          else if (channel === 'main' || channel.length > 30) channel = channel.substring(0, 8);
          activities.push({
            timestamp: obj.timestamp || msg.timestamp || '',
            channel,
            content: text.substring(0, 300).replace(/\n/g, ' ').replace(/\s+/g, ' '),
          });
        } catch {}
      }
    }
    activities.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
    return activities.slice(0, 25);
  } catch (e) {
    return [{ timestamp: '', channel: 'error', content: e.message }];
  }
}

module.exports = { getRecentActivity };
