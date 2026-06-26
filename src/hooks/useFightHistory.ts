import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { formatNumber } from '../lib/formatNumbers'
import { requestEndEncounter } from '../lib/overlayApi'
import type { OverlayState } from '../types/combat'
import type { FightRecord, FightSelection } from '../types/fights'

const MAX_FIGHTS = 20
const FIGHT_HISTORY_KEY = 'act-overlay-fight-history'

function formatDurationShort(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function buildFightSummary(state: OverlayState): string {
  const { encounter } = state
  return `${formatNumber(encounter.totalDamage)} dmg · ${formatNumber(encounter.rdps)} dps · ${formatNumber(encounter.totalHealing)} heal`
}

function hasFightData(state: OverlayState): boolean {
  return (
    state.encounter.duration > 0 ||
    state.encounter.totalDamage > 0 ||
    state.encounter.totalHealing > 0 ||
    state.combatants.length > 0
  )
}

function createFightRecord(state: OverlayState, pullNumber: number): FightRecord {
  const title = state.encounter.title
  const baseTitle =
    title && title !== 'Not in combat' && title !== 'Current Encounter'
      ? title
      : `Pull ${pullNumber}`

  const duration = formatDurationShort(state.encounter.duration)
  return {
    id: `${Date.now()}-${pullNumber}`,
    label: duration !== '0:00' ? `${baseTitle} · ${duration}` : baseTitle,
    summary: buildFightSummary(state),
    archivedAt: Date.now(),
    state: structuredClone(state),
  }
}

function loadStoredArchives(): FightRecord[] {
  try {
    const raw = sessionStorage.getItem(FIGHT_HISTORY_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as FightRecord[]
    return Array.isArray(parsed) ? parsed.slice(-MAX_FIGHTS) : []
  } catch {
    return []
  }
}

export function useFightHistory(
  liveState: OverlayState,
  inGameCombat: boolean | null,
) {
  const [archives, setArchives] = useState<FightRecord[]>(loadStoredArchives)
  const [selectedId, setSelectedId] = useState<FightSelection>('live')
  const wasInCombatRef = useRef<boolean | null>(inGameCombat)
  const lastCombatSnapshotRef = useRef<OverlayState | null>(null)
  const pullCounterRef = useRef(archives.length)
  const skipNextAutoArchiveRef = useRef(false)

  useEffect(() => {
    sessionStorage.setItem(FIGHT_HISTORY_KEY, JSON.stringify(archives))
  }, [archives])

  useEffect(() => {
    if (inGameCombat === true) {
      lastCombatSnapshotRef.current = liveState
    }
  }, [inGameCombat, liveState])

  const archiveLiveState = useCallback((state: OverlayState) => {
    if (!hasFightData(state)) return null

    pullCounterRef.current += 1
    const record = createFightRecord(state, pullCounterRef.current)
    setArchives((prev) => [...prev, record].slice(-MAX_FIGHTS))
    return record
  }, [])

  useEffect(() => {
    const wasInCombat = wasInCombatRef.current

    if (wasInCombat === true && inGameCombat === false) {
      if (skipNextAutoArchiveRef.current) {
        skipNextAutoArchiveRef.current = false
      } else {
        archiveLiveState(lastCombatSnapshotRef.current ?? liveState)
      }
    }

    wasInCombatRef.current = inGameCombat
  }, [archiveLiveState, inGameCombat, liveState])

  const displayState = useMemo(() => {
    if (selectedId === 'live') return liveState
    return archives.find((fight) => fight.id === selectedId)?.state ?? liveState
  }, [archives, liveState, selectedId])

  const viewingLive = selectedId === 'live'
  const canNavigate = archives.length > 0

  const selectedIndex = useMemo(() => {
    if (selectedId === 'live') return archives.length
    return archives.findIndex((fight) => fight.id === selectedId)
  }, [archives, selectedId])

  const selectFight = useCallback((id: FightSelection) => {
    setSelectedId(id)
  }, [])

  const startNewFight = useCallback(() => {
    skipNextAutoArchiveRef.current = true
    archiveLiveState(lastCombatSnapshotRef.current ?? liveState)
    void requestEndEncounter()
    setSelectedId('live')
  }, [archiveLiveState, liveState])

  const liveSummary = buildFightSummary(liveState)

  return {
    displayState,
    viewingLive,
    canNavigate,
    archives,
    liveSummary,
    selectedFightId: selectedId,
    fightIndex: selectedIndex + 1,
    fightCount: archives.length + 1,
    selectFight,
    startNewFight,
  }
}
