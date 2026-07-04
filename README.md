# ACT Overlay

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/mythiinaro)

A combat telemetry overlay for FFXIV. Shows live DPS, healing, damage taken, and more while you play. Works with [IINACT](https://www.iinact.com/) on Windows, Linux, and macOS.

## Overlay URL

Use this URL in your in-game overlay plugin:

```
https://mythi-inaro.github.io/act-overlay/?OVERLAY_WS=ws://127.0.0.1:10501/ws
```

The `?OVERLAY_WS=ws://127.0.0.1:10501/ws` part is required — it connects the overlay to IINACT on your PC.

## Setup

### 1. Install IINACT

1. In Dalamud, add the IINACT repo: `https://raw.githubusercontent.com/marzent/IINACT/main/repo.json`
2. Install and enable **IINACT** from the plugin installer
3. Set the logging filter to at least **Party** so combat data is captured

Full instructions: [IINACT installation guide](https://www.iinact.com/installation/)

### 2. Install an overlay plugin

| Platform | Plugin |
|----------|--------|
| Windows | [Browsingway](https://github.com/MeowthDev/Browsingway) |
| Linux | [HUDKit](https://github.com/anko/hudkit) |
| macOS | [BunnyHUD](https://github.com/marzent/Bunny-HUD) |

### 3. Add the overlay

**Option A — paste the URL**

In your overlay plugin (e.g. Browsingway `/bw config`), create a new inlay and paste the [overlay URL](#overlay-url) above.

**Option B — use IINACT's picker**

Run `/iinact` in-game, choose this overlay from the list, and paste the URL into your overlay plugin.

> If IINACT gives you a proxy URL and the overlay does not connect, use the direct URL from the [Overlay URL](#overlay-url) section instead.

### 4. Configure the inlay

- Set the background to **transparent**
- Position and resize the overlay where you want it
- **Lock** the overlay when placement looks good

Hit a training dummy and enter combat — meters should populate within a second.

## Customize your meters

### Available metrics

| Metric | Shows as | What it tracks |
|--------|----------|----------------|
| Damage | DPS | Damage dealt |
| Healing | HPS | Healing done |
| Damage Taken | DTPS | Damage taken |
| Heals Taken | HTPS | Healing received |

By default you get **Damage** and **Healing** side by side under the encounter header.

### Config mode

To move panels, change metrics, or copy a shareable setup URL, open config mode by adding `&config=1` to your overlay URL:

```
https://mythi-inaro.github.io/act-overlay/?OVERLAY_WS=ws://127.0.0.1:10501/ws&config=1
```

In config mode you can:

- **Drag** the overlay handle to reposition
- **Right-click** a meter to change its metric
- **Right-click** the encounter header to browse fight history
- Copy a **share URL** with your layout saved

Remove `&config=1` from your in-game URL once you are done. Your layout is saved in the browser automatically.

### Share a layout via URL

You can pass metrics and positions directly in the URL:

```
https://mythi-inaro.github.io/act-overlay/?OVERLAY_WS=ws://127.0.0.1:10501/ws&blocks=damage,healing,damageTaken&layout=79.0,2.2;79.0,18.0;79.0,42.0
```

- `blocks` — comma-separated metrics (`damage`, `healing`, `damageTaken`, `healsTaken`)
- `layout` — position pairs as `x,y` percentages, separated by `;` (encounter header first, then each meter block)

## Troubleshooting

| Problem | Try this |
|---------|----------|
| Overlay is blank | Confirm IINACT is running and logging filter is at least **Party** |
| "Connecting…" never goes away | Check that `?OVERLAY_WS=ws://127.0.0.1:10501/ws` is in your URL |
| Proxy URL from `/iinact` fails | Use the [direct overlay URL](#overlay-url) instead |
| Meters empty outside combat | Normal — data only appears during encounters |
| Config handles visible in-game | Remove `&config=1` from your URL |

## Support

If this overlay is useful to you, consider buying me a coffee:

**[ko-fi.com/mythiinaro](https://ko-fi.com/mythiinaro)**
