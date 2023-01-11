import type { RadioProps } from 'antd'
import { isNil } from 'lodash-es'
import React, {
  cloneElement,
  FunctionComponentElement,
  useCallback,
  useEffect,
  useRef,
} from 'react'

import { useInjectCoordinate } from '../../inject_coordinate'
import { useKeyboardFocus } from '../../keyboard_focus_context/context'
import { composeRef } from '../../ref'
import { isNumber } from '../../utils'
import { FocusAdapterProps } from '../type'

type RadioFocusAdapterProps = RadioProps & FocusAdapterProps

interface RadioRef {
  blur: () => void
  focus: () => void
  input: HTMLInputElement
}

const RadioFocusAdapter: React.VFC<RadioFocusAdapterProps> = (props) => {
  const {
    x: rawX,
    y: rawY,
    children,
    disabled: rawDisabled,
    focusKey,
    ...rest
  } = props

  const disabled = !!(rawDisabled || children.props?.disabled)

  const [x, y] = useInjectCoordinate(rawX, rawY)

  const { setPoint, dispatch, syncBlurState, syncFocusState } =
    useKeyboardFocus()

  const inputNode = useRef<RadioRef | null>(null)

  useEffect(() => {
    if (!isNumber(x) || !isNumber(y)) return
    return setPoint({
      x,
      y,
      vector: {
        focusKey,
        disabled,
        trigger() {
          if (!inputNode.current) {
            console.error(
              `[KeyboardFocus.AntdRadio] 坐标 (x${x}, y${y}) 缺少 ref 无法设置焦点`,
            )
            return
          }
          inputNode.current.focus()
        },
      },
    })
  }, [disabled, setPoint, x, y, focusKey])

  const controller = useRef<AbortController | undefined>()

  const saveRef = useCallback(
    (instance: RadioRef) => {
      inputNode.current = instance
      if (!isNumber(x) || !isNumber(y) || isNil(instance)) return
      if (!isNil(controller.current)) {
        controller.current.abort()
      }
      controller.current = new AbortController()
      instance.input.addEventListener(
        'focus',
        () => {
          syncFocusState(x, y)
        },
        {
          signal: controller.current.signal,
        },
      )
      instance.input.addEventListener(
        'blur',
        () => {
          syncBlurState(x, y)
        },
        {
          signal: controller.current.signal,
        },
      )
    },
    [syncBlurState, syncFocusState, x, y],
  )

  useEffect(
    () => () => {
      controller.current?.abort && controller.current.abort()
    },
    [],
  )

  return cloneElement<RadioProps>(children, {
    disabled,
    ...rest,
    ...children.props,
    ref: composeRef(
      saveRef,
      (children as FunctionComponentElement<unknown>)?.ref,
    ),
    onKeyDown: (e) => {
      e.preventDefault()
      e.stopPropagation()
      const event1 = rest?.onKeyDown
      const event2 = children.props?.onKeyDown
      if (typeof event1 === 'function') event1(e)
      if (typeof event2 === 'function') event2(e)
      if (!isNumber(x) || !isNumber(y)) return
      switch (e.key) {
        case 'Enter': {
          e.currentTarget?.click && e.currentTarget.click()
          dispatch({
            currentX: x,
            currentY: y,
            keyName: e.key,
            type: 'AntdRadio',
          })
          break
        }
        default: {
          dispatch({
            currentX: x,
            currentY: y,
            keyName: e.key,
            type: 'AntdRadio',
          })
        }
      }
    },
  })
}

RadioFocusAdapter.displayName = 'KeyboardFocus.AntdRadio'

export default RadioFocusAdapter
