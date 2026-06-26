import type { Combatant, EncounterState } from '../types/combat'
import type { MetricId } from '../types/metrics'

export function getMetricTotals(
  metric: MetricId,
  encounter: EncounterState,
  combatants: Combatant[],
): { total: number; rate: number } {
  if (metric === 'damage') {
    return { total: encounter.totalDamage, rate: encounter.rdps }
  }

  if (metric === 'healing') {
    return { total: encounter.totalHealing, rate: encounter.rhps }
  }

  return combatants.reduce(
    (acc, combatant) => {
      const values = combatant.metrics[metric]
      return {
        total: acc.total + values.total,
        rate: acc.rate + values.rate,
      }
    },
    { total: 0, rate: 0 },
  )
}
