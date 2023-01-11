import { findIndex, get, size } from 'lodash-es'
import { Key } from 'react'

import { VECTOR_ERROR, VectorError } from './constant/error'
import type { Coordinates, Vector } from './types'

export function isNumber(value?: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value)
}

interface InvalidVal {
  /**
   * 访问 Distribution 组件内的坐标时，key 为数组
   */
  key?: Key[]
  err: VectorError
  value?: Vector
  x: number
  y: number
}

interface ValidVal {
  /**
   * 访问 Distribution 组件内的坐标时，key 为数组
   */
  key?: Key[]
  err?: VectorError
  value: Vector
  x: number
  y: number
}

export type UnionVal = InvalidVal | ValidVal

export function getVector(
  coordinates: Coordinates,
  x: number,
  y: number,
): UnionVal {
  const errVal: InvalidVal = { x, y, err: VECTOR_ERROR.NOT_X_AXIS }
  const yAxis = coordinates[y]
  if (!yAxis) {
    errVal.err = VECTOR_ERROR.NOT_Y_AXIS
    return errVal
  }
  const vector = yAxis[x]
  if (!vector) {
    errVal.err = VECTOR_ERROR.NOT_X_AXIS
    return errVal
  }
  if (vector.disabled) {
    errVal.err = VECTOR_ERROR.DISABLED
    return errVal
  }
  return { value: vector, x, y }
}

/**
 * 根据 x,y 坐标获取右侧的坐标
 * @param coordinates 所有坐标
 * @param x 当前的 x 坐标
 * @param y 当前的 y 坐标
 *
 * 返回当前坐标右侧的 Vector
 */
export function getRightVector(
  coordinates: Coordinates,
  x: number,
  y: number,
): UnionVal {
  const errVal: InvalidVal = { x, y, err: VECTOR_ERROR.NOT_X_AXIS }
  const xAxis = coordinates[y]
  if (!xAxis) {
    errVal.err = VECTOR_ERROR.NOT_Y_AXIS
    return errVal
  }
  if (x >= size(xAxis) - 1) {
    errVal.err = VECTOR_ERROR.X_MAXIMUM
    return errVal
  }
  const xIndex = x + 1
  const vector = xAxis[xIndex]
  if (!vector || vector.disabled) {
    return getRightVector(coordinates, xIndex, y)
  }
  return {
    value: vector,
    x: xIndex,
    y,
  }
}

/**
 * 根据 x,y 坐标获取左侧的坐标
 * @param coordinates 所有坐标
 * @param x 当前的 x 坐标
 * @param y 当前的 y 坐标
 *
 * 返回当前坐标左侧的 Vector
 */
export function getLeftVector(
  coordinates: Coordinates,
  x: number,
  y: number,
): UnionVal {
  const errVal: InvalidVal = { x, y, err: VECTOR_ERROR.NOT_X_AXIS }
  if (x <= 0) {
    errVal.err = VECTOR_ERROR.X_MINIMUM
    return errVal
  }
  const xAxis = coordinates[y]
  if (!xAxis) {
    errVal.err = VECTOR_ERROR.NOT_Y_AXIS
    return errVal
  }
  const xIndex = x - 1
  const vector = xAxis[xIndex]
  if (!vector || vector.disabled) {
    return getLeftVector(coordinates, xIndex, y)
  }
  return { value: vector, x: xIndex, y }
}

/**
 * 根据 x,y 坐标获取上方的坐标
 * @param coordinates 所有坐标
 * @param x 当前的 x 坐标
 * @param y 当前的 y 坐标
 *
 * 返回当前坐标上方的 Vector
 */
export function getTopVector(
  coordinates: Coordinates,
  x: number,
  y: number,
): UnionVal {
  const errVal: InvalidVal = { x, y, err: VECTOR_ERROR.NOT_X_AXIS }
  if (y <= 0) {
    errVal.err = VECTOR_ERROR.Y_MINIMUM
    return errVal
  }
  const yAxis = coordinates[y - 1]
  if (!yAxis) {
    return getTopVector(coordinates, x, y - 1)
  }
  const vector = yAxis[x]
  if (!vector || vector.disabled) {
    return getTopVector(coordinates, x, y - 1)
  }
  return { value: vector, x, y: y - 1 }
}

/**
 * 根据 x,y 坐标获取下方的坐标
 *
 * @param coordinates 所有坐标
 * @param x 当前的 x 坐标
 * @param y 当前的 y 坐标
 *
 * 返回当前坐标下方的 Vector
 */
export function getBottomVector(
  coordinates: Coordinates,
  x: number,
  y: number,
): UnionVal {
  const errVal: InvalidVal = { x, y, err: VECTOR_ERROR.NOT_X_AXIS }
  if (y >= size(coordinates) - 1) {
    errVal.err = VECTOR_ERROR.Y_MAXIMUM
    return errVal
  }
  const yIndex = y + 1
  const yAxis = coordinates[yIndex]
  if (!yAxis) {
    return getBottomVector(coordinates, x, yIndex)
  }
  // 目标坐标点
  const vector = yAxis[x]
  if (!vector || vector?.disabled) {
    return getBottomVector(coordinates, x, yIndex)
  }
  return { value: vector, x, y: yIndex }
}

