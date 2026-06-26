import { useEffect, useRef, useState } from 'react'
import { EMPTY_STATE, parseCombatData } from '../lib/combatParser'
import type { EncounterState, OverlayState } from '../types/combat'
import type {
  ChangePrimaryPlayerEvent,
  CombatDataEvent,
  InCombatEvent,
} from '../types/overlayPlugin'

function applyCombatPresence(
  parsed: OverlayState,
  inGameCombat: boolean | null,
  frozenEncounter: EncounterState | null,
): OverlayState {
  if (inGameCombat === true) {
    return {
      ...parsed,
      encounter: { ...parsed.encounter, isActive: true },
    }
  }

  if (inGameCombat === false && frozenEncounter) {
    return {
      ...parsed,
      encounter: {
        ...frozenEncounter,
        title: parsed.encounter.title,
        isActive: false,
      },
    }
  }

  if (inGameCombat === false) {
    return {
      ...parsed,
      encounter: { ...parsed.encounter, isActive: false },
    }
  }

  return parsed
}

/**
 * Subscribes to IINACT / OverlayPlugin CombatData via common.min.js.
 * In Browsingway/HUDKit, include ?OVERLAY_WS=ws://127.0.0.1:10501/ws in the overlay URL.
 */
export function useOverlayPlugin(): {
  state: OverlayState
  inGameCombat: boolean | null
} {
  const [state, setState] = useState<OverlayState>(EMPTY_STATE)
  const [inGameCombat, setInGameCombat] = useState<boolean | null>(null)
  const playerNameRef = useRef<string | null>(null)
  const inGameCombatRef = useRef<boolean | null>(null)
  const frozenEncounterRef = useRef<EncounterState | null>(null)

  useEffect(() => {
    const onCombatData = (data: unknown) => {
      const parsed = parseCombatData(data as CombatDataEvent, playerNameRef.current)

      setState(
        applyCombatPresence(parsed, inGameCombatRef.current, frozenEncounterRef.current),
      )
    }

    const onInCombat = (data: unknown) => {
      const event = data as InCombatEvent
      if (typeof event.inGameCombat !== 'boolean') return

      const wasInCombat = inGameCombatRef.current
      inGameCombatRef.current = event.inGameCombat
      setInGameCombat(event.inGameCombat)

      if (event.inGameCombat) {
        frozenEncounterRef.current = null
        setState((prev) => ({
          ...prev,
          encounter: { ...prev.encounter, isActive: true },
        }))
        return
      }

      if (wasInCombat !== false) {
        setState((prev) => {
          frozenEncounterRef.current = {
            ...prev.encounter,
            isActive: false,
          }
          return {
            ...prev,
            encounter: frozenEncounterRef.current!,
          }
        })
      }
    }

    const onPrimaryPlayer = (data: unknown) => {
      const event = data as ChangePrimaryPlayerEvent
      if (event.charName) playerNameRef.current = event.charName
    }

    const register = () => {
      if (!window.addOverlayListener || !window.startOverlayEvents) return false

      window.addOverlayListener('CombatData', onCombatData)
      window.addOverlayListener('InCombat', onInCombat)
      window.addOverlayListener('ChangePrimaryPlayer', onPrimaryPlayer)
      window.startOverlayEvents()
      return true
    }

    if (!register()) {
      const timer = window.setInterval(() => {
        if (register()) window.clearInterval(timer)
      }, 100)

      return () => window.clearInterval(timer)
    }

    return () => {
      window.removeOverlayListener?.('CombatData', onCombatData)
      window.removeOverlayListener?.('InCombat', onInCombat)
      window.removeOverlayListener?.('ChangePrimaryPlayer', onPrimaryPlayer)
    }
  }, [])

  return { state, inGameCombat }
}
