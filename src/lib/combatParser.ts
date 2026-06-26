import type { Combatant, JobRole, MetricSnapshot, OverlayState } from '../types/combat'
import type { CombatDataEvent, OverlayCombatant } from '../types/overlayPlugin'

const TANK_JOBS = new Set(['PLD', 'WAR', 'DRK', 'GNB'])
const HEALER_JOBS = new Set(['WHM', 'SCH', 'AST', 'SGE'])

function parseNumber(value: string | number | undefined): number {
  if (value === undefined || value === null || value === '') return 0
  if (typeof value === 'number') return value
  const cleaned = value.replace(/,/g, '').replace(/%/g, '').trim()
  const parsed = Number.parseFloat(cleaned)
  return Number.isFinite(parsed) ? parsed : 0
}

function parseDuration(duration: string | undefined): number {
  if (!duration) return 0
  const parts = duration.split(':').map((p) => Number.parseInt(p, 10))
  if (parts.some((p) => Number.isNaN(p))) return 0
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
  if (parts.length === 2) return parts[0] * 60 + parts[1]
  return parts[0] ?? 0
}

function parseBoolean(value: unknown): boolean {
  return value === true || value === 'true' || value === 1 || value === '1'
}

function normalizeJob(job: string | undefined): string {
  if (!job) return '???'
  return job.toUpperCase()
}
function jobToRole(job: string): JobRole {
  const code = normalizeJob(job)
  if (TANK_JOBS.has(code)) return 'tank'
  if (HEALER_JOBS.has(code)) return 'healer'
  return 'dps'
}

function fillMissingPct(combatants: Combatant[], key: keyof Combatant['metrics']): void {
  const sum = combatants.reduce((acc, c) => acc + c.metrics[key].total, 0)
  if (sum <= 0) return

  for (const combatant of combatants) {
    const field = combatant.metrics[key]
    if (field.pct <= 0 && field.total > 0) {
      field.pct = (field.total / sum) * 100
    }
  }
}

function mapCombatant(
  key: string,
  raw: OverlayCombatant,
  playerName: string | null,
  durationSeconds: number,
): Combatant {
  const job = normalizeJob(raw.Job)
  const name = raw.name || key
  const damageTotal = parseNumber(raw.damage)
  const healedTotal = parseNumber(raw.healed)
  const damageTakenTotal = parseNumber(raw.damagetaken)
  const healsTakenTotal = parseNumber(raw.healstaken)
  const duration = durationSeconds > 0 ? durationSeconds : 1

  const snapshot = (
    rate: number,
    total: number,
    pct: number,
    fallbackRateFromTotal = false,
  ): MetricSnapshot => ({
    rate: rate > 0 ? rate : fallbackRateFromTotal ? total / duration : 0,
    total,
    pct,
  })

  return {
    id: key,
    name,
    job: job || '???',
    role: jobToRole(job),
    isYou: playerName
      ? name === playerName || name === 'YOU'
      : Boolean(raw.isYou),
    metrics: {
      damage: snapshot(
        parseNumber(raw.encdps ?? raw.ENCDPS),
        damageTotal,
        parseNumber(raw['damage%']),
      ),
      healing: snapshot(
        parseNumber(raw.enchps ?? raw.ENCHPS),
        healedTotal,
        parseNumber(raw['healed%']),
      ),
      damageTaken: snapshot(0, damageTakenTotal, 0, true),
      healsTaken: snapshot(0, healsTakenTotal, 0, true),
    },
  }
}

function hasAnyMetric(combatant: Combatant): boolean {
  return Object.values(combatant.metrics).some((m) => m.rate > 0 || m.total > 0)
}

export function parseCombatData(
  data: CombatDataEvent,
  playerName: string | null,
): OverlayState {
  const encounter = data.Encounter ?? {}
  const duration = parseDuration(encounter.duration)
  const combatants = Object.entries(data.Combatant ?? {}).map(([key, raw]) =>
    mapCombatant(key, raw, playerName, duration),
  )

  fillMissingPct(combatants, 'damageTaken')
  fillMissingPct(combatants, 'healsTaken')

  const totalDamage =
    parseNumber(encounter.DamageDone ?? encounter.damage) ||
    combatants.reduce((sum, c) => sum + c.metrics.damage.total, 0)

  const totalHealing =
    parseNumber(encounter.healed) ||
    combatants.reduce((sum, c) => sum + c.metrics.healing.total, 0)

  return {
    connected: true,
    encounter: {
      title: encounter.title || 'Current Encounter',
      duration,
      totalDamage,
      totalHealing,
      rdps: parseNumber(encounter.ENCDPS ?? encounter.encdps),
      rhps: parseNumber(encounter.ENCHPS ?? encounter.enchps),
      isActive: parseBoolean(data.isActive),
    },
    combatants: combatants.filter(hasAnyMetric),
  }
}

export function isOverlayMode(): boolean {
  return /[?&]OVERLAY_WS=/.test(window.location.search)
}

export function isConfigMode(): boolean {
  return new URLSearchParams(window.location.search).get('config') === '1'
}

export const EMPTY_STATE: OverlayState = {
  connected: false,
  encounter: {
    title: 'Not in combat',
    duration: 0,
    totalDamage: 0,
    totalHealing: 0,
    rdps: 0,
    rhps: 0,
    isActive: false,
  },
  combatants: [],
}
