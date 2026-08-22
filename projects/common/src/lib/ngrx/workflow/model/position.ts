import {Signal} from '@angular/core'

/**
 * Data structure identifying a step's position within a workflow.
 *
 * The `label` is a human-readable label for the step, and the `order` is a number that determines the step's position relative to other steps.
 * Steps with lower `order` values come before steps with higher `order` values. Steps with the same `order` value are considered to be at the same position.
 *
 * The `Position` type is used in the workflow store to track the current step's position and to provide a list of all positions in the workflow.
 * It is also used in the `PositionSignals` interface to provide signals for the current position, index, and total number of positions.
 */
export interface Position {
  label: string
  order: number
}

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

