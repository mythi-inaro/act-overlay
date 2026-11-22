export interface OverlayCombatant {
  name?: string
  Job?: string | number
  job?: string | number
  encdps?: string | number
  ENCDPS?: string | number
  EncDPS?: string | number
  'damage%'?: string | number
  damage?: string | number
  Damage?: string | number
  enchps?: string | number
  ENCHPS?: string | number
  EncHPS?: string | number
  'healed%'?: string | number
  healed?: string | number
  Healed?: string | number
  damagetaken?: string | number
  damageTaken?: string | number
  DamageTaken?: string | number
  healstaken?: string | number
  healsTaken?: string | number
  HealsTaken?: string | number
  isYou?: boolean | string | number
  deaths?: string | number
  Deaths?: string | number
}

export interface OverlayEncounter {
  title?: string
  duration?: string | number
  ENCDPS?: string | number
  encdps?: string | number
  EncDPS?: string | number
  ENCHPS?: string | number
  enchps?: string | number
  EncHPS?: string | number
  DamageDone?: string | number
  damage?: string | number
  healed?: string | number
  Healed?: string | number
}

export interface CombatDataEvent {
  type?: string
  isActive?: boolean | string | number
  Encounter?: OverlayEncounter
  Combatant?: Record<string, OverlayCombatant> | OverlayCombatant[]
}

export interface ChangePrimaryPlayerEvent {
  charName?: string
}

export interface InCombatEvent {
  type?: string
  inGameCombat?: boolean
  inACTCombat?: boolean
}

export interface OverlayPluginApi {
  ready?: boolean
  endEncounter?: () => void
  callHandler?: (msg: string, cb?: (value: string | null) => void) => void
}

declare global {
  interface Window {
    addOverlayListener: (event: string, cb: (data: unknown) => void) => void
    removeOverlayListener: (event: string, cb: (data: unknown) => void) => void
    startOverlayEvents: () => void
    callOverlayHandler: (msg: object) => Promise<unknown>
    OverlayPluginApi?: OverlayPluginApi
    __OverlayCallback?: (data: unknown) => void
  }
}

export {}
