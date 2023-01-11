import { startTransition, useCallback, useRef, useState } from 'react'

/**
 * 记录当前焦点位置的 y坐标
 * @param focusDelay 聚焦前延迟
 * @param blurDelay 失焦前延迟
 */
function useFocusYAxis(focusDelay = 44, blurDelay = 44) {
  const blurTimer = useRef<number | undefined>()
  const focusTimer = useRef<number | undefined>()

  const [focusIndex, setFocusIndex] = useState<number>()

  const onFocus = useCallback(
    (_x: number, y: number) => {
      if (startTransition) {
        startTransition(() => {
          clearTimeout(blurTimer.current)
          setFocusIndex(y)
        })
        return
      }
      clearTimeout(blurTimer.current)
      clearTimeout(focusTimer.current)
      focusTimer.current = window.setTimeout(() => {
        setFocusIndex(y)
      }, focusDelay)
    },
    [focusDelay],
  )

  const onBlur = useCallback(() => {
    clearTimeout(blurTimer.current)
    clearTimeout(focusTimer.current)
    blurTimer.current = window.setTimeout(() => {
      setFocusIndex(undefined)
    }, blurDelay)
  }, [blurDelay])

  return [focusIndex, { onFocus, onBlur }] as const
}

export default useFocusYAxis
