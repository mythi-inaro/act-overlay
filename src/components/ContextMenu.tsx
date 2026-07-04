import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface ContextMenuProps {
  x: number
  y: number
  onClose: () => void
  ariaLabel: string
  label?: string
  children: ReactNode
}

function clampMenuPosition(
  x: number,
  y: number,
  width: number,
  height: number,
  padding = 8,
): { left: number; top: number } {
  const maxLeft = window.innerWidth - width - padding
  const maxTop = window.innerHeight - height - padding

  let left = x
  let top = y

  if (left + width > window.innerWidth - padding) {
    left = x - width
  }

  if (top + height > window.innerHeight - padding) {
    top = y - height
  }

  return {
    left: Math.min(Math.max(padding, left), Math.max(padding, maxLeft)),
    top: Math.min(Math.max(padding, top), Math.max(padding, maxTop)),
  }
}

export function ContextMenu({ x, y, onClose, ariaLabel, label, children }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState<{ left: number; top: number } | null>(null)

  useLayoutEffect(() => {
    const menu = menuRef.current
    if (!menu) return

    const rect = menu.getBoundingClientRect()
    setPosition(clampMenuPosition(x, y, rect.width, rect.height))
  }, [x, y])

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (menuRef.current?.contains(event.target as Node)) return
      onClose()
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    const handleScroll = (event: Event) => {
      if (menuRef.current?.contains(event.target as Node)) return
      onClose()
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    window.addEventListener('scroll', handleScroll, true)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [onClose])

  return createPortal(
    <div
      ref={menuRef}
      className="context-menu"
      style={{
        left: position?.left ?? x,
        top: position?.top ?? y,
        visibility: position ? 'visible' : 'hidden',
      }}
      role="menu"
      aria-label={ariaLabel}
    >
      {label && <span className="context-menu__label">{label}</span>}
      {children}
    </div>,
    document.body,
  )
}

interface ContextMenuItemProps {
  label: string
  detail?: string
  active?: boolean
  onSelect: () => void
}

export function ContextMenuItem({ label, detail, active = false, onSelect }: ContextMenuItemProps) {
  return (
    <button
      type="button"
      className={`context-menu__item ${active ? 'context-menu__item--active' : ''}`}
      role="menuitemradio"
      aria-checked={active}
      onClick={onSelect}
    >
      <span className="context-menu__item-text">
        <span>{label}</span>
        {detail && <span className="context-menu__item-detail">{detail}</span>}
      </span>
      {active && <span className="context-menu__check" aria-hidden>✓</span>}
    </button>
  )
}

export function ContextMenuAction({ label, onSelect }: { label: string; onSelect: () => void }) {
  return (
    <button
      type="button"
      className="context-menu__action"
      role="menuitem"
      onClick={onSelect}
    >
      {label}
    </button>
  )
}

export function ContextMenuDivider() {
  return <div className="context-menu__divider" role="separator" />
}
