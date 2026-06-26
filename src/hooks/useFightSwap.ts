import { useEffect, useRef, useState } from 'react'

export function useFightSwap(fightId: string): boolean {
  const [swapping, setSwapping] = useState(false)
  const previousFightId = useRef(fightId)

  useEffect(() => {
    if (previousFightId.current === fightId) return

    previousFightId.current = fightId
    setSwapping(true)

    const timer = window.setTimeout(() => {
      setSwapping(false)
    }, 320)

    return () => window.clearTimeout(timer)
  }, [fightId])

  return swapping
}
