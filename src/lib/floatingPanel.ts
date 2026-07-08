export function clampFloatingPosition(
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
