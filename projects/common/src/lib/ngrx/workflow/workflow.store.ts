import {patchState, signalStore, withComputed, withMethods, withState} from '@ngrx/signals'
import {computed, InjectionToken} from '@angular/core'
import {PositionedTransitionConfig, TransitionConfig} from './model/transition-config'
import {Transition} from './model/transition'
import {WorkflowOptions} from './model/workflow-options'
import {Position} from './model/position'

/** Options of a workflow that tracks step positions. */
type PositionedWorkflowOptions<T extends object> = Partial<WorkflowOptions<T>> & {providePositions: true}

/** Options of a workflow that doesn't track step positions. */
type PlainWorkflowOptions<T extends object> = Partial<WorkflowOptions<T>> & {providePositions?: false}

/**
 * Builds a workflow store class that tracks step positions.
 *
 * Requires a {@link PositionedTransitionConfig} — with `providePositions` enabled, every step has to
 * declare a `meta.position` for the position signals of the store to resolve.
 */
export function workflowStoreFactory<T extends object, U extends string | number = string, M extends object = object>(
  transitionConfig: PositionedTransitionConfig<T, U, M>,
  initialStep: U,
  options: PositionedWorkflowOptions<T>
): WorkflowStoreClass<T, U, M>
/**
 * Builds a workflow store class without position tracking.
 *
 * Step `meta` stays optional, and the position signals of the store all resolve to `null`.
 */
export function workflowStoreFactory<T extends object, U extends string | number = string, M extends object = object>(
  transitionConfig: TransitionConfig<T, U, M>,
  initialStep: U,
  options?: PlainWorkflowOptions<T>
): WorkflowStoreClass<T, U, M>
export function workflowStoreFactory<T extends object, U extends string | number = string, M extends object = object>(
  transitionConfig: TransitionConfig<T, U, M>,
  initialStep: U,
  options: Partial<WorkflowOptions<T>> = {}
): WorkflowStoreClass<T, U, M> {
  return createWorkflowStore<T, U, M>(transitionConfig, initialStep, options)
}

/**
 * Builds the store class itself.
 *
 * Only called by {@link workflowStoreFactory}, which adds the `providePositions`-aware typing on top.
 */
export function createWorkflowStore<T extends object, U extends string | number, M extends object>(
  transitionConfig: TransitionConfig<T, U, M>,
  initialStep: U,
  options: Partial<WorkflowOptions<T>>
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

  /** Every position the config declares, or `null` while `providePositions` is off. */
  const positions: Position[] | null = options.providePositions ? collectPositions() : null

  return signalStore(
    withState(initialState),
    withComputed((state) => {
      /** Position of the current step, or `null` while `providePositions` is off. */
      const currentPosition = computed(() => positions === null ? null : positionOf(state.currentMeta()))

      return {
        hasError: computed(() => state.error() !== null),
        canGoBack: computed(() => state.path().length > 0),
        /** Every position the workflow can reach, or `null` while `providePositions` is off. */
        positions: computed(() => positions),
        currentPosition,
        /** Index of {@link currentPosition} within {@link positions}, or `null` while `providePositions` is off. */
        currentIndex: computed(() => {
          const position = currentPosition()
          return positions === null || position === null ? null : positions.indexOf(position)
        }),
        /** Number of positions the workflow can reach, or `null` while `providePositions` is off. */
        totalPositions: computed(() => positions?.length ?? null)
      }
    }),
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

  /** Collects the position of every step, keeping the config order and dropping duplicates. */
  function collectPositions(): Position[] {
    const steps: TransitionConfig<T, U, M>[U][] = Object.values(transitionConfig)
    const stepPositions = steps.map(step => positionOf(step.meta))
      .filter(position => position !== null)
    return [...new Set(stepPositions)].sort((a, b) => a - b)
  }

  /**
   * Reads the position off a step's `meta`.
   *
   * `M` itself doesn't have to declare a `position` — the {@link PositionedTransitionConfig} overload of
   * {@link workflowStoreFactory} is what guarantees one, so it is read back defensively here.
   */
  function positionOf(meta: M | null | undefined): Position | null {
    return (meta as {position?: Position} | null | undefined)?.position ?? null
  }
}

/** The store class {@link workflowStoreFactory} builds. */
export type WorkflowStoreClass<T extends object, U extends string | number = string, M extends object = object> = ReturnType<typeof createWorkflowStore<T, U, M>>
export type WorkflowStore<T extends object, U extends | string | number = string, M extends object = object> = InstanceType<WorkflowStoreClass<T, U, M>>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const workflowStore = new InjectionToken<WorkflowStore<any, any, any>>('An instance of the workflow store')
