import {
  METRIC_DEFINITIONS,
  METRIC_IDS,
  VISIBLE_METER_COUNT,
  type MeterBlock,
  type MetricId,
} from '../types/metrics'

interface ConfigPanelProps {
  blocks: MeterBlock[]
  shareUrl: string
  onAdd: (metric: MetricId) => void
  onRemove: (id: string) => void
  onMetricChange: (id: string, metric: MetricId) => void
  onResetPosition: () => void
  onReset: () => void
}

export function ConfigPanel({
  blocks,
  shareUrl,
  onAdd,
  onRemove,
  onMetricChange,
  onResetPosition,
  onReset,
}: ConfigPanelProps) {
  const unusedMetrics = METRIC_IDS.filter(
    (metric) => !blocks.some((block) => block.metric === metric),
  )

  return (
    <aside className="config-panel">
      <span className="config-panel__rail" aria-hidden />
      <div className="config-panel__header">
        <span className="hud-label">Meter Blocks</span>
        <button type="button" className="config-panel__reset" onClick={onReset}>
          Reset all
        </button>
      </div>

      <p className="config-panel__hint">
        Drag the overlay handle to reposition. Right-click any graph to change its metric. Two
        graphs appear side by side below the encounter summary.
      </p>

      <div className="config-panel__section">
        <button
          type="button"
          className="config-panel__btn config-panel__btn--text config-panel__btn--full"
          onClick={onResetPosition}
        >
          Reset overlay position
        </button>
      </div>

      <div className="config-panel__list">
        {blocks.map((block, index) => (
          <div key={block.id} className="config-panel__row">
            <span className="config-panel__index tabular">{index + 1}</span>
            <select
              className="config-panel__select"
              value={block.metric}
              onChange={(e) => onMetricChange(block.id, e.target.value as MetricId)}
            >
              {METRIC_IDS.map((metric) => (
                <option key={metric} value={metric}>
                  {METRIC_DEFINITIONS[metric].label}
                </option>
              ))}
            </select>
            <div className="config-panel__actions">
              <button
                type="button"
                className="config-panel__btn config-panel__btn--remove"
                onClick={() => onRemove(block.id)}
                disabled={blocks.length <= VISIBLE_METER_COUNT}
                aria-label="Remove block"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>

      {unusedMetrics.length > 0 && (
        <div className="config-panel__add">
          <span className="config-panel__add-label">Add block</span>
          <div className="config-panel__add-buttons">
            {unusedMetrics.map((metric) => (
              <button
                key={metric}
                type="button"
                className="config-panel__add-btn"
                onClick={() => onAdd(metric)}
              >
                + {METRIC_DEFINITIONS[metric].label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="config-panel__share">
        <span className="config-panel__share-label">Share config URL</span>
        <code className="config-panel__url">{shareUrl}</code>
      </div>
    </aside>
  )
}
