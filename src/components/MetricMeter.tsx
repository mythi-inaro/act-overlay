import { useCallback, useRef, useState } from 'react'
import type { Combatant, EncounterState } from '../types/combat'
import { useFlipList } from '../hooks/useFlipList'
import { formatNumber, formatRate } from '../lib/formatNumbers'
import { getJobColorStyle } from '../lib/jobColors'
import { getMetricTotals } from '../lib/metricTotals'
import {
  METRIC_DEFINITIONS,
  type MetricId,
} from '../types/metrics'
import { MetricContextMenu } from './MetricContextMenu'

interface MetricBarProps {
  job: string
  pct: number
  maxPct: number
}

function MetricBar({ job, pct, maxPct }: MetricBarProps) {
  const width = maxPct > 0 ? (pct / maxPct) * 100 : 0
  const jobStyle = getJobColorStyle(job)

  return (
    <div className="metric-bar">
      <div
        className="metric-bar__fill metric-bar__fill--job"
        style={{
          width: `${width}%`,
          background: jobStyle.barBackground,
          boxShadow: jobStyle.barGlow,
        } as React.CSSProperties}
      />
    </div>
  )
}

interface MetricMeterProps {
  metric: MetricId
  encounter: EncounterState
  combatants: Combatant[]
  panelIndex: number
  compact?: boolean
  flipResetKey?: string
  onMetricChange?: (metric: MetricId) => void
}

export function MetricMeter({
  metric,
  encounter,
  combatants,
  panelIndex,
  compact = false,
  flipResetKey,
  onMetricChange,
}: MetricMeterProps) {
  const definition = METRIC_DEFINITIONS[metric]
  const listRef = useRef<HTMLDivElement>(null)
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null)

  const rows = combatants
    .map((combatant) => ({
      id: combatant.id,
      combatant,
      values: combatant.metrics[metric],
    }))
    .filter(({ values }) => values.rate > 0 || values.total > 0)
    .sort((a, b) => b.values.rate - a.values.rate)

  useFlipList(rows, listRef, flipResetKey)

  const maxPct = rows.length > 0 ? Math.max(...rows.map(({ values }) => values.pct)) : 0
  const totals = getMetricTotals(metric, encounter, combatants)

  const handleContextMenu = useCallback(
    (event: React.MouseEvent) => {
      if (!onMetricChange) return

      event.preventDefault()
      setMenuPosition({ x: event.clientX, y: event.clientY })
    },
    [onMetricChange],
  )

  const closeMenu = useCallback(() => {
    setMenuPosition(null)
  }, [])

  return (
    <div
      className={`metric-meter ${compact ? 'metric-meter--compact' : ''}`}
      onContextMenu={handleContextMenu}
      title={onMetricChange ? 'Right-click to change metric' : undefined}
    >
      <div className="metric-meter__header">
        <span className="hud-label">{definition.label}</span>
        <div className={`metric-meter__totals metric-meter__totals--${metric}`}>
          <span className="metric-meter__total tabular">{formatNumber(totals.total)}</span>
          <span className="metric-meter__total-sep" aria-hidden>·</span>
          <span className="metric-meter__rate tabular">
            {formatRate(totals.rate)} {definition.rateLabel}
          </span>
        </div>
      </div>
      <div ref={listRef} className="metric-meter__list" role="list">
        {rows.length === 0 ? (
          <p className="metric-meter__empty">Waiting for {definition.label.toLowerCase()} data…</p>
        ) : (
          rows.map(({ combatant, values }, index) => {
            const jobStyle = getJobColorStyle(combatant.job)

            return (
              <div
                key={combatant.id}
                data-flip-id={combatant.id}
                className={`metric-row ${combatant.isYou ? 'metric-row--you' : ''}`}
                style={{ '--panel-i': panelIndex } as React.CSSProperties}
                role="listitem"
              >
                <span className="metric-row__rank tabular">{index + 1}</span>
                <div className="metric-row__info">
                  <div className="metric-row__name-line">
                    <span className="metric-row__name">{combatant.name}</span>
                    <span
                      className="metric-row__job"
                      style={{
                        color: jobStyle.color,
                        borderColor: jobStyle.borderColor,
                        backgroundColor: jobStyle.backgroundColor,
                      }}
                    >
                      {combatant.job}
                    </span>
                  </div>
                  <MetricBar job={combatant.job} pct={values.pct} maxPct={maxPct} />
                </div>
                <div className="metric-row__numbers tabular">
                  <span className="metric-row__value">
                    {formatRate(values.rate)} {definition.rateLabel}{' '}
                    <span className="metric-row__total">({formatNumber(values.total)})</span>
                  </span>
                  {!compact && (
                    <span className="metric-row__pct">{values.pct.toFixed(1)}%</span>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {menuPosition && onMetricChange && (
        <MetricContextMenu
          x={menuPosition.x}
          y={menuPosition.y}
          currentMetric={metric}
          onSelect={onMetricChange}
          onClose={closeMenu}
        />
      )}
    </div>
  )
}
