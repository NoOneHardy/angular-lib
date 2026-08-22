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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  canActivate: (data: Partial<T>) => any
  default?: never
}
interface DefaultTransition {
  canActivate?: never
  default: true
}
type TransitionCondition<T extends object> = GuardedTransition<T> | DefaultTransition

export type Transition<T extends object, S extends string | number> = TransitionTarget<S> & TransitionCondition<T>
