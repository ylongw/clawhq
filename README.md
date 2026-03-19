# ClawHQ

Real-time [OpenClaw](https://openclaw.ai) Agent Dashboard — monitor sessions, browser tabs, cron jobs, skills, and system resources from a single web UI.

![ClawHQ Dashboard](https://img.shields.io/badge/OpenClaw-Dashboard-orange)

## Features

- **Active Sessions** — live view of running agent sessions with model, token usage, cost
- **System Resources** — CPU, RAM, Disk with progress bars
- **Cron Jobs** — scheduled tasks with last/next run times
- **Browser Tabs** — open tabs in the OpenClaw-managed browser
- **Skills** — installed skills with ready/missing status, sorted alphabetically
- **NPM Tools** — globally installed CLI tools
- **MCP Servers** — configured Model Context Protocol servers
- **Services** — custom links to your self-hosted services (configurable)

## Requirements

- [OpenClaw](https://openclaw.ai) installed and running
- Node.js 18+
- No npm dependencies — pure Node.js stdlib

## Quick Start

```bash
git clone https://github.com/ylongw/clawhq.git
cd clawhq
mkdir -p logs

# Start the server
node server.js
# → http://localhost:8902
```

## Configuration

### Port

Set via environment variable:

```bash
PORT=9000 node server.js
```

Or edit `server.js`:
```js
const PORT = 8902;
```

### Services Panel

Edit `data/services.json` to add your own self-hosted services:

```json
{
  "services": [
    {
      "name": "My Service",
      "url": "https://service.yourdomain.com",
      "mode": "cf-tunnel",
      "icon": "🔧",
      "category": "Tools",
      "description": "Description of what this does"
    }
  ]
}
```

`mode` accepts: `cf-tunnel`, `relay46`, `local` — shown as colored labels on each card.

## Run as a Background Service (macOS)

Use [local-publish](https://github.com/ylongw/local-publish) skill to generate LaunchAgent plists:

```bash
python3 scripts/create_launchagents.py \
  --label clawhq \
  --server-cmd "node /path/to/clawhq/server.js" \
  --workdir /path/to/clawhq \
  --port 8902 \
  --tunnel-config ~/.cloudflared/clawhq.yml
```

Then load:
```bash
launchctl load ~/Library/LaunchAgents/com.clawhq.server.plist
```

## Publish Publicly via Cloudflare Tunnel

1. `cloudflared tunnel create clawhq`
2. `cloudflared tunnel route dns clawhq dashboard.yourdomain.com`
3. Create `~/.cloudflared/clawhq.yml` pointing to `http://localhost:8902`
4. Run `cloudflared tunnel --config ~/.cloudflared/clawhq.yml --protocol http2 run`

See [local-publish](https://github.com/ylongw/local-publish) for full instructions.

## Development

```bash
# Edit source files in src/
# Then rebuild index.html:
node build.js
```

Source layout:
```
src/
├── template.html       # HTML structure
├── style.css           # Design tokens + all styles
└── js/
    ├── 01-utils.js
    ├── 05-render-resources.js
    ├── 10-render-activity.js
    └── ...             # 16 modules, concatenated by build.js
```

## Design System

Styled after [Claude.ai](https://claude.ai) — warm cream background, terracotta accent, flat solid cards.
See [claude-style](https://github.com/ylongw/claude-style) OpenClaw skill to apply this design to other projects.

## License

MIT
