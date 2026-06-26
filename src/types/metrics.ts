export type MetricId = 'damage' | 'healing' | 'damageTaken' | 'healsTaken'

export interface MetricValues {
  rate: number
  total: number
  pct: number
}

export interface MetricDefinition {
  id: MetricId
  label: string
  rateLabel: string
}

export const METRIC_DEFINITIONS: Record<MetricId, MetricDefinition> = {
  damage: {
    id: 'damage',
    label: 'Damage',
    rateLabel: 'DPS',
  },
  healing: {
    id: 'healing',
    label: 'Healing',
    rateLabel: 'HPS',
  },
  damageTaken: {
    id: 'damageTaken',
    label: 'Damage Taken',
    rateLabel: 'DTPS',
  },
  healsTaken: {
    id: 'healsTaken',
    label: 'Heals Taken',
    rateLabel: 'HTPS',
  },
}

export const METRIC_IDS = Object.keys(METRIC_DEFINITIONS) as MetricId[]

export interface MeterBlock {
  id: string
  metric: MetricId
}

export const VISIBLE_METER_COUNT = 2

export const DEFAULT_BLOCKS: MeterBlock[] = [
  { id: 'block-damage', metric: 'damage' },
  { id: 'block-healing', metric: 'healing' },
]

export function isMetricId(value: string): value is MetricId {
  return value in METRIC_DEFINITIONS
}

export function parseBlocksParam(value: string | null): MeterBlock[] | null {
  if (!value) return null

  const blocks = value
    .split(',')
    .map((part) => part.trim())
    .filter(isMetricId)
    .map((metric, index) => ({ id: `block-${metric}-${index}`, metric }))

  return blocks.length > 0 ? blocks : null
}
