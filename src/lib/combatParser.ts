import type { Combatant, JobRole, MetricSnapshot, OverlayState } from '../types/combat'
import type { CombatDataEvent, OverlayCombatant } from '../types/overlayPlugin'
import { normalizeJobCode } from './jobColors'

const TANK_JOBS = new Set(['GLA', 'PLD', 'MRD', 'WAR', 'DRK', 'GNB'])
const HEALER_JOBS = new Set(['CNJ', 'WHM', 'SCH', 'AST', 'SGE'])

function parseNumber(value: unknown): number {
  if (value === undefined || value === null || value === '') return 0
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0
  if (typeof value !== 'string') return 0

  let text = value.trim().replace(/%/g, '').replace(/\s/g, '')
  if (!text || text === '---' || text === '∞') return 0

  let multiplier = 1
  const suffix = text.slice(-1).toLowerCase()
  if (suffix === 'k' || suffix === 'm' || suffix === 'b') {
    multiplier = suffix === 'k' ? 1e3 : suffix === 'm' ? 1e6 : 1e9
    text = text.slice(0, -1)
  }

  const lastComma = text.lastIndexOf(',')
  const lastDot = text.lastIndexOf('.')
  if (lastComma !== -1 && lastDot !== -1) {
    text = lastComma > lastDot
      ? text.replace(/\./g, '').replace(',', '.')
      : text.replace(/,/g, '')
  } else if (lastComma !== -1) {
    const decimals = text.length - lastComma - 1
    const commas = text.split(',').length - 1
    text = commas === 1 && decimals > 0 && decimals <= 2
      ? text.replace(',', '.')
      : text.replace(/,/g, '')
  }

  const parsed = Number.parseFloat(text)
  return Number.isFinite(parsed) ? parsed * multiplier : 0
}

function parseDuration(duration: unknown): number {
  if (typeof duration === 'number') return Number.isFinite(duration) ? Math.floor(duration) : 0
  if (typeof duration !== 'string' || !duration.trim()) return 0

  const trimmed = duration.trim()
  if (!trimmed.includes(':')) {
    const seconds = Number.parseFloat(trimmed)
    return Number.isFinite(seconds) ? Math.floor(seconds) : 0
  }

  const parts = trimmed.split(':').map((part) => Number.parseFloat(part))
  if (parts.some((part) => Number.isNaN(part))) return 0
  if (parts.length === 3) return Math.floor(parts[0] * 3600 + parts[1] * 60 + parts[2])
  if (parts.length === 2) return Math.floor(parts[0] * 60 + parts[1])
  return Math.floor(parts[0] ?? 0)
}

function parseBoolean(value: unknown): boolean {
  if (typeof value === 'string') {
    const text = value.trim().toLowerCase()
    return text === 'true' || text === '1'
  }
  return value === true || value === 1
}

function jobToRole(job: string): JobRole {
  if (TANK_JOBS.has(job)) return 'tank'
  if (HEALER_JOBS.has(job)) return 'healer'
  return 'dps'
}

function readField(raw: OverlayCombatant, ...keys: string[]): unknown {
  const record = raw as Record<string, unknown>
  for (const key of keys) {
    const value = record[key]
    if (value !== undefined && value !== null && value !== '') return value
  }
  return undefined
}

function combatantEntries(
  combatant: CombatDataEvent['Combatant'],
): [string, OverlayCombatant][] {
  if (!combatant) return []
  if (Array.isArray(combatant)) {
    return combatant.map((raw, index) => [raw.name || String(index), raw])
  }
  return Object.entries(combatant)
}

function samePlayer(name: string, playerName: string | null, rawIsYou: unknown): boolean {
  if (parseBoolean(rawIsYou)) return true
  if (name === 'YOU') return true
  if (!playerName) return false

  const bare = (value: string) => value.split('@')[0]?.trim() ?? value
  return name === playerName || bare(name) === bare(playerName)
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
  const job = normalizeJobCode(readField(raw, 'Job', 'job'))
  const name = raw.name || key
  const damageTotal = parseNumber(readField(raw, 'damage', 'Damage', 'DamageDone'))
  const healedTotal = parseNumber(readField(raw, 'healed', 'Healed'))
  const damageTakenTotal = parseNumber(readField(raw, 'damagetaken', 'damageTaken', 'DamageTaken'))
  const healsTakenTotal = parseNumber(readField(raw, 'healstaken', 'healsTaken', 'HealsTaken'))
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

  const metrics = {
    damage: snapshot(
      parseNumber(readField(raw, 'encdps', 'ENCDPS', 'EncDPS')),
      damageTotal,
      parseNumber(readField(raw, 'damage%', 'Damage%')),
    ),
    healing: snapshot(
      parseNumber(readField(raw, 'enchps', 'ENCHPS', 'EncHPS')),
      healedTotal,
      parseNumber(readField(raw, 'healed%', 'Healed%')),
    ),
    damageTaken: snapshot(0, damageTakenTotal, 0, true),
    healsTaken: snapshot(0, healsTakenTotal, 0, true),
  }

  return {
    id: key,
    name,
    job: job || '???',
    role: jobToRole(job),
    isYou: samePlayer(name, playerName, readField(raw, 'isYou', 'IsYou')),
    deaths: parseNumber(readField(raw, 'deaths', 'Deaths')),
    metrics,
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
  const combatants = combatantEntries(data.Combatant).map(([key, raw]) =>
    mapCombatant(key, raw, playerName, duration),
  )

  fillMissingPct(combatants, 'damageTaken')
  fillMissingPct(combatants, 'healsTaken')

  const totalDamage =
    parseNumber(encounter.DamageDone ?? encounter.damage) ||
    combatants.reduce((sum, c) => sum + c.metrics.damage.total, 0)

  const totalHealing =
    parseNumber(encounter.healed ?? encounter.Healed) ||
    combatants.reduce((sum, c) => sum + c.metrics.healing.total, 0)

  const totalDeaths = combatants.reduce((sum, c) => sum + c.deaths, 0)

  return {
    connected: true,
    encounter: {
      title: encounter.title || 'Current Encounter',
      duration,
      totalDamage,
      totalHealing,
      rdps: parseNumber(encounter.ENCDPS ?? encounter.encdps ?? encounter.EncDPS),
      rhps: parseNumber(encounter.ENCHPS ?? encounter.enchps ?? encounter.EncHPS),
      totalDeaths,
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

export function isDemoMode(): boolean {
  return new URLSearchParams(window.location.search).get('demo') === '1'
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
    totalDeaths: 0,
    isActive: false,
  },
  combatants: [],
}
