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
import { isConfigMode, isOverlayMode } from './lib/combatParser'
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
  const liveMode = overlayMode && !configMode
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
          <div className={`dashboard ${fightSwapping ? 'dashboard--swap' : ''}`}>
            <div className="dashboard__body">
              <HudPanel index={0} className="dashboard__encounter">
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
              </HudPanel>

              <div className="meter-row">
                {visibleBlocks.map((block, index) => (
                  <HudPanel key={block.id} index={index + 1} className="meter-row__panel">
                    <MetricMeter
                      metric={block.metric}
                      encounter={displayState.encounter}
                      combatants={displayState.combatants}
                      panelIndex={index + 1}
                      compact
                      flipResetKey={selectedFightId}
                      animateRows={configMode}
                      onMetricChange={(metric) => setBlockMetric(block.id, metric)}
                    />
                  </HudPanel>
                ))}
              </div>
            </div>
          </div>
        </PositionedPanel>
      </main>

      <ConnectionStatus
        connected={liveState.connected}
        overlayMode={overlayMode}
        visible={configMode}
      />
    </>
  )
}

export default App
