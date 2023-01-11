import { isNil } from 'lodash-es'
import { createContext, Key, MutableRefObject, useContext } from 'react'

import { DispatchOptions, ErrorHandler, FocusFrom, Vector } from '../../types'

export interface SetPointOptions {
  x: number
  y: number
  vector: Vector
}

export interface KeyboardFocusCtxValue {
  /**
   * 坐标数据
   */
  coordinates: MutableRefObject<(Vector | undefined | null)[][]>
  /**
   * 设置坐标点
   *
   * 返回值是一个函数，用于删除坐标点
   */
  setPoint: (options: SetPointOptions) => () => void
  /**
   * 通知对应的坐标点
   */
  notify: (x: number, y: number, focusFrom: FocusFrom) => void
  /**
   * 通知 y 轴上最后一个组件
   */
  notifyXLast: (y: number, focusFrom: FocusFrom) => void
  /**
   * 通知 y 轴上第一个组件
   */
  notifyXFirst: (y: number, focusFrom: FocusFrom) => void
  /**
   * 通知 x 坐标上 y 轴第一个可用坐标
   */
  notifyYFirst: (x: number, focusFrom: FocusFrom) => void
  /**
   * 通知 x 坐标上 y 轴最后一个可用坐标
   */
  notifyYLast: (x: number, focusFrom: FocusFrom) => void
  /**
   * 通过 key 通知某一列中的一个坐标
   */
  notifyVectorByKeyOnYAxis: (key: Key | Key[], x: number) => void
  /**
   * 通过 key 通知某一行中的一个坐标
   */
  notifyVectorByKeyOnXAxis: (key: Key | Key[], y: number) => void
  /**
   * 触发所有坐标的 blur 函数。
   */
  triggerBlur: () => void
  /**
   * 焦点派发，在按下键盘按键时调用
   */
  dispatch: (options: DispatchOptions) => void
  /**
   * 同步焦点状态（通常在使用鼠标点击或者函数触发焦点后，需要同步焦点状态，建议在 onFocus 函数中书写）
   */
  syncFocusState: (x: number, y: number) => void
  /**
   * 同步失焦状态（通常在鼠标点击他处或者函数失焦后，需要同步失焦状态，建议在 onBlur 函数中书写）
   */
  syncBlurState: (x: number, y: number) => void
  /** 错误处理 */
  onError: ErrorHandler
}

const KeyboardFocusCtx = createContext<KeyboardFocusCtxValue | null>(null)

function useKeyboardFocusUnsafe() {
  return useContext(KeyboardFocusCtx)
}

function useKeyboardFocus() {
  const ctx = useContext(KeyboardFocusCtx)
  if (isNil(ctx)) {
    throw new Error(
      `useKeyboardFocus must be inserted into <KeyboardFocusCtx.Provider />`,
    )
  }
  return ctx
}

export { KeyboardFocusCtx, useKeyboardFocus, useKeyboardFocusUnsafe }
