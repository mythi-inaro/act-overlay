import type { Combatant } from '../types/combat'
import type { MetricId } from '../types/metrics'

export interface MetricRowData {
  id: string
  combatant: Combatant
  values: Combatant['metrics'][MetricId]
}

export function buildMetricRows(combatants: Combatant[], metric: MetricId): MetricRowData[] {
  const rows: MetricRowData[] = []

  for (const combatant of combatants) {
    const values = combatant.metrics[metric]
    if (values.rate <= 0 && values.total <= 0) continue
    rows.push({ id: combatant.id, combatant, values })
  }

  rows.sort((a, b) => b.values.rate - a.values.rate)
  return rows
}
