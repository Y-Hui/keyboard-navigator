import { isNil } from 'lodash-es'
import { useCallback, useMemo, useRef, useState } from 'react'

type FocusCoordinates = { x: number; y: number }

/**
 * 记录当前焦点位置的坐标
 * @param focusDelay 聚焦前延迟
 * @param blurDelay 失焦前延迟
 */
function useFocusCoordinate(focusDelay = 16.7, blurDelay = 16.7) {
  const blurTimer = useRef<number | undefined>()
  const focusTimer = useRef<number | undefined>()

  const [focusIndex, setFocusIndex] = useState<FocusCoordinates>()

  const onFocus = useCallback(
    (x: number, y: number) => {
      clearTimeout(blurTimer.current)
      clearTimeout(focusTimer.current)
      focusTimer.current = window.setTimeout(() => {
        setFocusIndex((prev) => {
          if (isNil(prev) || prev.x !== x || prev.y !== y) {
            return { x, y }
          }
          return prev
        })
      }, focusDelay)
    },
    [focusDelay],
  )

  const onBlur = useMemo(() => {
    return () => {
      clearTimeout(blurTimer.current)
      clearTimeout(focusTimer.current)
      blurTimer.current = window.setTimeout(() => {
        setFocusIndex(undefined)
      }, blurDelay)
    }
  }, [blurDelay])

  return [
    (focusIndex || {}) as Partial<FocusCoordinates>,
    { onFocus, onBlur },
  ] as const
}

export default useFocusCoordinate