/**
 * 获取 x 轴上第一个坐标，需要传入 y 坐标。
 *
 * 通俗解释：获取某一行第一个数据，y 就是第几行。
 */
export function getFirstVector(coordinates: Coordinates, y: number): UnionVal {
  const errVal: InvalidVal = { x: 0, y, err: VECTOR_ERROR.NOT_X_AXIS }
  const yAxis = coordinates[y]
  if (!yAxis) {
    errVal.err = VECTOR_ERROR.NOT_Y_AXIS
    return errVal
  }
  const vector = yAxis[0]
  if (!vector || vector?.disabled) {
    return getRightVector(coordinates, 0, y)
  }
  return { value: vector, x: 0, y }
}

/**
 * 获取 x 轴上最后一个坐标，需要传入 y 坐标。
 *
 * 通俗解释：获取某一行最后一个数据，y 就是第几行。
 */
export function getLastVector(coordinates: Coordinates, y: number) {
  const errVal: InvalidVal = { x: -1, y, err: VECTOR_ERROR.NOT_X_AXIS }
  const yAxis = coordinates[y]
  if (!yAxis) {
    errVal.err = VECTOR_ERROR.NOT_Y_AXIS
    return errVal
  }
  const xIndex = size(yAxis) - 1
  const vector = yAxis[xIndex]
  if (!vector || vector.disabled) {
    return getLeftVector(coordinates, xIndex, y)
  }
  return { value: vector, x: xIndex, y }
}

/**
 * 获取 y 轴第一个坐标，需要传入 x 坐标。
 *
 * 通俗解释：获取某一列第一个数据，x 就是第几列。
 */
export function getYFirstVector(coordinates: Coordinates, x: number) {
  const errVal: InvalidVal = { x, y: 0, err: VECTOR_ERROR.NOT_X_AXIS }
  const yAxis = coordinates[0]
  if (!yAxis) {
    errVal.err = VECTOR_ERROR.NOT_Y_AXIS
    return errVal
  }
  const vector = yAxis[x]
  if (!vector || vector?.disabled) {
    return getBottomVector(coordinates, x, 0)
  }
  return { value: vector, x, y: 0 }
}

/**
 * 获取 y 轴最后一个坐标，需要传入 x 坐标。
 *
 * 通俗解释：获取某一列最后一个数据，x 就是第几列。
 */
export function getYLastVector(coordinates: Coordinates, x: number) {
  const errVal: InvalidVal = { x, y: -1, err: VECTOR_ERROR.NOT_X_AXIS }
  const maxYIndex = size(coordinates) - 1
  if (maxYIndex < 0) {
    errVal.err = VECTOR_ERROR.NOT_Y_AXIS
    return errVal
  }
  const yAxis = coordinates[maxYIndex]
  if (!yAxis) {
    return getTopVector(coordinates, x, maxYIndex)
  }
  const vector = yAxis[x]
  if (!vector || vector.disabled) {
    return getTopVector(coordinates, x, maxYIndex)
  }
  return { value: vector, x, y: maxYIndex }
}

/**
 * 在 x 轴上使用 key 查找坐标。
 *
 * 需要访问 Distribution 组件内的坐标时，key 则使用数组传递。
 *
 * 通俗解释：使用 key 在第 y 行上查找坐标。
 */
export function getVectorByKeyOnXAxis(
  coordinates: Coordinates,
  y: number,
  key: Key | Key[],
): UnionVal {
  const keyArr = Array.isArray(key) ? key : [key]
  const errVal: InvalidVal = {
    key: keyArr,
    x: -1,
    y,
    err: VECTOR_ERROR.NOT_KEY,
  }
  const xAxis = coordinates[y]
  if (!xAxis) {
    errVal.err = VECTOR_ERROR.NOT_X_AXIS
    return errVal
  }
  const [headKey] = keyArr
  const xIndex = findIndex(xAxis, (item) => item?.focusKey === headKey)
  if (xIndex < 0) {
    errVal.err = VECTOR_ERROR.NOT_KEY
    return errVal
  }
  const vector = xAxis[xIndex] as Vector
  if (vector.disabled) {
    errVal.err = VECTOR_ERROR.DISABLED
    return errVal
  }
  return { value: xAxis[xIndex] as Vector, x: xIndex, y, key: keyArr }
}

/**
 * 在 y 轴上使用 key 查找坐标。
 *
 * 通俗解释：使用 key 在第 x 列上查找坐标。
 */
export function getVectorByKeyOnYAxis(
  coordinates: Coordinates,
  x: number,
  key: Key | Key[],
): UnionVal {
  const keyArr = Array.isArray(key) ? key : [key]
  const errVal: InvalidVal = {
    key: keyArr,
    x,
    y: -1,
    err: VECTOR_ERROR.NOT_KEY,
  }
  const [headKey] = keyArr
  for (let i = 0; i < coordinates.length; i += 1) {
    const xAxis = coordinates[i]
    const vector = get(xAxis, x)
    if (vector && vector.focusKey === headKey) {
      if (vector.disabled) {
        errVal.err = VECTOR_ERROR.DISABLED
        return errVal
      }
      return { value: vector, x, y: i, key: keyArr }
    }
  }
  return errVal
}
