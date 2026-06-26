import type { OverlayState } from './combat'

export interface FightRecord {
  id: string
  label: string
  summary: string
  archivedAt: number
  state: OverlayState
}

export type FightSelection = 'live' | string
