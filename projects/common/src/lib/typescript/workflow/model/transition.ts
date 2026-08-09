interface StepTarget<T extends string | number> {
  step: T
  finish?: never
}
interface FinishTarget {
  finish: true
  step?: never
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

export type Transition<T extends object, U extends string | number> = TransitionTarget<U> & TransitionCondition<T>
