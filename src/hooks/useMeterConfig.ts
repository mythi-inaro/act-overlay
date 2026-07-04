import { useCallback, useEffect, useMemo, useState } from 'react'
import { isOverlayMode } from '../lib/combatParser'
import {
  DASHBOARD_PANEL_ID,
  defaultLayout,
  ENCOUNTER_PANEL_ID,
  mergeLayoutFromParam,
  parseLayoutParam,
  serializeLayoutParam,
  type PanelLayout,
  type PanelPosition,
} from '../types/layout'
import {
  DEFAULT_BLOCKS,
  parseBlocksParam,
  VISIBLE_METER_COUNT,
  type MeterBlock,
  type MetricId,
} from '../types/metrics'

const STORAGE_KEY = 'act-overlay-config'

interface OverlayConfig {
  blocks: MeterBlock[]
  layout: PanelLayout
}

function createBlock(metric: MetricId): MeterBlock {
  return { id: `block-${metric}-${crypto.randomUUID()}`, metric }
}

function loadStoredConfig(): OverlayConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as OverlayConfig
    if (!Array.isArray(parsed.blocks) || !parsed.layout) return null
    return parsed
  } catch {
    return null
  }
}

function normalizeBlocks(blocks: MeterBlock[]): MeterBlock[] {
  const trimmed = blocks.slice(0, VISIBLE_METER_COUNT)
  if (trimmed.length === VISIBLE_METER_COUNT) return trimmed
  return DEFAULT_BLOCKS
}

function normalizeConfig(stored: OverlayConfig): OverlayConfig {
  const blocks = normalizeBlocks(stored.blocks)
  const layout = defaultLayout(blocks)
  const dashboard =
    stored.layout[DASHBOARD_PANEL_ID] ?? stored.layout[ENCOUNTER_PANEL_ID]
  if (dashboard) layout[DASHBOARD_PANEL_ID] = dashboard
  return { blocks, layout }
}

function resolveInitialConfig(): OverlayConfig {
  const params = new URLSearchParams(window.location.search)
  const blocksFromUrl = parseBlocksParam(params.get('blocks'))
  const layoutFromUrl = parseLayoutParam(params.get('layout'))

  if (blocksFromUrl) {
    const blocks = normalizeBlocks(blocksFromUrl)
    const layout = layoutFromUrl ? mergeLayoutFromParam(layoutFromUrl) : defaultLayout(blocks)
    return { blocks, layout }
  }

  const stored = loadStoredConfig()
  if (stored) return normalizeConfig(stored)

  const legacyBlocks = localStorage.getItem('act-overlay-blocks')
  if (legacyBlocks) {
    const blocks = parseBlocksParam(legacyBlocks)
    if (blocks) return { blocks: normalizeBlocks(blocks), layout: defaultLayout(normalizeBlocks(blocks)) }
  }

  const blocks = DEFAULT_BLOCKS
  return { blocks, layout: defaultLayout(blocks) }
}

export function useMeterConfig() {
  const [{ blocks, layout }, setConfig] = useState<OverlayConfig>(resolveInitialConfig)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ blocks, layout }))
    }, 250)

    return () => window.clearTimeout(timer)
  }, [blocks, layout])

  const setPanelPosition = useCallback((panelId: string, position: PanelPosition) => {
    setConfig((prev) => ({
      ...prev,
      layout: { ...prev.layout, [panelId]: position },
    }))
  }, [])

  const addBlock = useCallback((metric: MetricId) => {
    setConfig((prev) => {
      if (prev.blocks.length >= VISIBLE_METER_COUNT) return prev
      return {
        ...prev,
        blocks: [...prev.blocks, createBlock(metric)],
      }
    })
  }, [])

  const removeBlock = useCallback((id: string) => {
    setConfig((prev) => {
      if (prev.blocks.length <= VISIBLE_METER_COUNT) return prev
      return { ...prev, blocks: prev.blocks.filter((b) => b.id !== id) }
    })
  }, [])

  const setBlockMetric = useCallback((id: string, metric: MetricId) => {
    setConfig((prev) => ({
      ...prev,
      blocks: prev.blocks.map((b) => (b.id === id ? { ...b, metric } : b)),
    }))
  }, [])

  const resetPanelPosition = useCallback(() => {
    setConfig((prev) => ({
      ...prev,
      layout: defaultLayout(prev.blocks),
    }))
  }, [])

  const resetBlocks = useCallback(() => {
    setConfig({ blocks: DEFAULT_BLOCKS, layout: defaultLayout(DEFAULT_BLOCKS) })
  }, [])

  const shareUrl = useMemo(() => {
    const params = new URLSearchParams(window.location.search)
    params.set('blocks', blocks.map((b) => b.metric).join(','))
    params.set('layout', serializeLayoutParam(layout))
    if (isOverlayMode()) params.set('config', '1')
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`
  }, [blocks, layout])

  return {
    blocks,
    layout,
    setPanelPosition,
    resetPanelPosition,
    addBlock,
    removeBlock,
    setBlockMetric,
    resetBlocks,
    shareUrl,
  }
}
