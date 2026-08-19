import {Signal} from '@angular/core'

/**
 * Identifier of a step's position within a workflow.
 *
 * Kept as `string | number` so plain values as well as string or numeric enums can be used.
 */
export type Position = string | number

/** The signals a store carries on top of the rest once `providePositions` is enabled. */
export interface PositionSignals {
  /** Every position the workflow can reach, in config order and without duplicates. */
  positions: Signal<Position[]>
  /** Position of the current step, or `null` if that step's `meta` carries none. */
  currentPosition: Signal<Position | null>
  /** Index of `currentPosition` within `positions`, or `null` if there is no current position. */
  currentIndex: Signal<number | null>
  /** Number of positions the workflow can reach. */
  totalPositions: Signal<number>
}

