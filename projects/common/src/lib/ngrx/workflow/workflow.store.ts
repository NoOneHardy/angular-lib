import {patchState, signalStore, withComputed, withMethods, withState} from '@ngrx/signals'
import {computed, InjectionToken} from '@angular/core'
import {TransitionConfig} from './model/transition-config'
import {Transition} from './model/transition'
import {WorkflowOptions} from './model/workflow-options'

export function workflowStoreFactory<T extends object, U extends string | number = string, M extends object = object>(
  transitionConfig: TransitionConfig<T, U, M>,
  initialStep: U,
  options: Partial<WorkflowOptions<T>> = {}
) {
  interface WorkflowState {
    data: Partial<T>
    currentStep: U
    currentMeta: M | null
    direction: 'forward' | 'backward'
    path: U[]
    error: string | null
    isFinished: boolean
  }

  const initialState: WorkflowState = {
    data: options.initialData ?? {},
    currentStep: initialStep,
    currentMeta: transitionConfig[initialStep]?.meta ?? null,
    direction: 'forward',
    path: [],
    error: null,
    isFinished: false
  }

  return signalStore(
    withState(initialState),
    withComputed((state) => ({
      hasError: computed(() => state.error() !== null),
      canGoBack: computed(() => state.path().length > 0)
    })),
    withMethods((state) => {
      return {
        next(data?: Partial<T>): void {
          const currentStep = state.currentStep()
          if (currentStep === undefined || currentStep === null) return this.setError('No current step found')
          if (data) patchState(state, {data: {...state.data(), ...data}})

          const config = transitionConfig[currentStep]
          if (config === undefined) return this.setError('No transition config found for current step')

          const transitions = config.transitions
          const transition = transitions ? getTransition(state.data(), transitions) : null

          if (transition === null) return this.setError('No transition found')

          const transitionTarget = transition.target !== undefined ? {currentStep: transition.target} : {isFinished: true}
          patchState(state, {
            ...transitionTarget,
            direction: 'forward',
            path: [...state.path(), currentStep],
            error: null
          })
          patchState(state, {
            currentMeta: transitionConfig[state.currentStep()]?.meta ?? null
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
          patchState(state, {
            currentMeta: transitionConfig[state.currentStep()]?.meta ?? null
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

export type WorkflowStore<T extends object, U extends | string | number = string, M extends object = object> = InstanceType<ReturnType<typeof workflowStoreFactory<T, U, M>>>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const workflowStore = new InjectionToken<WorkflowStore<any, any>>('An instance of the workflow store')
