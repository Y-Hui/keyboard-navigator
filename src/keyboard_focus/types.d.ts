import { Key } from 'react'

import type { VectorError } from './constant/error'

export interface CurrentCoordinates {
  /** 当前所在的 x 坐标 */
  currentX: number
  /** 当前所在的 y 坐标 */
  currentY: number
}

export interface SubCoordinates {
  /** 一个坐标点中的子坐标，焦点分发时才存在 */
  subX?: number
  /** 一个坐标点中的子坐标，焦点分发时才存在 */
  subY?: number
}

/**
 * 焦点来源
 */
export interface FocusFrom extends SubCoordinates {
  /** 来源 x 坐标 */
  x: number
  /** 来源 y 坐标 */
  y: number
  /** 按键名称 */
  keyName: string
  /** 触发类型（组件名称） */
  type: string
}

export interface FocusFromWithKey extends Partial<FocusFrom> {
  /** 使用 key 触发焦点 */
  focusKey: Key[]
}

export interface Vector {
  /** 内部私有属性，用于组件被删除时删除坐标使用 */
  key?: Key
  focusKey?: Key
  /**
   * 是否禁用焦点
   */
  disabled?: boolean
  /**
   * 触发子组件（通知该组件表示它处于激活状态）
   */
  trigger: (focusFrom?: FocusFrom | FocusFromWithKey) => void
  /**
   * 失去焦点时触发
   */
  blur?: () => void
}

export type UnsafeVector = Vector | null | undefined
export type Coordinates = UnsafeVector[][]

export interface DispatchOptions extends CurrentCoordinates {
  /** 按键名称 */
  keyName: string
  /** 触发类型（组件名称） */
  type: string
  /** 一个坐标点中的子坐标，焦点分发时才存在 */
  subX?: number
  /** 一个坐标点中的子坐标，焦点分发时才存在 */
  subY?: number
  /** 切换坐标成功的回调 */
  onSuccess?: () => void
}

export interface ThrowErrorOptions extends CurrentCoordinates {
  error: VectorError
  from: FocusFrom
}

export interface FocusVectorOptions {
  /** 被激活坐标点的 x 值 */
  x: number
  /** 被激活坐标点的 y 值 */
  y: number
  vector: Vector
  from: FocusFrom
}

export interface Ctx {
  /** 所有坐标 */
  coordinates: Coordinates
  /** 激活对应坐标 */
  focus: (options: FocusVectorOptions) => void
  /** 将错误向外传递 */
  throwError: (options: ThrowErrorOptions) => void
}

export type DispatchFn = (ctx: Ctx, options: DispatchOptions) => void
export type ErrorHandler = (type: VectorError, focusFrom?: FocusFrom) => void
