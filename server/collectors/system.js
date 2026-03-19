'use strict';

function parseSystemResources(topRaw, vmRaw, memSizeRaw, dfRaw, loadRaw) {
  let cpuUsage = 0;
  try {
    const u = topRaw.match(/([\d.]+)% user/);
    const s = topRaw.match(/([\d.]+)% sys/);
    if (u) cpuUsage += parseFloat(u[1]);
    if (s) cpuUsage += parseFloat(s[1]);
  } catch {}

  let memUsed = 0, memTotal = 0, memPercent = 0;
  try {
    const totalBytes = parseInt(memSizeRaw);
    memTotal = Math.round(totalBytes / 1073741824 * 10) / 10;
    const pageSize = parseInt((vmRaw.match(/page size of (\d+) bytes/) || [])[1] || '16384');
    const parse = key => {
      const m = vmRaw.match(new RegExp(key + ':\\s+(\\d+)'));
      return m ? parseInt(m[1]) : 0;
    };
    memUsed = Math.round((parse('Pages active') + parse('Pages wired down') + parse('Pages occupied by compressor')) * pageSize / 1073741824 * 10) / 10;
    memPercent = Math.round(memUsed / memTotal * 100);
  } catch {}

  let diskUsed = '', diskTotal = '', diskPercent = 0;
  try {
    // df -k outputs 1024-block columns: Filesystem, 1K-blocks, Used, Available, Capacity%, ...
    // On macOS APFS, Capacity = used/(used+avail), which differs from used/total due to purgeable space.
    // We compute percent from used/(used+avail) to stay consistent with the numbers we display.
    const lines = dfRaw.trim().split('\n').filter(l => l.trim() && !l.startsWith('Filesystem'));
    const parts = lines[lines.length - 1].split(/\s+/);
    if (parts.length >= 4) {
      const usedKB  = parseInt(parts[2]);
      const availKB = parseInt(parts[3]);
      const totalKB = usedKB + availKB;
      const toGi = kb => (kb / 1048576).toFixed(1) + 'Gi';
      diskUsed    = toGi(usedKB);
      diskTotal   = toGi(totalKB);
      diskPercent = totalKB > 0 ? Math.round(usedKB / totalKB * 100) : 0;
    }
  } catch {}

  let loadAvg = '';
  try { loadAvg = loadRaw.replace(/[{}]/g, '').trim(); } catch {}

  return { cpuUsage: Math.round(cpuUsage), memUsed, memTotal, memPercent, diskUsed, diskTotal, diskPercent, loadAvg };
}

module.exports = { parseSystemResources };
