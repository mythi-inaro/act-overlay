import type { Combatant, JobRole, MetricSnapshot, OverlayState } from '../types/combat'

interface DemoCombatantSeed {
  id: string
  name: string
  job: string
  role: JobRole
  isYou?: boolean
  dps: number
  hps: number
  dtps: number
  htps: number
  phase: number
}

const DEMO_PARTY: DemoCombatantSeed[] = [
  { id: 'you', name: 'Adventurer', job: 'DNC', role: 'dps', isYou: true, dps: 10234, hps: 0, dtps: 820, htps: 450, phase: 0 },
  { id: 'war', name: 'Hrothgar McRoar', job: 'WAR', role: 'tank', dps: 4180, hps: 0, dtps: 4820, htps: 2100, phase: 0.6 },
  { id: 'whm', name: 'Pure White', job: 'WHM', role: 'healer', dps: 2140, hps: 8520, dtps: 640, htps: 1200, phase: 1.2 },
  { id: 'blm', name: 'Dot Caster', job: 'BLM', role: 'dps', dps: 14580, hps: 0, dtps: 710, htps: 380, phase: 1.8 },
  { id: 'sam', name: 'Big Numbers', job: 'SAM', role: 'dps', dps: 13820, hps: 0, dtps: 890, htps: 420, phase: 2.4 },
  { id: 'brd', name: 'Song Guy', job: 'BRD', role: 'dps', dps: 11240, hps: 1240, dtps: 760, htps: 510, phase: 3.0 },
  { id: 'rdm', name: 'Rez Bot', job: 'RDM', role: 'dps', dps: 10860, hps: 3180, dtps: 680, htps: 890, phase: 3.6 },
  { id: 'sge', name: 'Sage Green', job: 'SGE', role: 'healer', dps: 1820, hps: 7240, dtps: 590, htps: 980, phase: 4.2 },
]

const ENCOUNTER_TITLE = 'The Ruby Weapon (Extreme)'

function wobble(base: number, elapsed: number, phase: number): number {
  return base * (1 + 0.07 * Math.sin(elapsed * 0.45 + phase))
}

function snapshot(rate: number, total: number, pct: number): MetricSnapshot {
  return { rate, total, pct }
}

function buildCombatant(seed: DemoCombatantSeed, elapsed: number): Combatant {
  const duration = Math.max(elapsed, 1)
  const dps = wobble(seed.dps, elapsed, seed.phase)
  const hps = wobble(seed.hps, elapsed, seed.phase + 0.3)
  const dtps = wobble(seed.dtps, elapsed, seed.phase + 0.6)
  const htps = wobble(seed.htps, elapsed, seed.phase + 0.9)

  return {
    id: seed.id,
    name: seed.name,
    job: seed.job,
    role: seed.role,
    isYou: seed.isYou,
    metrics: {
      damage: snapshot(dps, dps * duration, 0),
      healing: snapshot(hps, hps * duration, 0),
      damageTaken: snapshot(dtps, dtps * duration, 0),
      healsTaken: snapshot(htps, htps * duration, 0),
    },
  }
}

function fillPct(combatants: Combatant[], key: keyof Combatant['metrics']): void {
  const sum = combatants.reduce((acc, c) => acc + c.metrics[key].total, 0)
  if (sum <= 0) return

  for (const combatant of combatants) {
    const field = combatant.metrics[key]
    field.pct = (field.total / sum) * 100
  }
}

export function buildDemoState(elapsedSeconds: number): OverlayState {
  const duration = Math.max(0, Math.floor(elapsedSeconds))
  const combatants = DEMO_PARTY.map((seed) => buildCombatant(seed, elapsedSeconds))

  fillPct(combatants, 'damage')
  fillPct(combatants, 'healing')
  fillPct(combatants, 'damageTaken')
  fillPct(combatants, 'healsTaken')

  const totalDamage = combatants.reduce((sum, c) => sum + c.metrics.damage.total, 0)
  const totalHealing = combatants.reduce((sum, c) => sum + c.metrics.healing.total, 0)
  const safeDuration = Math.max(duration, 1)

  return {
    connected: true,
    encounter: {
      title: ENCOUNTER_TITLE,
      duration,
      totalDamage,
      totalHealing,
      rdps: totalDamage / safeDuration,
      rhps: totalHealing / safeDuration,
      isActive: true,
    },
    combatants,
  }
}
