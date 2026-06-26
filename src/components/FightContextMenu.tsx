import { formatRate } from '../lib/formatNumbers'
import type { EncounterState } from '../types/combat'
import type { FightRecord, FightSelection } from '../types/fights'
import {
  ContextMenu,
  ContextMenuAction,
  ContextMenuDivider,
  ContextMenuItem,
} from './ContextMenu'

interface FightContextMenuProps {
  x: number
  y: number
  encounter: EncounterState
  liveSummary: string
  archives: FightRecord[]
  selectedId: FightSelection
  onSelectFight: (id: FightSelection) => void
  onNewFight: () => void
  onClose: () => void
}

function liveDetail(encounter: EncounterState, summary: string): string {
  if (encounter.isActive) {
    return `${formatRate(encounter.rdps)} dps · in combat`
  }

  if (encounter.totalDamage > 0 || encounter.totalHealing > 0) {
    return summary
  }

  return 'Current encounter'
}

export function FightContextMenu({
  x,
  y,
  encounter,
  liveSummary,
  archives,
  selectedId,
  onSelectFight,
  onNewFight,
  onClose,
}: FightContextMenuProps) {
  const history = [...archives].reverse()

  return (
    <ContextMenu x={x} y={y} onClose={onClose} ariaLabel="Switch fight" label="Fights">
      <ContextMenuItem
        label="Live"
        detail={liveDetail(encounter, liveSummary)}
        active={selectedId === 'live'}
        onSelect={() => {
          onSelectFight('live')
          onClose()
        }}
      />

      <ContextMenuDivider />
      <span className="context-menu__label">
        History{archives.length > 0 ? ` (${archives.length})` : ''}
      </span>

      {history.length === 0 ? (
        <p className="context-menu__empty">
          Previous fights appear here after combat ends or when you start a new fight.
        </p>
      ) : (
        <div className="context-menu__scroll">
          {history.map((fight) => (
            <ContextMenuItem
              key={fight.id}
              label={fight.label}
              detail={fight.summary}
              active={selectedId === fight.id}
              onSelect={() => {
                onSelectFight(fight.id)
                onClose()
              }}
            />
          ))}
        </div>
      )}

      <ContextMenuDivider />
      <ContextMenuAction
        label="New fight"
        onSelect={() => {
          onNewFight()
          onClose()
        }}
      />
    </ContextMenu>
  )
}
