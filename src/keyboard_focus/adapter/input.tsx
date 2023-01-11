import { size } from 'lodash-es'
import React, {
  cloneElement,
  FunctionComponentElement,
  useEffect,
  useRef,
} from 'react'

import { useInjectCoordinate } from '../inject_coordinate'
import { useKeyboardFocus } from '../keyboard_focus_context/context'
import { composeRef } from '../ref'
import { isNumber } from '../utils'
import { FocusAdapterProps } from './type'

type NativeInputProps = React.InputHTMLAttributes<HTMLInputElement>
type InputFocusAdapterProps = NativeInputProps &
  FocusAdapterProps & {
    /**
     * 是否阻止回车键默认事件。
     * 若不阻止默认事件，在文本框中回车时将会触发表单提交
     *
     * @default true
     */
    pressEnterPreventDefault?: boolean
  }

const InputFocusAdapter: React.VFC<InputFocusAdapterProps> = (props) => {
  const {
    x: rawX,
    y: rawY,
    children,
    pressEnterPreventDefault = true,
    disabled: rawDisabled,
    focusKey,
    ...rest
  } = props

  const disabled = !!(rawDisabled || children.props?.disabled)

  const [x, y] = useInjectCoordinate(rawX, rawY)
  const { setPoint, dispatch, syncBlurState, syncFocusState } =
    useKeyboardFocus()

  const inputNode = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isNumber(x) || !isNumber(y)) return
    // setPoint 会返回一个函数，用于在组件卸载时移除坐标
    return setPoint({
      x,
      y,
      vector: {
        focusKey,
        disabled,
        trigger() {
          if (!inputNode.current) {
            console.error(
              `[KeyboardFocus.Input] 坐标 (x${x}, y${y}) 缺少 ref 无法设置焦点`,
            )
            return
          }
          inputNode.current.focus()
          setTimeout(() => {
            inputNode.current!.select()
          })
        },
      },
    })
  }, [disabled, setPoint, x, y, focusKey])

  return cloneElement<NativeInputProps>(children, {
    disabled,
    ...rest,
    ...children.props,
    ref: composeRef(
      inputNode,
      (children as FunctionComponentElement<unknown>)?.ref,
    ),
    onKeyDown: (e) => {
      const onKeyDown = children.props?.onKeyDown
      if (typeof onKeyDown === 'function') onKeyDown(e)
      if (!isNumber(x) || !isNumber(y)) return
      const { value } = e.currentTarget
      // 光标起始位置
      const startIndex = e.currentTarget.selectionStart || 0
      // 光标结束位置
      const endIndex = e.currentTarget.selectionEnd || 0
      // 没有用鼠标框选文本
      const notSelected = startIndex === endIndex

      switch (e.key) {
        case 'Enter': {
          if (!pressEnterPreventDefault) return
          e.preventDefault()
          return
        }
        case 'ArrowLeft': {
          if (!notSelected || startIndex > 0) return
          e.preventDefault()
          dispatch({ currentX: x, currentY: y, keyName: e.key, type: 'Input' })
          break
        }
        case 'ArrowRight': {
          if (!notSelected || endIndex < size(value)) return
          e.preventDefault()
          dispatch({ currentX: x, currentY: y, keyName: e.key, type: 'Input' })
          break
        }
        default: {
          dispatch({ currentX: x, currentY: y, keyName: e.key, type: 'Input' })
        }
      }
    },
    onFocus: (e) => {
      const onFocus = children.props?.onFocus
      if (typeof onFocus === 'function') onFocus(e)
      if (!isNumber(x) || !isNumber(y)) return
      syncFocusState(x, y)
    },
    onBlur: (e) => {
      const onBlur = children.props?.onBlur
      if (typeof onBlur === 'function') onBlur(e)
      if (!isNumber(x) || !isNumber(y)) return
      syncBlurState(x, y)
    },
  })
}

InputFocusAdapter.displayName = 'KeyboardFocus.Input'

export default InputFocusAdapter
