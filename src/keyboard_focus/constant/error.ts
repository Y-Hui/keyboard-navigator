type ValueOf<T> = T[keyof T]

export const VECTOR_ERROR = {
  /** 对应 X 坐标不存在 */
  NOT_X_AXIS: 'NOT_X_AXIS',
  /** 对应 Y 坐标不存在 */
  NOT_Y_AXIS: 'NOT_Y_AXIS',
  /** 目前处于 X 轴极大值 */
  X_MAXIMUM: 'X_MAXIMUM',
  /** 目前处于 Y 轴极大值 */
  Y_MAXIMUM: 'Y_MAXIMUM',
  /** 目前处于 X 轴极小值 */
  X_MINIMUM: 'X_MINIMUM',
  /** 目前处于 Y 轴极小值 */
  Y_MINIMUM: 'Y_MINIMUM',
  /** 对应 Y 轴中没有坐标点 */
  EMPTY: 'EMPTY',
  /** 对应坐标点已被禁用 */
  DISABLED: 'DISABLED',
  /** 对应的 Key 不存在 */
  NOT_KEY: 'NOT_KEY',
} as const

export type VectorError = ValueOf<typeof VECTOR_ERROR>

export type LimitError = ValueOf<
  Pick<
    typeof VECTOR_ERROR,
    'X_MAXIMUM' | 'X_MINIMUM' | 'Y_MAXIMUM' | 'Y_MINIMUM'
  >
>
