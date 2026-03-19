// ─── CONSTANTS ───
const REFRESH_MS = 5000;
const ARC_LEN = 201; // half-circle perimeter ≈ π * r = π * 64 ≈ 201

const TOOL_ICONS = {
  exec:'⚡', web_search:'🔍', web_fetch:'🌐',
  Edit:'✏️', edit:'✏️', Read:'📖', read:'📖',
  Write:'📝', write:'📝', browser:'🌐',
  message:'💬', image:'🖼️', memory_search:'🧠',
  sessions_spawn:'🚀', process:'⚙️', canvas:'🎨',
  tts:'🔊', subagents:'🤖', nodes:'📡',
};
function toolIcon(n) { return TOOL_ICONS[n] || '🔧'; }
