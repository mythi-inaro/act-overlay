interface ConnectionStatusProps {
  connected: boolean
  overlayMode: boolean
  visible: boolean
}

export function ConnectionStatus({ connected, overlayMode, visible }: ConnectionStatusProps) {
  if (!visible) return null

  const label = overlayMode
    ? connected
      ? 'IINACT Connected'
      : 'Connecting…'
    : 'Demo Mode'

  return (
    <div
      className={`connection-badge ${connected ? 'connection-badge--connected' : ''}`}
      role="status"
      aria-live="polite"
    >
      <span className="connection-badge__dot" aria-hidden />
      {label}
    </div>
  )
}
