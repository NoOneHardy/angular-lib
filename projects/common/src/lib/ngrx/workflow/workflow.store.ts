import {patchState, signalStore, withComputed, withMethods, withState} from '@ngrx/signals'
import {computed, inject, InjectionToken} from '@angular/core'
import {TRANSITION_CONFIG, TransitionConfig} from './model/transition-config'
import {Transition} from './model/transition'

export function workflowStoreFactory<T extends object, U extends string | number = string>(initialStep: U, initialData: Partial<T> = {}) {
  interface WorkflowState {
    data: Partial<T>
    currentStep: U
    direction: 'forward' | 'backward'
    path: U[]
    error: string | null
    isFinished: boolean
  }

  const initialState: WorkflowState = {
    data: initialData,
    currentStep: initialStep,
    direction: 'forward',
    path: [],
    error: null,
    isFinished: false
  }

  return signalStore(
    withState(initialState),
    withComputed((state) => ({
      hasError: computed(() => state.error() !== null)
    })),
    withMethods((state) => {
      const transitionConfig: TransitionConfig<T, U> = inject(TRANSITION_CONFIG)

      return {
        next(data?: Partial<T>): void {
          const currentStep = state.currentStep()
          if (currentStep === undefined || currentStep === null) return this.setError('No current step found')
          if (data) patchState(state, {data: {...state.data(), ...data}})

          const transitions = transitionConfig[currentStep]
          const transition = transitions ? getTransition(state.data(), transitions) : null

          if (transition === null) return this.setError('No transition found')

          const transitionTarget = transition.target !== undefined ? {currentStep: transition.target} : {isFinished: true}
          patchState(state, {
            ...transitionTarget,
            direction: 'forward',
            path: [...state.path(), currentStep],
            error: null
          })
        },
        back(...keys: (keyof Partial<T>)[]): void {
          const path = state.path()
          if (path.length === 0) return
          const target = path[path.length - 1]

          const resetData = Object.fromEntries(keys.map(key => [key, undefined]))

          patchState(state, {
            data: {
              ...state.data(),
              ...resetData
            },
            currentStep: target,
            direction: 'backward',
            path: path.slice(0, -1),
            error: null
          })
        },
        setError(error: string): void {
          patchState(state, {error})
        }
      }
    })
  )

  function getTransition<T extends object, U extends string | number>(data: Partial<T>, transitions: Transition<T, U>[]): Transition<T, U> | null {
    const guardedTransition = transitions.find(t => t.canActivate ? t.canActivate(data) : false)
    if (guardedTransition !== undefined) return guardedTransition
    return transitions.find(t => t.default) ?? null
  }
}

export type WorkflowStore<T extends object, U extends | string | number = string> = InstanceType<ReturnType<typeof workflowStoreFactory<T, U>>>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const workflowStore = new InjectionToken<WorkflowStore<any, any>>('An instance of the workflow store')
