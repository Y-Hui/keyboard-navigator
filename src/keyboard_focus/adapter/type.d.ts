import { Key, ReactElement } from 'react'

export interface FocusAdapterProps {
  x?: number
  y?: number
  /** key，可通过 key 手动激活焦点。 */
  focusKey?: Key
  /** 是否禁用焦点 */
  disabled?: boolean
  children: ReactElement
}
