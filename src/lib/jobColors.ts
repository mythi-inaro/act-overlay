const JOB_COLORS: Record<string, string> = {
  // Tanks
  PLD: '#a8d2e6',
  WAR: '#cf2621',
  DRK: '#d126cc',
  GNB: '#998d50',
  // Healers
  WHM: '#fff0dc',
  SCH: '#8657ff',
  AST: '#ffe74a',
  SGE: '#80a0f0',
  // Melee
  MNK: '#d69c00',
  DRG: '#4164cd',
  NIN: '#af1964',
  SAM: '#e46d04',
  RPR: '#965a90',
  VPR: '#108210',
  // Ranged
  BRD: '#91ba5e',
  MCH: '#6ee1d6',
  DNC: '#e2b0af',
  // Casters
  BLM: '#a579d6',
  SMN: '#2d9b78',
  RDM: '#e87b7b',
  PCT: '#fc92e1',
  BLU: '#0068b3',
  // Misc
  LB: '#c9a227',
}

const JOB_ALIASES: Record<string, string> = {
  PALADIN: 'PLD',
  WARRIOR: 'WAR',
  DARKKNIGHT: 'DRK',
  GUNBREAKER: 'GNB',
  WHITEMMAGE: 'WHM',
  SCHOLAR: 'SCH',
  ASTROLOGIAN: 'AST',
  MONK: 'MNK',
  DRAGOON: 'DRG',
  NINJA: 'NIN',
  SAMURAI: 'SAM',
  REAPER: 'RPR',
  VIPER: 'VPR',
  BARD: 'BRD',
  MACHINIST: 'MCH',
  DANCER: 'DNC',
  BLACKMAGE: 'BLM',
  SUMMONER: 'SMN',
  REDMAGE: 'RDM',
  PICTOMANCER: 'PCT',
  BLUMAGE: 'BLU',
  SAGE: 'SGE',
  LIMITBREAK: 'LB',
}

const FALLBACK_COLOR = '#6b7280'

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const value = hex.replace('#', '')
  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16),
  }
}

function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex)
  const channel = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

export function normalizeJobCode(job: string): string {
  const cleaned = job.trim().toUpperCase().replace(/[^A-Z]/g, '')
  if (!cleaned) return '???'
  if (cleaned.includes('LIMIT') || cleaned === 'LB') return 'LB'

  const alias = JOB_ALIASES[cleaned]
  if (alias) return alias

  const code = cleaned.slice(0, 3)
  return JOB_COLORS[code] ? code : code
}

export function getJobColor(job: string): string {
  const code = normalizeJobCode(job)
  return JOB_COLORS[code] ?? FALLBACK_COLOR
}

export interface JobColorStyle {
  color: string
  borderColor: string
  backgroundColor: string
  barBackground: string
  barGlow: string
}

const jobStyleCache = new Map<string, JobColorStyle>()

function buildJobColorStyle(job: string): JobColorStyle {
  const color = getJobColor(job)
  const { r, g, b } = hexToRgb(color)
  const light = relativeLuminance(color) > 0.65

  return {
    color,
    borderColor: `rgba(${r}, ${g}, ${b}, 0.45)`,
    backgroundColor: `rgba(${r}, ${g}, ${b}, ${light ? 0.18 : 0.14})`,
    barBackground: `linear-gradient(90deg, rgba(${r}, ${g}, ${b}, 0.95), rgba(${r}, ${g}, ${b}, 0.35))`,
    barGlow: `0 0 8px rgba(${r}, ${g}, ${b}, 0.55)`,
  }
}

export function getJobColorStyle(job: string): JobColorStyle {
  const code = normalizeJobCode(job)
  const cached = jobStyleCache.get(code)
  if (cached) return cached

  const style = buildJobColorStyle(job)
  jobStyleCache.set(code, style)
  return style
}
