export type JobRole = 'tank' | 'healer' | 'dps'

export interface Combatant {
  id: string
  name: string
  job: string
  role: JobRole
  isYou?: boolean
  metrics: {
    damage: MetricSnapshot
    healing: MetricSnapshot
    damageTaken: MetricSnapshot
    healsTaken: MetricSnapshot
  }
}

export interface MetricSnapshot {
  rate: number
  total: number
  pct: number
}

export interface EncounterState {
  title: string
  duration: number
  totalDamage: number
  totalHealing: number
  rdps: number
  rhps: number
  isActive: boolean
}

export interface OverlayState {
  encounter: EncounterState
  combatants: Combatant[]
  connected: boolean
}
