import {Transition} from './transition'

interface TransitionConfigWithMeta<T extends object, U extends string | number, M extends object> {
  transitions: Transition<T, U>[]
  meta?: M
}
export type TransitionConfig<
  T extends object,
  U extends string | number = string,
  M extends object = object
> = Record<U, TransitionConfigWithMeta<T, U, M>>
