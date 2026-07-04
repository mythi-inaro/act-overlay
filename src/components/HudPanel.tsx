import type { ReactNode } from 'react'

interface HudPanelProps {
  children: ReactNode
  index?: number
  className?: string
  flat?: boolean
}

export function HudPanel({ children, index = 0, className = '', flat = false }: HudPanelProps) {
  return (
    <section
      className={`hud-panel ${flat ? 'hud-panel--flat' : ''} ${className}`}
      style={{ '--i': index } as React.CSSProperties}
    >
      {!flat && (
        <>
          <span className="hud-corner hud-corner--tl" aria-hidden />
          <span className="hud-corner hud-corner--tr" aria-hidden />
          <span className="hud-corner hud-corner--bl" aria-hidden />
          <span className="hud-corner hud-corner--br" aria-hidden />
          <span className="hud-panel__rail" aria-hidden />
        </>
      )}
      <div className="hud-panel__inner">{children}</div>
    </section>
  )
}
