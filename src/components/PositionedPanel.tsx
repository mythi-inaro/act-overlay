import { useCallback, useRef, useState, type ReactNode } from 'react'
import { clampPosition, DASHBOARD_WIDTH, type PanelPosition } from '../types/layout'

interface PositionedPanelProps {
  panelId: string
  position: PanelPosition
  draggable: boolean
  panelIndex: number
  wide?: boolean
  onPositionChange: (panelId: string, position: PanelPosition) => void
  children: ReactNode
}

export function PositionedPanel({
  panelId,
  position,
  draggable,
  panelIndex,
  wide = false,
  onPositionChange,
  children,
}: PositionedPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const dragOffset = useRef({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)

  const finishDrag = useCallback(
    (clientX: number, clientY: number) => {
      const panel = panelRef.current
      if (!panel) return

      const next = clampPosition(
        {
          x: ((clientX - dragOffset.current.x) / window.innerWidth) * 100,
          y: ((clientY - dragOffset.current.y) / window.innerHeight) * 100,
        },
        panel.offsetHeight,
        wide ? DASHBOARD_WIDTH : undefined,
      )

      onPositionChange(panelId, next)
    },
    [onPositionChange, panelId, wide],
  )

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      if (!draggable || !panelRef.current) return

      const rect = panelRef.current.getBoundingClientRect()
      dragOffset.current = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      }

      setDragging(true)
      event.currentTarget.setPointerCapture(event.pointerId)

      const onMove = (moveEvent: PointerEvent) => {
        finishDrag(moveEvent.clientX, moveEvent.clientY)
      }

      const onUp = (upEvent: PointerEvent) => {
        finishDrag(upEvent.clientX, upEvent.clientY)
        setDragging(false)
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerup', onUp)
      }

      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', onUp)
    },
    [draggable, finishDrag],
  )

  return (
    <div
      ref={panelRef}
      className={`positioned-panel ${wide ? 'positioned-panel--dashboard' : ''} ${draggable ? 'positioned-panel--draggable' : ''} ${dragging ? 'positioned-panel--dragging' : ''}`}
      style={
        {
          left: `${position.x}%`,
          top: `${position.y}%`,
          '--i': panelIndex,
        } as React.CSSProperties
      }
    >
      {draggable && (
        <button
          type="button"
          className="positioned-panel__handle"
          onPointerDown={onPointerDown}
          aria-label="Drag to reposition overlay"
        >
          <span className="positioned-panel__handle-grip" aria-hidden />
          Drag
        </button>
      )}
      {children}
    </div>
  )
}
