import type { ReactNode } from 'react'

interface HudPanelProps {
  children: ReactNode
  index?: number
  className?: string
}

export function HudPanel({ children, index = 0, className = '' }: HudPanelProps) {
  return (
    <section className={`hud-panel ${className}`} style={{ '--i': index } as React.CSSProperties}>
      <span className="hud-corner hud-corner--tl" aria-hidden />
      <span className="hud-corner hud-corner--tr" aria-hidden />
      <span className="hud-corner hud-corner--bl" aria-hidden />
      <span className="hud-corner hud-corner--br" aria-hidden />
      <div className="hud-panel__inner">{children}</div>
    </section>
  )
}
