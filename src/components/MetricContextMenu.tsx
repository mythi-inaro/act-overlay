import { METRIC_DEFINITIONS, METRIC_IDS, type MetricId } from '../types/metrics'
import { ContextMenu, ContextMenuItem } from './ContextMenu'

interface MetricContextMenuProps {
  x: number
  y: number
  currentMetric: MetricId
  onSelect: (metric: MetricId) => void
  onClose: () => void
}

export function MetricContextMenu({
  x,
  y,
  currentMetric,
  onSelect,
  onClose,
}: MetricContextMenuProps) {
  return (
    <ContextMenu x={x} y={y} onClose={onClose} ariaLabel="Choose metric" label="Show metric">
      {METRIC_IDS.map((metric) => {
        const definition = METRIC_DEFINITIONS[metric]
        return (
          <ContextMenuItem
            key={metric}
            label={definition.label}
            active={metric === currentMetric}
            onSelect={() => {
              onSelect(metric)
              onClose()
            }}
          />
        )
      })}
    </ContextMenu>
  )
}
