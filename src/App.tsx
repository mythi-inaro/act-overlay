import { EncounterHeader } from './components/EncounterHeader'
import { MetricMeter } from './components/MetricMeter'
import { ConfigPanel } from './components/ConfigPanel'
import { HudPanel } from './components/HudPanel'
import { PositionedPanel } from './components/PositionedPanel'
import { ConnectionStatus } from './components/ConnectionStatus'
import { useFightHistory } from './hooks/useFightHistory'
import { useFightSwap } from './hooks/useFightSwap'
import { useMeterConfig } from './hooks/useMeterConfig'
import { useOverlayPlugin } from './hooks/useOverlayPlugin'
import { isConfigMode, isDemoMode, isOverlayMode } from './lib/combatParser'
import { DASHBOARD_PANEL_ID, defaultLayout } from './types/layout'
import { VISIBLE_METER_COUNT } from './types/metrics'
import './styles/hud.css'

const VISIBLE_METERS = VISIBLE_METER_COUNT

function App() {
  const { state: liveState, inGameCombat } = useOverlayPlugin()
  const {
    displayState,
    viewingLive,
    canNavigate,
    archives,
    liveSummary,
    selectedFightId,
    fightIndex,
    fightCount,
    selectFight,
    startNewFight,
  } = useFightHistory(liveState, inGameCombat)
  const fightSwapping = useFightSwap(selectedFightId)
  const overlayMode = isOverlayMode()
  const configMode = isConfigMode()
  const demoMode = isDemoMode()
  const liveMode = overlayMode && !configMode && !demoMode
  const {
    blocks,
    layout,
    setPanelPosition,
    resetPanelPosition,
    addBlock,
    removeBlock,
    setBlockMetric,
    resetBlocks,
    shareUrl,
  } = useMeterConfig()

  const dashboardPosition =
    layout[DASHBOARD_PANEL_ID] ?? defaultLayout(blocks)[DASHBOARD_PANEL_ID]
  const visibleBlocks = blocks.slice(0, VISIBLE_METERS)

  return (
    <>
      {configMode && (
        <ConfigPanel
          blocks={blocks}
          shareUrl={shareUrl}
          onAdd={addBlock}
          onRemove={removeBlock}
          onMetricChange={setBlockMetric}
          onResetPosition={resetPanelPosition}
          onReset={resetBlocks}
        />
      )}

      <main
        className={`overlay-canvas ${configMode ? 'overlay-canvas--config' : ''} ${liveMode ? 'overlay-canvas--live' : ''}`}
      >
        <PositionedPanel
          panelId={DASHBOARD_PANEL_ID}
          position={dashboardPosition}
          draggable={configMode}
          panelIndex={0}
          wide
          onPositionChange={setPanelPosition}
        >
          <HudPanel index={0} className="telemetry-shell">
            <div className={`telemetry-shell__body ${fightSwapping ? 'telemetry-shell__body--swap' : ''}`}>
              <header className="telemetry-shell__encounter">
                <EncounterHeader
                  encounter={displayState.encounter}
                  combatants={displayState.combatants}
                  liveSummary={liveSummary}
                  viewingLive={viewingLive}
                  canNavigate={canNavigate}
                  fightIndex={fightIndex}
                  fightCount={fightCount}
                  archives={archives}
                  selectedFightId={selectedFightId}
                  onSelectFight={selectFight}
                  onNewFight={startNewFight}
                />
              </header>

              <div className="telemetry-grid">
                {visibleBlocks.map((block, index) => (
                  <section
                    key={block.id}
                    className="telemetry-column"
                    data-metric={block.metric}
                    style={{ '--metric-i': index } as React.CSSProperties}
                  >
                    <MetricMeter
                      metric={block.metric}
                      encounter={displayState.encounter}
                      combatants={displayState.combatants}
                      panelIndex={index + 1}
                      compact
                      flipResetKey={selectedFightId}
                      animateRows={configMode}
                      onMetricChange={configMode ? (metric) => setBlockMetric(block.id, metric) : undefined}
                    />
                  </section>
                ))}
              </div>
            </div>
          </HudPanel>
        </PositionedPanel>
      </main>

      <ConnectionStatus
        connected={liveState.connected}
        overlayMode={overlayMode}
        demoMode={demoMode}
        visible={configMode || demoMode}
      />
    </>
  )
}

export default App
