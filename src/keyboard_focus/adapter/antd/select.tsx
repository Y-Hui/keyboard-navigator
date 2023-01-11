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

type SelectFocusAdapterProps = SelectProps & FocusAdapterProps

/**
 * antd Select 组件按下 ArrowDown 键可以打开浮层，但是却无法禁用这个行为。
 * 所以，接入键盘焦点控制组件后：
 * 如果此时焦点在 Select 组件上，按下 ArrowDown 会把焦点移动到下方，同时这个组件
 * 本身的浮层会被打开。
 *
 * 解决方案：hasLeft 变量
 * 键盘焦点控制组件 blur 函数中设置此变量为 true，表示已经离开此组件，
 * 那么按下 ArrowDown 时，onDropdownVisibleChange 会被再次调用，发现是 true 则直接 return。
 * 但是 onMouseEnter 需要再把 hasLeft 设置为 false，防止鼠标点击 Select 组件无法打开浮层。
 */
const SelectFocusAdapter: React.VFC<SelectFocusAdapterProps> = (props) => {
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

  const selectRef = useRef<RefSelectProps>()
  const [open, setOpen] = useState(false)

  // 焦点是否已经离开当前组件
  const hasLeft = useRef(false)

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
              `[KeyboardFocus.AntdSelect] 坐标 (x${x}, y${y}) 缺少 ref 无法设置焦点`,
            )
            return
          }
          selectRef.current.focus()
          setOpen(true)
        },
      },
    })
  }, [disabled, setPoint, x, y, focusKey])

  return cloneElement<SelectFocusAdapterProps>(children, {
    disabled,
    ...rest,
    ...children.props,
    ref: composeRef(
      selectRef,
      (children as FunctionComponentElement<unknown>)?.ref,
    ),
    open,
    onChange(value, option) {
      const handleChangeProp = children.props?.onChange
      const handleChangeForm = rest?.onChange
      handleChangeProp && handleChangeProp(value, option)
      handleChangeForm && handleChangeForm(value, option)
    },
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
          type: 'AntdSelect',
        })
      }
      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowRight': {
          e.preventDefault()
          switchFocus()
          break
        }
        case 'ArrowUp':
        case 'ArrowDown': {
          if (open) return
          switchFocus()
          break
        }
        // no default
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

SelectFocusAdapter.displayName = 'KeyboardFocus.AntdSelect'

export default SelectFocusAdapter
