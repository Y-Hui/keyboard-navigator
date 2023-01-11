/**
 * 默认焦点调度策略
 *
 * 支持 ArrowUp、ArrowRight、ArrowDown、ArrowLeft 按键，
 * 在 x/y 轴遇到边界时停止触发（若你需要在遇到边界时将焦点循环，可自定义调度策略）。
 */
import { DispatchFn } from './types'
import {
  getBottomVector,
  getLeftVector,
  getRightVector,
  getTopVector,
  UnionVal,
} from './utils'

const dispatchStrategy: DispatchFn = (ctx, options) => {
  const { coordinates, focus, throwError } = ctx
  const { subX, subY, currentX, currentY, keyName, type, onSuccess } = options

  const handler = (value: UnionVal) => {
    const { err, value: vector, x, y } = value
    if (err) {
      throwError({
        error: err,
        currentX,
        currentY,
        from: { keyName, type, x: currentX, y: currentY },
      })
      return
    }
    onSuccess && onSuccess()
    focus({
      x,
      y,
      vector,
      from: {
        keyName,
        type,
        x: currentX,
        y: currentY,
        subX,
        subY,
      },
    })
  }

  switch (keyName) {
    case 'ArrowLeft': {
      handler(getLeftVector(coordinates, currentX, currentY))
      break
    }
    case 'ArrowRight': {
      handler(getRightVector(coordinates, currentX, currentY))
      break
    }
    case 'ArrowUp': {
      handler(getTopVector(coordinates, currentX, currentY))
      break
    }
    case 'ArrowDown': {
      handler(getBottomVector(coordinates, currentX, currentY))
      break
    }
    // no default
  }
}

export default dispatchStrategy
