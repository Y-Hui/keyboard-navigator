import { every, size } from 'lodash-es'
import React, {
  Key,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react'

import { VECTOR_ERROR } from '../constant/error'
import { InjectCoordinate, useInjectCoordinate } from '../inject_coordinate'
import KeyboardFocusContext, {
  ErrorHandler,
  KeyboardFocusContextProps,
  KeyboardFocusContextRef,
} from '../keyboard_focus_context'
import { useKeyboardFocusUnsafe } from '../keyboard_focus_context/context'
import { isNumber } from '../utils'

interface DistributionFocusProps extends KeyboardFocusContextProps {
  x?: number
  y?: number
  focusKey?: Key
  /**
   * 自定义模式
   *
   * 为 x 时表示子坐标只需要填写 x 坐标值（可以理解为只有 x 轴）
   *
   * 为 y 时表示子坐标只需要添加 y 坐标值（可以理解为只有 y 轴）
   *
   * @default "x"
   */
  mode?: 'x' | 'y'
  children?: ReactNode
}

/**
 * 将一个焦点进行分发。
 *
 * 场景举例：在 Table 中，一个单元格视为一个焦点，如果单元格中存在对应多个需要焦点的组件，
 * 此时，便需要对焦点进行分发。
 *
 * 此组件大致是这样：
 * 在一个单元格内，维护一套焦点管理系统，可以类比为现实生活中的 “路由器”。
 */
const DistributionFocus: React.FC<DistributionFocusProps> = (props) => {
  const {
    x: rawX,
    y: rawY,
    mode = 'x',
    focusKey,
    children,
    onBlur: onBlurScope,
    onError: onErrorScope,
    onFocus: onFocusScope,
    ...rest
  } = props

  const ctx = useKeyboardFocusUnsafe()
  const {
    setPoint,
    dispatch,
    syncFocusState,
    syncBlurState,
    onError: onCtxError,
  } = ctx || {}

  const [x, y] = useInjectCoordinate(rawX, rawY)

  const inlineContext = useRef<KeyboardFocusContextRef>(null)

  const checkDisabledAll = useCallback(() => {
    return every(inlineContext.current?.coordinates.current, (row) => {
      return row.every((item) => !item || item.disabled)
    })
  }, [])

  useEffect(() => {
    if (!isNumber(x) || !isNumber(y) || !setPoint || !dispatch) return
    return setPoint({
      x,
      y,
      vector: {
        focusKey,
        blur() {
          if (!inlineContext.current) return
          inlineContext.current.triggerBlur()
        },
        trigger(focusFrom) {
          if (!inlineContext.current || !focusFrom) return

          if ('focusKey' in focusFrom) {
            if (mode === 'x') {
              inlineContext.current.notifyVectorByKeyOnXAxis(
                focusFrom.focusKey,
                0,
              )
            } else {
              inlineContext.current.notifyVectorByKeyOnYAxis(
                focusFrom.focusKey,
                0,
              )
            }
            return
          }

          const { subX: fromX, subY, keyName, type } = focusFrom
          if (checkDisabledAll()) {
            dispatch({
              currentX: x,
              currentY: y,
              keyName,
              subX: fromX,
              subY,
              type,
            })
            return
          }
          const maxX = size(inlineContext.current?.coordinates.current[0]) - 1
          const xIndex = Math.min(fromX ?? 0, maxX)

          // 判断由哪个按键进入此坐标轴
          switch (keyName) {
            case 'ArrowLeft': {
              inlineContext.current.notifyXLast(0, focusFrom)
              break
            }
            case 'ArrowRight': {
              inlineContext.current.notifyXFirst(0, focusFrom)
              break
            }
            case 'ArrowUp': {
              if (mode === 'y') {
                // 跳到 y 轴最后一个
                inlineContext.current.notifyYLast(0, focusFrom)
              } else {
                inlineContext.current.notify(xIndex, 0, focusFrom)
              }
              break
            }
            case 'ArrowDown': {
              if (mode === 'y') {
                // 跳到 y 轴第一个
                inlineContext.current.notifyYFirst(0, focusFrom)
              } else {
                inlineContext.current.notify(xIndex, 0, focusFrom)
              }
              break
            }
            // no default
          }
        },
      },
    })
  }, [checkDisabledAll, dispatch, setPoint, x, y, mode, focusKey])

  const onError: ErrorHandler = useCallback(
    (error, focusFrom) => {
      if (!isNumber(x) || !isNumber(y) || !dispatch || !syncBlurState) return
      switch (error) {
        case VECTOR_ERROR.X_MINIMUM:
        case VECTOR_ERROR.X_MAXIMUM:
        case VECTOR_ERROR.Y_MINIMUM:
        case VECTOR_ERROR.Y_MAXIMUM:
        case VECTOR_ERROR.DISABLED: {
          if (!focusFrom) {
            onErrorScope &&
              onErrorScope(error, { x, y, keyName: '', type: 'Distribution' })

            onCtxError &&
              onCtxError(error, { x, y, keyName: '', type: 'Distribution' })
            break
          }
          const { subX, subY } = focusFrom
          dispatch({
            currentX: x,
            currentY: y,
            subX: subX ?? focusFrom.x,
            subY: subY ?? focusFrom.y,
            keyName: focusFrom.keyName,
            type: focusFrom.type,
            onSuccess() {
              syncBlurState(x, y)
            },
          })
          break
        }
        default:
          console.error('[DistributionFocus]: unhandled behavior.', error)
      }
    },
    [dispatch, onCtxError, onErrorScope, syncBlurState, x, y],
  )

  const onFocus = useCallback(() => {
    if (!isNumber(x) || !isNumber(y) || !syncFocusState) return
    onFocusScope && onFocusScope(x, y)
    syncFocusState(x, y)
  }, [onFocusScope, syncFocusState, x, y])

  const onBlur = useCallback(() => {
    if (!isNumber(x) || !isNumber(y) || !syncBlurState) return
    onBlurScope && onBlurScope(x, y)
    syncBlurState(x, y)
  }, [onBlurScope, syncBlurState, x, y])

  const injectValue = useMemo(() => {
    switch (mode) {
      case 'y':
        return '[0, null]'
      default:
        return '[null, 0]'
    }
  }, [mode])

  return (
    <InjectCoordinate.Provider value={injectValue}>
      <KeyboardFocusContext
        {...rest}
        ref={inlineContext}
        onError={onError}
        onFocus={onFocus}
        onBlur={onBlur}
      >
        {children}
      </KeyboardFocusContext>
    </InjectCoordinate.Provider>
  )
}

export default DistributionFocus
