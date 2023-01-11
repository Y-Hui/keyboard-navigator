import { isNil } from 'lodash-es'
import React, {
  forwardRef,
  PropsWithChildren,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'

import normalDispatch from '../dispatch_strategy'
import useLatest from '../hooks/useLatest'
import {
  Coordinates,
  DispatchFn,
  ErrorHandler,
  FocusVectorOptions,
} from '../types'
import {
  getFirstVector,
  getLastVector,
  getVector,
  getVectorByKeyOnXAxis,
  getVectorByKeyOnYAxis,
  getYFirstVector,
  getYLastVector,
} from '../utils'
import { KeyboardFocusCtx, KeyboardFocusCtxValue } from './context'

export type KeyboardFocusContextRef = KeyboardFocusCtxValue
export type { ErrorHandler }
export type FocusedHandler = (x: number, y: number) => void

export interface KeyboardFocusContextProps {
  /**
   * 焦点调度策略
   */
  dispatch?: DispatchFn
  /**
   * 错误处理
   */
  onError?: ErrorHandler
  /**
   * 组件处于焦点后触发
   */
  onFocus?: FocusedHandler
  /**
   * 组件失焦后触发
   */
  onBlur?: FocusedHandler
}

const KeyboardFocusContext = forwardRef<
  KeyboardFocusContextRef,
  PropsWithChildren<KeyboardFocusContextProps>
>((props, ref) => {
  const {
    onError,
    onFocus,
    dispatch = normalDispatch,
    onBlur: onBlurEvent,
    children,
  } = props

  const schedule = useLatest(dispatch)

  const handleErrorRef = useLatest(onError)
  const handleError: ErrorHandler = useCallback(
    (type, focusFrom) => {
      const handler = handleErrorRef.current
      handler && handler(type, focusFrom)
    },
    [handleErrorRef],
  )

  const handleFocusedRef = useLatest(onFocus)
  const handleFocused: FocusedHandler = useCallback(
    (x, y) => {
      const handler = handleFocusedRef.current
      handler && handler(x, y)
    },
    [handleFocusedRef],
  )

  /**
   * 二维笛卡尔坐标
   * 用于记录所有表单输入组件。
   */
  const coordinates = useRef<Coordinates>([])
  /**
   * key 为 x,y
   * value 为函数
   */
  const [blurFnMap] = useState(
    () => new Map<string, (() => void) | undefined>(),
  )

  const onBlur = useCallback(
    (skipX?: number, skipY?: number) => {
      const skipKey = `${skipX},${skipY}`
      const isValid = typeof skipX === 'number' && typeof skipY === 'number'
      blurFnMap.forEach((blur, key) => {
        if (isValid && skipKey === key) return
        blur && blur()
      })
    },
    [blurFnMap],
  )

  const triggerVector = useCallback(
    (options: FocusVectorOptions) => {
      const { x, y, vector, from } = options
      onBlur(x, y)
      vector.trigger(from)
    },
    [onBlur],
  )

  const prevFocus = useRef<{ x: number; y: number }>()

  const state = useMemo(() => {
    const result: KeyboardFocusCtxValue = {
      coordinates,
      dispatch(opts) {
        schedule.current(
          {
            coordinates: coordinates.current,
            focus: triggerVector,
            throwError(options) {
              handleError(options.error, options.from)
            },
          },
          opts,
        )
      },
      setPoint(options) {
        const { x, y, vector } = options
        const yAxis = coordinates.current[y] || []
        const key = Date.now()
        yAxis[x] = { ...vector, key }
        coordinates.current[y] = yAxis
        blurFnMap.set(`${x},${y}`, vector.blur)
        return () => {
          const _yAxis = coordinates.current[y] || []
          const target = _yAxis[x]
          if (!isNil(target?.key) && key !== target?.key) return
          _yAxis[x] = undefined
          coordinates.current[y] = _yAxis
          blurFnMap.delete(`${x},${y}`)
        }
      },
      notifyXLast(y, focusFrom) {
        const {
          err,
          x: targetX,
          y: targetY,
          value,
        } = getLastVector(coordinates.current, y)
        if (err) {
          handleError(err, focusFrom)
          return
        }
        triggerVector({
          x: targetX,
          y: targetY,
          vector: value,
          from: focusFrom,
        })
      },
      notify(x, y, focusFrom) {
        const {
          err,
          x: targetX,
          y: targetY,
          value,
        } = getVector(coordinates.current, x, y)
        if (err) {
          handleError(err, focusFrom)
          return
        }
        triggerVector({
          x: targetX,
          y: targetY,
          vector: value,
          from: focusFrom,
        })
      },
      notifyXFirst(y, focusFrom) {
        const {
          err,
          x: targetX,
          y: targetY,
          value,
        } = getFirstVector(coordinates.current, y)
        if (err) {
          handleError(err, focusFrom)
          return
        }
        triggerVector({
          x: targetX,
          y: targetY,
          vector: value,
          from: focusFrom,
        })
      },
      notifyYFirst(x, focusFrom) {
        const {
          err,
          x: targetX,
          y: targetY,
          value,
        } = getYFirstVector(coordinates.current, x)
        if (err) {
          handleError(err, focusFrom)
          return
        }
        triggerVector({
          x: targetX,
          y: targetY,
          vector: value,
          from: focusFrom,
        })
      },
      notifyYLast(x, focusFrom) {
        const {
          err,
          x: targetX,
          y: targetY,
          value,
        } = getYLastVector(coordinates.current, x)
        if (err) {
          handleError(err, focusFrom)
          return
        }
        triggerVector({
          x: targetX,
          y: targetY,
          vector: value,
          from: focusFrom,
        })
      },
      notifyVectorByKeyOnYAxis(key, x) {
        const {
          err,
          value,
          key: focusKey,
        } = getVectorByKeyOnYAxis(coordinates.current, x, key)
        if (err) {
          handleError(err)
          return
        }
        onBlur()
        const [, ...restKey] = focusKey!
        value.trigger({ focusKey: restKey })
      },
      notifyVectorByKeyOnXAxis(key, y) {
        const {
          err,
          value,
          key: focusKey,
        } = getVectorByKeyOnXAxis(coordinates.current, y, key)
        if (err) {
          handleError(err)
          return
        }
        onBlur()
        const [, ...restKey] = focusKey!
        value.trigger({ focusKey: restKey })
      },
      triggerBlur: () => onBlur(),
      syncFocusState(x, y) {
        prevFocus.current = { x, y }
        handleFocused(x, y)
      },
      syncBlurState: (x, y) => {
        const { x: prevX, y: prevY } = prevFocus.current || {}
        // 若失焦时发现当前坐标与上一次记录的聚焦坐标不一致，则不触发函数（已经没有触发的意义了）
        if (isNil(prevFocus.current) || (prevX === x && prevY === y)) {
          onBlurEvent && onBlurEvent(x, y)
        }
      },
      onError: handleError,
    }
    return result
  }, [
    schedule,
    triggerVector,
    handleError,
    blurFnMap,
    onBlur,
    handleFocused,
    onBlurEvent,
  ])

  useImperativeHandle(ref, () => state, [state])

  return (
    <KeyboardFocusCtx.Provider value={state}>
      {children}
    </KeyboardFocusCtx.Provider>
  )
})

KeyboardFocusContext.displayName = 'KeyboardFocus'

export default KeyboardFocusContext
