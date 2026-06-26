export interface OverlayCombatant {
  name: string
  Job?: string
  encdps?: string | number
  ENCDPS?: string | number
  'damage%'?: string | number
  damage?: string | number
  enchps?: string | number
  ENCHPS?: string | number
  'healed%'?: string | number
  healed?: string | number
  damagetaken?: string | number
  healstaken?: string | number
  isYou?: boolean
}

export interface OverlayEncounter {
  title?: string
  duration?: string
  ENCDPS?: string | number
  encdps?: string | number
  ENCHPS?: string | number
  enchps?: string | number
  DamageDone?: string | number
  damage?: string | number
  healed?: string | number
}

export interface CombatDataEvent {
  type?: string
  isActive?: boolean
  Encounter?: OverlayEncounter
  Combatant?: Record<string, OverlayCombatant>
}

export interface ChangePrimaryPlayerEvent {
  charName?: string
}

export interface InCombatEvent {
  type?: string
  inGameCombat?: boolean
  inACTCombat?: boolean
}

declare global {
  interface Window {
    addOverlayListener: (event: string, cb: (data: unknown) => void) => void
    removeOverlayListener: (event: string, cb: (data: unknown) => void) => void
    startOverlayEvents: () => void
    callOverlayHandler: (msg: object) => Promise<unknown>
  }
}

export {}
