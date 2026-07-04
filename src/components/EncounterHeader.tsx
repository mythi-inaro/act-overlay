import { memo, useCallback, useMemo, useState } from 'react'
import type { Combatant, EncounterState } from '../types/combat'
import type { FightRecord, FightSelection } from '../types/fights'
import { formatDuration, formatNumber, formatRate } from '../lib/formatNumbers'
import { getJobColorStyle } from '../lib/jobColors'
import { FightContextMenu } from './FightContextMenu'

interface EncounterHeaderProps {
  encounter: EncounterState
  combatants: Combatant[]
  liveSummary: string
  viewingLive: boolean
  canNavigate: boolean
  fightIndex: number
  fightCount: number
  archives: FightRecord[]
  selectedFightId: FightSelection
  onSelectFight: (id: FightSelection) => void
  onNewFight: () => void
}

function getTopDamage(combatants: Combatant[]): Combatant | null {
  return combatants.reduce<Combatant | null>((top, combatant) => {
    if (!top || combatant.metrics.damage.rate > top.metrics.damage.rate) {
      return combatant
    }
    return top
  }, null)
}

export const EncounterHeader = memo(function EncounterHeader({
  encounter,
  combatants,
  liveSummary,
  viewingLive,
  canNavigate,
  fightIndex,
  fightCount,
  archives,
  selectedFightId,
  onSelectFight,
  onNewFight,
}: EncounterHeaderProps) {
  const statusLabel = encounter.isActive ? 'In Combat' : 'Idle'
  const statusClass = encounter.isActive ? 'encounter__status--live' : 'encounter__status--idle'
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null)

  const topDamage = useMemo(() => getTopDamage(combatants), [combatants])
  const playerCount = combatants.length
  const hasStats =
    encounter.duration > 0 ||
    encounter.totalDamage > 0 ||
    encounter.totalHealing > 0 ||
    playerCount > 0

  const handleContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault()
    setMenuPosition({ x: event.clientX, y: event.clientY })
  }, [])

  const closeMenu = useCallback(() => {
    setMenuPosition(null)
  }, [])

  return (
    <div
      className="encounter"
      onContextMenu={handleContextMenu}
      title="Right-click to switch fights"
    >
      <div className="encounter__top">
        <div className="encounter__heading">
          <h1 className="encounter__title">{encounter.title}</h1>
          <div className="encounter__meta">
            <span className="encounter__meta-item tabular">{formatDuration(encounter.duration)}</span>
            <span className="encounter__meta-sep" aria-hidden>·</span>
            <span className={`encounter__meta-item encounter__meta-item--status ${statusClass}`}>
              {encounter.isActive && viewingLive && (
                <span className="encounter__live-dot" aria-hidden />
              )}
              {viewingLive ? statusLabel : 'Archived'}
            </span>
            {playerCount > 0 && (
              <>
                <span className="encounter__meta-sep" aria-hidden>·</span>
                <span className="encounter__meta-item">{playerCount} tracked</span>
              </>
            )}
          </div>
        </div>
        <div className="encounter__badges">
          {!viewingLive && (
            <span className="encounter__replay-badge" title="Viewing archived fight">
              Replay
            </span>
          )}
          {canNavigate && (
            <span className="encounter__fight-pill tabular" title="Fight history">
              {fightIndex}/{fightCount}
            </span>
          )}
        </div>
      </div>

      {hasStats && (
        <div className="encounter__stats">
          <div className="encounter__stat encounter__stat--dmg">
            <span className="encounter__stat-label">Damage</span>
            <span className="encounter__stat-value tabular">{formatNumber(encounter.totalDamage)}</span>
            <span className="encounter__stat-rate tabular">{formatRate(encounter.rdps)} dps</span>
          </div>
          <div className="encounter__stat encounter__stat--heal">
            <span className="encounter__stat-label">Healing</span>
            <span className="encounter__stat-value tabular">{formatNumber(encounter.totalHealing)}</span>
            <span className="encounter__stat-rate tabular">{formatRate(encounter.rhps)} hps</span>
          </div>
          <div className="encounter__stat encounter__stat--mvp">
            <span className="encounter__stat-label">Top DPS</span>
            {topDamage ? (
              <>
                <span className="encounter__stat-value encounter__stat-value--name">
                  {topDamage.name}
                </span>
                <span className="encounter__stat-rate">
                  <span
                    className="encounter__stat-job"
                    style={{
                      color: getJobColorStyle(topDamage.job).color,
                      borderColor: getJobColorStyle(topDamage.job).borderColor,
                      backgroundColor: getJobColorStyle(topDamage.job).backgroundColor,
                    }}
                  >
                    {topDamage.job}
                  </span>
                  <span className="tabular">{formatRate(topDamage.metrics.damage.rate)} dps</span>
                </span>
              </>
            ) : (
              <span className="encounter__stat-value encounter__stat-value--empty">—</span>
            )}
          </div>
        </div>
      )}

      {menuPosition && (
        <FightContextMenu
          x={menuPosition.x}
          y={menuPosition.y}
          encounter={encounter}
          liveSummary={liveSummary}
          archives={archives}
          selectedId={selectedFightId}
          onSelectFight={onSelectFight}
          onNewFight={onNewFight}
          onClose={closeMenu}
        />
      )}
    </div>
  )
})
