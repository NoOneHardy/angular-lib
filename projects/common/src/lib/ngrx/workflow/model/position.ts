import {Signal} from '@angular/core'

/**
 * Identifier of a step's position within a workflow.
 *
 * Kept as `number` so plain values as well as numeric enums can be used.
 * Only numbers are supported in order to keep an ordered structure.
 */
export type Position = number

/** The signals a store carries on top of the rest once `providePositions` is enabled. */
export interface PositionSignals {
  /** Every position the workflow can reach, in ascending order and without duplicates. */
  positions: Signal<Position[]>
  /** Position of the current step, or `null` if that step's `meta` carries none. */
  currentPosition: Signal<Position | null>
  /** Index of `currentPosition` within `positions`, or `null` if there is no current position. */
  currentIndex: Signal<number | null>
  /** Number of positions the workflow can reach. */
  totalPositions: Signal<number>
}

