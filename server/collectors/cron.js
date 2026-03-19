'use strict';

function parseCronJobs(raw) {
  const lines = raw.split('\n');
  const jobs = [];
  const header = lines.find(l => l.startsWith('ID'));
  if (!header) return jobs;
  const namePos   = header.indexOf('Name');
  const schedPos  = header.indexOf('Schedule');
  const nextPos   = header.indexOf('Next');
  const lastPos   = header.indexOf('Last');
  const statusPos = header.indexOf('Status');
  for (const line of lines) {
    if (line.startsWith('ID') || !line.trim() || !line.match(/^[0-9a-f]{8}/)) continue;
    const name = line.substring(namePos, schedPos).trim();
    if (!name) continue;
    jobs.push({
      id:       line.substring(0, namePos).trim(),
      name,
      schedule: line.substring(schedPos, nextPos).trim(),
      next:     line.substring(nextPos, lastPos).trim(),
      last:     line.substring(lastPos, statusPos).trim(),
      status:   line.substring(statusPos, statusPos + 10).trim(),
    });
  }
  return jobs;
}

module.exports = { parseCronJobs };
