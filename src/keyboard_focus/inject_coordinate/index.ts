import { createContext, useContext } from 'react'

/**
 * string 为 json: [x: number, y: number]
 */
const InjectCoordinate = createContext<string>('[]')

InjectCoordinate.displayName = 'InjectCoordinate'

function useInjectCoordinate(x?: number, y?: number) {
  const [injectX, injectY] = JSON.parse(useContext(InjectCoordinate)) as [
    number | null, // x
    number | null, // y
  ]

  return [x ?? injectX, y ?? injectY] as const
}

export { InjectCoordinate, useInjectCoordinate }
