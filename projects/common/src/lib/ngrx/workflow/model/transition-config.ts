import {Transition} from './transition'
import {Position} from './position'

/** Configuration of a single step: the transitions leading away from it and optional data about the step itself. */
interface TransitionConfigWithMeta<T extends object, S extends string | number, M extends object> {
  transitions: Transition<T, S>[]
  meta?: M
}

/** Same as {@link TransitionConfigWithMeta}, but with a mandatory `meta` that carries the step's position. */
interface TransitionConfigWithPosition<T extends object, S extends string | number, M extends object> {
  transitions: Transition<T, S>[]
  meta: M & {position: Position}
}

export type TransitionConfig<
  T extends object,
  S extends string | number = string,
  M extends object = object
> = Record<S, TransitionConfigWithMeta<T, S, M>>

/**
 * A {@link TransitionConfig} in which every step declares a `meta.position`.
 *
 * Required by `workflowStoreFactory` when the `providePositions` option is enabled, since the position
 * signals of the store can only resolve if every step knows where it sits in the workflow.
 */
export type PositionedTransitionConfig<
  T extends object,
  S extends string | number = string,
  M extends object = object
> = Record<S, TransitionConfigWithPosition<T, S, M>>
