import type { MeterBlock } from './metrics'

export interface PanelPosition {
  x: number
  y: number
}

export type PanelLayout = Record<string, PanelPosition>

export const DASHBOARD_PANEL_ID = 'dashboard'
export const DASHBOARD_WIDTH = 560

export function dashboardWidthPercent(): number {
  return (DASHBOARD_WIDTH / window.innerWidth) * 100
}

export function clampPosition(
  position: PanelPosition,
  panelHeightPx: number,
  widthPx: number = DASHBOARD_WIDTH,
): PanelPosition {
  const widthPct = (widthPx / window.innerWidth) * 100
  const maxX = 100 - widthPct
  const maxY = 100 - (panelHeightPx / window.innerHeight) * 100

  return {
    x: Math.min(Math.max(position.x, 0), Math.max(maxX, 0)),
    y: Math.min(Math.max(position.y, 0), Math.max(maxY, 0)),
  }
}

export function defaultLayout(_blocks: MeterBlock[]): PanelLayout {
  const x = Math.max(0, (100 - dashboardWidthPercent()) / 2)
  return {
    [DASHBOARD_PANEL_ID]: { x, y: 2 },
  }
}

export function parseLayoutParam(value: string | null): PanelLayout | null {
  if (!value) return null

  try {
    const pairs = value.split(';').map((part) => part.split(',').map(Number))
    if (pairs.some((p) => p.length !== 2 || p.some((n) => !Number.isFinite(n)))) {
      return null
    }

    const [first] = pairs
    return { [DASHBOARD_PANEL_ID]: { x: first[0], y: first[1] } }
  } catch {
    return null
  }
}

export function serializeLayoutParam(layout: PanelLayout): string {
  const position = layout[DASHBOARD_PANEL_ID]
  if (!position) return ''
  return `${position.x.toFixed(1)},${position.y.toFixed(1)}`
}

export function mergeLayoutFromParam(param: PanelLayout): PanelLayout {
  const dashboard = param[DASHBOARD_PANEL_ID]
  if (dashboard) return { [DASHBOARD_PANEL_ID]: dashboard }
  return defaultLayout([])
}

// Legacy id kept for stored configs that reference the old encounter panel key
export const ENCOUNTER_PANEL_ID = 'encounter'
