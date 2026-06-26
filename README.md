# ACT Overlay

Hyper-modern combat telemetry overlay for FFXIV, compatible with [IINACT](https://www.iinact.com/) and ACT OverlayPlugin.

## Live demo

After publishing to GitHub Pages, your overlay URL will be:

```
https://<your-username>.github.io/<repo-name>/?OVERLAY_WS=ws://127.0.0.1:10501/ws
```

The `?OVERLAY_WS=ws://127.0.0.1:10501/ws` suffix is required — it connects the overlay to IINACT's WebSocket server.

## Use in FFXIV with IINACT

### 1. Install IINACT

1. Add the IINACT repo in Dalamud: `https://raw.githubusercontent.com/marzent/IINACT/main/repo.json`
2. Install and enable **IINACT** from the plugin installer
3. Set logging filter to at least **Party** so combat data is captured

See [IINACT installation guide](https://www.iinact.com/installation/) for details.

### 2. Install an overlay renderer

| Platform | Plugin |
|----------|--------|
| Windows | [Browsingway](https://github.com/MeowthDev/Browsingway) |
| Linux | [HUDKit](https://github.com/anko/hudkit) |
| macOS | [BunnyHUD](https://github.com/marzent/Bunny-HUD) |

### 3. Add this overlay

**Option A — paste the URL manually**

In your overlay renderer (e.g. Browsingway `/bw config`), create a new inlay with:

```
https://<your-username>.github.io/<repo-name>/?OVERLAY_WS=ws://127.0.0.1:10501/ws
```

**Option B — use IINACT's overlay generator**

Run `/iinact` in-game, select your overlay URL from the list, and paste it into Browsingway/HUDKit.

> If IINACT generates a proxy URL and the overlay doesn't connect, use the direct GitHub Pages URL with the `OVERLAY_WS` parameter instead.

### 4. Configure the inlay

- Set background to **transparent**
- Position and resize as needed
- Lock the overlay when you're happy with placement

Pull aggro in a training dummy and the DPS meter should populate within a second of entering combat.

## Publish to GitHub

### First-time setup

```bash
git init
git add .
git commit -m "Initial commit: ACT overlay for IINACT"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

### Enable GitHub Pages

1. Go to **Settings → Pages**
2. Under **Build and deployment**, set Source to **GitHub Actions**
3. Push to `main` — the deploy workflow builds and publishes automatically

Your overlay will be live at `https://<your-username>.github.io/<repo-name>/` within a minute or two.

### Configure meter blocks

Each panel can show a different metric. Available metrics:

| Metric | Rate | Description |
|--------|------|-------------|
| `damage` | DPS | Damage dealt |
| `healing` | HPS | Healing done |
| `damageTaken` | DTPS | Damage taken |
| `healsTaken` | HTPS | Healing received |

**URL config** — pass blocks and layout as query params:

```
...&blocks=damage,healing,damageTaken&layout=79.0,2.2;79.0,18.0;79.0,42.0
```

Layout pairs are `x,y` percentages (semicolon-separated): first pair is the encounter header, then each block in order.

**Config mode** — append `&config=1` only when you want the editor and drag handles visible:

```
...?OVERLAY_WS=ws://127.0.0.1:10501/ws&config=1
```

Remove `config=1` from your in-game URL once layout is done. Config is saved to `localStorage` between sessions.

Default blocks: **Damage** + **Healing**.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:5173/?OVERLAY_WS=ws://127.0.0.1:10501/ws` with IINACT running to test locally.

The overlay only displays live combat data from IINACT — there is no mock/demo mode.

## How it works

This overlay uses [OverlayPlugin's common.min.js](https://overlayplugin.github.io/OverlayPlugin/devs/) to subscribe to `CombatData` events over IINACT's WebSocket (`ws://127.0.0.1:10501/ws`). Combat data updates once per second while in combat.

## Design

**Obsidian Telemetry HUD** — void black glass panels, electric mint accents, role-colored DPS bars, Syne + IBM Plex Mono typography.

## License

MIT
