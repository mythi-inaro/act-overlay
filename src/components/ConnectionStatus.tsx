interface ConnectionStatusProps {
  connected: boolean
  overlayMode: boolean
  demoMode: boolean
  visible: boolean
}

export function ConnectionStatus({
  connected,
  overlayMode,
  demoMode,
  visible,
}: ConnectionStatusProps) {
  if (!visible) return null

  const label = demoMode
    ? 'Demo Mode'
    : overlayMode
      ? connected
        ? 'IINACT Connected'
        : 'Connecting…'
      : 'Not Connected'

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
