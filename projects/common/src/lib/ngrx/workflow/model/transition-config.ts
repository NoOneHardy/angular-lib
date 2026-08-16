import {Transition} from './transition'

export type TransitionConfig<T extends object, U extends string | number = string> = Record<U, Transition<T, U>[]>
