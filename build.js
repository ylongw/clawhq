#!/usr/bin/env node
/**
 * ClawHQ build script — zero dependencies, pure Node.js
 * Usage: node build.js
 * Output: index.html (concatenates src/style.css + src/js/*.js into src/template.html)
 */
'use strict';
const fs   = require('fs');
const path = require('path');

const ROOT     = __dirname;
const SRC      = path.join(ROOT, 'src');
const OUT_FILE = path.join(ROOT, 'index.html');

// 1. Read template
const template = fs.readFileSync(path.join(SRC, 'template.html'), 'utf8');

// 2. Read CSS
const css = fs.readFileSync(path.join(SRC, 'style.css'), 'utf8');

// 3. Read JS files in sorted order (00-*, 01-*, ..., 99-*)
const jsDir   = path.join(SRC, 'js');
const jsFiles = fs.readdirSync(jsDir).filter(f => f.endsWith('.js')).sort();
const js      = jsFiles.map(f => {
  const content = fs.readFileSync(path.join(jsDir, f), 'utf8');
  return `// ── ${f} ──\n${content}`;
}).join('\n\n');

// 4. Inject into template
const html = template
  .replace('/* __STYLE__ */', css)
  .replace('// __SCRIPT__\n', js);

// 5. Write output
fs.writeFileSync(OUT_FILE, html, 'utf8');

const stats = {
  template: template.length,
  css:      css.length,
  js:       js.length,
  output:   html.length,
  jsFiles:  jsFiles.length,
};

console.log('🔨 ClawHQ build complete');
console.log(`   template: ${(stats.template / 1024).toFixed(1)}KB`);
console.log(`   style.css: ${(stats.css / 1024).toFixed(1)}KB`);
console.log(`   js files: ${stats.jsFiles} files, ${(stats.js / 1024).toFixed(1)}KB`);
console.log(`   → index.html: ${(stats.output / 1024).toFixed(1)}KB`);
