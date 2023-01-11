import { MutableRefObject, Ref } from 'react'

function fillRef<T>(ref: Ref<T>, node: T) {
  if (typeof ref === 'function') {
    ref(node)
    return
  }
  if (typeof ref === 'object' && ref && 'current' in ref) {
    const target = ref as MutableRefObject<unknown>
    target.current = node
  }
}

/**
 * ref 转发，可用于组件内部需要使用 ref，并且还需要转发的情景，或者在
 * cloneElement 的时候需要转发 ref。
 *
 * ```tsx
 * export default forwardRef((props, ref) => {
 *   const inputNode = useRef<HTMLInputElement>()
 *
 *   return <input ref={composeRef(ref, inputNode)} />
 * })
 * ```
 */
export function composeRef<T>(...refs: (Ref<T> | void)[]): Ref<T> {
  const refList = refs.filter((ref): ref is Ref<T> => !!ref)
  if (refList.length <= 1) {
    return refList[0]
  }

  return (node: T) => {
    refList.forEach((ref) => {
      fillRef(ref, node)
    })
  }
}
