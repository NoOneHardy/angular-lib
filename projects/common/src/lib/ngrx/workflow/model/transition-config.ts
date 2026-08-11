import {InjectionToken} from '@angular/core'
import {Transition} from './transition'

export type TransitionConfig<T extends object, U extends string | number = string> = Record<U, Transition<T, U>[]>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const TRANSITION_CONFIG = new InjectionToken<TransitionConfig<any, any>>('TransitionConfig')
