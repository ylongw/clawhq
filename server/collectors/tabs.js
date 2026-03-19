'use strict';
const { fetchJSON } = require('../utils');

async function getBrowserTabs() {
  const tabs = await fetchJSON('http://127.0.0.1:18800/json');
  if (!tabs || !Array.isArray(tabs)) return [];
  return tabs
    .filter(t => t.type === 'page' && t.url && !t.url.startsWith('devtools://'))
    .map(t => ({ title: (t.title || 'Untitled').substring(0, 120), url: t.url }));
}

module.exports = { getBrowserTabs };
