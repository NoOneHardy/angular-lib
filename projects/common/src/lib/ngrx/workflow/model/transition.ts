interface StepTarget<T extends string | number> {
  target: T
  finish?: never
}
interface FinishTarget {
  finish: true
  target?: never
}
type TransitionTarget<T extends string | number> = StepTarget<T> | FinishTarget

interface GuardedTransition<T extends object> {
  canActivate: (data: Partial<T>) => boolean
  default?: never
}
interface DefaultTransition {
  canActivate?: never
  default: true
}
type TransitionCondition<T extends object> = GuardedTransition<T> | DefaultTransition

export type Transition<T extends object, S extends string | number> = TransitionTarget<S> & TransitionCondition<T>
