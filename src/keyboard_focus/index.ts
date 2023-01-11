import AntdCascaderFocusAdapter from './adapter/antd/cascader'
import AntdRadioFocusAdapter from './adapter/antd/radio'
import AntdSelectFocusAdapter from './adapter/antd/select'
import AntdTableFocusAdapter from './adapter/antd/table'
import InputFocusAdapter from './adapter/input'
import DistributionFocus from './distribution_focus'
import FocusManage, { KeyboardFocusContextRef } from './keyboard_focus_context'

type KeyboardFocusComponent = typeof FocusManage & {
  /** 焦点分发 */
  Distribution: typeof DistributionFocus
  Input: typeof InputFocusAdapter
  AntdCascader: typeof AntdCascaderFocusAdapter
  AntdSelect: typeof AntdSelectFocusAdapter
  AntdRadio: typeof AntdRadioFocusAdapter
  AntdTable: typeof AntdTableFocusAdapter
}

const KeyboardFocus = FocusManage as KeyboardFocusComponent
KeyboardFocus.Input = InputFocusAdapter
KeyboardFocus.AntdSelect = AntdSelectFocusAdapter
KeyboardFocus.AntdRadio = AntdRadioFocusAdapter
KeyboardFocus.AntdCascader = AntdCascaderFocusAdapter
KeyboardFocus.AntdTable = AntdTableFocusAdapter
KeyboardFocus.Distribution = DistributionFocus

export type { KeyboardFocusContextRef }
export type { LimitError, VectorError } from './constant/error'
export { VECTOR_ERROR } from './constant/error'
export { default as useFocusCoordinate } from './hooks/use_focus_coordinate'
export { default as useFocusYAxis } from './hooks/use_focus_y_axis'
export { InjectCoordinate, useInjectCoordinate } from './inject_coordinate'
export type { KeyboardFocusCtxValue } from './keyboard_focus_context/context'
export { useKeyboardFocus } from './keyboard_focus_context/context'
export type {
  Coordinates,
  Ctx,
  DispatchFn,
  DispatchOptions,
  SubCoordinates,
  UnsafeVector,
  Vector,
} from './types'
export default KeyboardFocus
