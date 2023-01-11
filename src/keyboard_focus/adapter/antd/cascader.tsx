import type { SelectProps } from 'antd'
import type { RefSelectProps } from 'antd/lib/select'
import React, {
  cloneElement,
  FunctionComponentElement,
  useEffect,
  useRef,
  useState,
} from 'react'

import { useInjectCoordinate } from '../../inject_coordinate'
import { useKeyboardFocus } from '../../keyboard_focus_context/context'
import { composeRef } from '../../ref'
import { isNumber } from '../../utils'
import { FocusAdapterProps } from '../type'

type CascaderFocusAdapterProps = SelectProps & FocusAdapterProps

const CascaderFocusAdapter: React.VFC<CascaderFocusAdapterProps> = (props) => {
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

  const context = useKeyboardFocus()
  const { setPoint, dispatch, syncBlurState, syncFocusState } = context

  // 焦点是否已经离开当前组件
  const hasLeft = useRef(false)
  const [open, setOpen] = useState(false)

  const selectRef = useRef<RefSelectProps>()

  useEffect(() => {
    if (!isNumber(x) || !isNumber(y)) return
    return setPoint({
      x,
      y,
      vector: {
        focusKey,
        disabled,
        blur() {
          hasLeft.current = true
          setOpen(false)
        },
        trigger() {
          hasLeft.current = false
          if (!selectRef.current) {
            console.error(
              `[KeyboardFocus.AntdCascader] 坐标 (x${x}, y${y}) 缺少 ref 无法设置焦点`,
            )
            return
          }
          selectRef.current.focus()
        },
      },
    })
  }, [disabled, setPoint, x, y, focusKey])

  return cloneElement<CascaderFocusAdapterProps>(children, {
    disabled,
    ...rest,
    ...children.props,
    ref: composeRef(
      selectRef,
      (children as FunctionComponentElement<unknown>)?.ref,
    ),
    open,
    onDropdownVisibleChange: (e) => {
      if (hasLeft.current) {
        hasLeft.current = false
        return
      }
      setOpen(e)
    },
    onMouseEnter: (e) => {
      hasLeft.current = false
      const handleEvent = children.props?.onMouseEnter
      const handleEvent2 = rest?.onMouseEnter
      handleEvent && handleEvent(e)
      handleEvent2 && handleEvent2(e)
    },
    onInputKeyDown: (e) => {
      const event1 = rest?.onInputKeyDown
      const event2 = children.props?.onInputKeyDown
      if (typeof event1 === 'function') {
        event1(e)
      }
      if (typeof event2 === 'function') {
        event2(e)
      }
      if (!isNumber(x) || !isNumber(y)) return
      const switchFocus = () => {
        dispatch({
          currentX: x,
          currentY: y,
          keyName: e.key,
          type: 'AntdCascader',
        })
      }
      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowRight': {
          if (open) {
            e.preventDefault()
            return
          }
          switchFocus()
          break
        }
        default: {
          if (open) return
          switchFocus()
          break
        }
      }
    },
    onFocus: (e) => {
      const event = children.props?.onFocus
      event && event(e)
      if (!isNumber(x) || !isNumber(y)) return
      syncFocusState(x, y)
    },
    onBlur: (e) => {
      const event = children.props?.onBlur
      event && event(e)
      if (!isNumber(x) || !isNumber(y)) return
      syncBlurState(x, y)
    },
  })
}

CascaderFocusAdapter.displayName = 'KeyboardFocus.AntdCascader'

export default CascaderFocusAdapter
