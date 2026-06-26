declare global {
  interface Window {
    OverlayPluginApi?: {
      endEncounter?: () => void
    }
  }
}

/**
 * Ask ACT / IINACT to split the current encounter. Works with OverlayPlugin CEF
 * overlays; WebSocket-only hosts may ignore this (use /endenc in-game for IINACT).
 */
export async function requestEndEncounter(): Promise<void> {
  window.OverlayPluginApi?.endEncounter?.()

  if (window.callOverlayHandler) {
    try {
      await window.callOverlayHandler({ call: 'endEncounter' })
    } catch {
      // Handler may not exist on WS-only hosts.
    }
  }
}
