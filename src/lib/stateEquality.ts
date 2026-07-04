import type { Combatant, EncounterState, OverlayState } from '../types/combat'

function encounterEqual(a: EncounterState, b: EncounterState): boolean {
  return (
    a.title === b.title &&
    a.duration === b.duration &&
    a.totalDamage === b.totalDamage &&
    a.totalHealing === b.totalHealing &&
    a.rdps === b.rdps &&
    a.rhps === b.rhps &&
    a.totalDeaths === b.totalDeaths &&
    a.isActive === b.isActive
  )
}

function metricSnapshotEqual(
  a: Combatant['metrics'][keyof Combatant['metrics']],
  b: Combatant['metrics'][keyof Combatant['metrics']],
): boolean {
  return a.rate === b.rate && a.total === b.total && a.pct === b.pct
}

function combatantEqual(a: Combatant, b: Combatant): boolean {
  return (
    a.id === b.id &&
    a.name === b.name &&
    a.job === b.job &&
    a.role === b.role &&
    a.isYou === b.isYou &&
    a.deaths === b.deaths &&
    metricSnapshotEqual(a.metrics.damage, b.metrics.damage) &&
    metricSnapshotEqual(a.metrics.healing, b.metrics.healing) &&
    metricSnapshotEqual(a.metrics.damageTaken, b.metrics.damageTaken) &&
    metricSnapshotEqual(a.metrics.healsTaken, b.metrics.healsTaken)
  )
}

function combatantsEqual(a: Combatant[], b: Combatant[]): boolean {
  if (a.length !== b.length) return false

  const byId = new Map(b.map((combatant) => [combatant.id, combatant]))
  for (const combatant of a) {
    const other = byId.get(combatant.id)
    if (!other || !combatantEqual(combatant, other)) return false
  }

  return true
}

export function overlayStateEqual(a: OverlayState, b: OverlayState): boolean {
  return (
    a.connected === b.connected &&
    encounterEqual(a.encounter, b.encounter) &&
    combatantsEqual(a.combatants, b.combatants)
  )
}
