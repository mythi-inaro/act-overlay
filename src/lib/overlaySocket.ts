/**
 * OverlayPlugin client for ACT 3.8 / OverlayPlugin 0.19 and IINACT.
 *
 * The CDN common.min.js reconnects after the websocket drops, but it does not
 * send `subscribe` again. Updating ACT or IINACT restarts that socket, so the
 * meter would stay on "Connecting…". This client resubscribes on every open
 * and still talks to ACT's in-process browser via OverlayPluginApi.
 */

type Listener = (data: unknown) => void

const subscribers = new Map<string, Set<Listener>>()
const socketDownListeners = new Set<() => void>()
const pending = new Map<number, (data: unknown) => void>()

let installed = false
let started = false
let ws: WebSocket | null = null
let queue: object[] | null = []
let rseq = 0
let reconnectTimer = 0

function send(msg: object) {
  if (queue) {
    queue.push(msg)
    return
  }

  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(msg))
    return
  }

  window.OverlayPluginApi?.callHandler?.(JSON.stringify(msg))
}

function subscribeAll() {
  const events = [...subscribers.keys()]
  if (events.length === 0) return
  send({ call: 'subscribe', events })
}

function processEvent(msg: unknown) {
  let payload = msg
  if (typeof payload === 'string') {
    try {
      payload = JSON.parse(payload)
    } catch {
      return
    }
  }
  if (!payload || typeof payload !== 'object') return
  const event = payload as { type?: string; rseq?: number }

  if (event.rseq !== undefined && pending.has(event.rseq)) {
    pending.get(event.rseq)?.(event)
    pending.delete(event.rseq)
    return
  }

  if (!event.type) return
  const listeners = subscribers.get(event.type)
  if (!listeners) return
  for (const listener of listeners) listener(event)
}

function connectWs(url: string) {
  const socket = new WebSocket(url)
  ws = socket

  socket.addEventListener('open', () => {
    if (ws !== socket) return
    const queued = queue ?? []
    queue = null
    subscribeAll()
    for (const msg of queued) send(msg)
  })

  socket.addEventListener('message', (message) => {
    if (typeof message.data !== 'string') return
    try {
      processEvent(JSON.parse(message.data))
    } catch {
      // Ignore malformed frames from a half-closed ACT socket.
    }
  })

  socket.addEventListener('close', () => {
    if (ws !== socket) return
    ws = null
    queue = []
    for (const listener of socketDownListeners) listener()
    window.clearTimeout(reconnectTimer)
    reconnectTimer = window.setTimeout(() => connectWs(url), 300)
  })

  socket.addEventListener('error', () => {
    socket.close()
  })
}

function waitForCef() {
  const api = window.OverlayPluginApi
  if (!api?.ready) {
    window.setTimeout(waitForCef, 300)
    return
  }

  const queued = queue ?? []
  queue = null
  if (started) subscribeAll()
  for (const msg of queued) api.callHandler?.(JSON.stringify(msg))
}

export function installOverlayApi() {
  if (installed) return
  installed = true

  window.addOverlayListener = (event, cb) => {
    let listeners = subscribers.get(event)
    if (!listeners) {
      listeners = new Set()
      subscribers.set(event, listeners)
      if (started && queue === null) send({ call: 'subscribe', events: [event] })
    }
    listeners.add(cb)
  }

  window.removeOverlayListener = (event, cb) => {
    subscribers.get(event)?.delete(cb)
  }

  window.startOverlayEvents = () => {
    started = true
    if (queue === null) subscribeAll()
  }

  window.callOverlayHandler = (msg) => {
    const call = { ...msg, rseq: rseq++ }
    return new Promise((resolve) => {
      if (ws || queue) {
        pending.set(call.rseq, resolve)
        send(call)
        return
      }

      const api = window.OverlayPluginApi
      if (!api?.callHandler) {
        resolve(null)
        return
      }

      api.callHandler(JSON.stringify(call), (data) => {
        if (data == null || data === '') {
          resolve(null)
          return
        }
        try {
          resolve(JSON.parse(data))
        } catch {
          resolve(null)
        }
      })
    })
  }

  window.__OverlayCallback = processEvent

  const wsUrl = new URLSearchParams(window.location.search).get('OVERLAY_WS')
  if (wsUrl) connectWs(wsUrl)
  else waitForCef()
}

export function onOverlaySocketDown(listener: () => void) {
  socketDownListeners.add(listener)
  return () => socketDownListeners.delete(listener)
}
