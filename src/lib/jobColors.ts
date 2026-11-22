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
  BST: '#c4893a',
  // Base classes use the same swatch as the job they become.
  GLA: '#a8d2e6',
  MRD: '#cf2621',
  PGL: '#d69c00',
  LNC: '#4164cd',
  ROG: '#af1964',
  ARC: '#91ba5e',
  CNJ: '#fff0dc',
  THM: '#a579d6',
  ACN: '#2d9b78',
  // Misc
  LB: '#c9a227',
}

/** ClassJob IDs through FFXIV patch 7.58 (Beastmaster is 43). */
const JOB_IDS: Record<number, string> = {
  1: 'GLA',
  2: 'PGL',
  3: 'MRD',
  4: 'LNC',
  5: 'ARC',
  6: 'CNJ',
  7: 'THM',
  8: 'CRP',
  9: 'BSM',
  10: 'ARM',
  11: 'GSM',
  12: 'LTW',
  13: 'WVR',
  14: 'ALC',
  15: 'CUL',
  16: 'MIN',
  17: 'BTN',
  18: 'FSH',
  19: 'PLD',
  20: 'MNK',
  21: 'WAR',
  22: 'DRG',
  23: 'BRD',
  24: 'WHM',
  25: 'BLM',
  26: 'ACN',
  27: 'SMN',
  28: 'SCH',
  29: 'ROG',
  30: 'NIN',
  31: 'MCH',
  32: 'DRK',
  33: 'AST',
  34: 'SAM',
  35: 'RDM',
  36: 'BLU',
  37: 'GNB',
  38: 'DNC',
  39: 'RPR',
  40: 'SGE',
  41: 'VPR',
  42: 'PCT',
  43: 'BST',
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
  BLUEMAGE: 'BLU',
  BEASTMASTER: 'BST',
  SAGE: 'SGE',
  LIMITBREAK: 'LB',
  GLADIATOR: 'GLA',
  PUGILIST: 'PGL',
  MARAUDER: 'MRD',
  LANCER: 'LNC',
  ARCHER: 'ARC',
  CONJURER: 'CNJ',
  THAUMATURGE: 'THM',
  ROGUE: 'ROG',
  ARCANIST: 'ACN',
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

export function normalizeJobCode(job: unknown): string {
  if (typeof job === 'number' && Number.isFinite(job)) {
    return JOB_IDS[job] ?? '???'
  }

  const text = String(job ?? '').trim()
  if (!text) return '???'
  if (/^\d+$/.test(text)) return JOB_IDS[Number(text)] ?? '???'

  const cleaned = text.toUpperCase().replace(/[^A-Z]/g, '')
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
