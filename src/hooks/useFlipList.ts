import { useLayoutEffect, useRef, type RefObject } from 'react'

interface FlipItem {
  id: string
}

export function useFlipList<T extends FlipItem>(
  items: T[],
  listRef: RefObject<HTMLElement | null>,
  resetKey?: string,
  enabled = true,
) {
  const positionsRef = useRef<Map<string, DOMRect>>(new Map())
  const isFirstRender = useRef(true)
  const resetKeyRef = useRef(resetKey)

  useLayoutEffect(() => {
    if (!enabled) return

    if (resetKey !== undefined && resetKeyRef.current !== resetKey) {
      resetKeyRef.current = resetKey
      isFirstRender.current = true
      positionsRef.current.clear()
    }

    const list = listRef.current
    if (!list) return

    const elements = list.querySelectorAll<HTMLElement>('[data-flip-id]')

    if (isFirstRender.current) {
      isFirstRender.current = false
      elements.forEach((element) => {
        const id = element.dataset.flipId
        if (id) positionsRef.current.set(id, element.getBoundingClientRect())
      })
      return
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    elements.forEach((element) => {
      const id = element.dataset.flipId
      if (!id) return

      const previous = positionsRef.current.get(id)
      const next = element.getBoundingClientRect()

      if (previous && !reduceMotion) {
        const deltaY = previous.top - next.top
        if (Math.abs(deltaY) > 0.5) {
          element.animate(
            [
              { transform: `translateY(${deltaY}px)` },
              { transform: 'translateY(0)' },
            ],
            {
              duration: 320,
              easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
            },
          )
        }
      }

      positionsRef.current.set(id, next)
    })

    const currentIds = new Set(
      [...elements].map((element) => element.dataset.flipId).filter(Boolean) as string[],
    )

    for (const id of positionsRef.current.keys()) {
      if (!currentIds.has(id)) positionsRef.current.delete(id)
    }
  }, [enabled, items, listRef, resetKey])
}
