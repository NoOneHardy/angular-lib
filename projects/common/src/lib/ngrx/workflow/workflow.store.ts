import {patchState, signalStore, withComputed, withMethods, withState} from '@ngrx/signals'
import {computed, InjectionToken, Signal, Type} from '@angular/core'
import {PositionedTransitionConfig, TransitionConfig} from './model/transition-config'
import {Transition} from './model/transition'
import {WorkflowOptions} from './model/workflow-options'
import {Position} from './model/position'

/** Options of a workflow that tracks step positions. */
type PositionedWorkflowOptions<T extends object> = Partial<WorkflowOptions<T>> & { providePositions: true }

/** Options of a workflow that doesn't track step positions. */
type PlainWorkflowOptions<T extends object> = Partial<WorkflowOptions<T>> & { providePositions?: false }

/** The signals a store carries on top of the rest once `providePositions` is enabled. */
interface PositionSignals {
  /** Every position the workflow can reach, in config order and without duplicates. */
  positions: Signal<Position[]>
  /** Position of the current step, or `null` if that step's `meta` carries none. */
  currentPosition: Signal<Position | null>
  /** Index of `currentPosition` within `positions`, or `null` if there is no current position. */
  currentIndex: Signal<number | null>
  /** Number of positions the workflow can reach. */
  totalPositions: Signal<number>
}

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
): PositionedWorkflowStoreClass<T, U, M>
/**
 * Builds a workflow store class without position tracking.
 *
 * Step `meta` stays optional, and the store carries no position signals at all.
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
): PositionedWorkflowStoreClass<T, U, M> {
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
    withComputed((state) => ({
      hasError: computed(() => state.error() !== null),
      canGoBack: computed(() => state.path().length > 0),
      ...positionSignals(state)
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

  /**
   * Builds the position signals — an empty object while `providePositions` is off, so a store without
   * position tracking doesn't carry them at all. The return type declares them either way;
   * {@link workflowStoreFactory} is what takes them off the store type again for that case.
   */
  function positionSignals(state: { currentMeta: Signal<M | null> }): PositionSignals {
    if (positions === null) return {} as PositionSignals

    const currentPosition = computed(() => positionOf(state.currentMeta()))

    return {
      positions: computed(() => positions),
      currentPosition,
      currentIndex: computed(() => {
        const position = currentPosition()
        return position === null ? null : positions.indexOf(position)
      }),
      totalPositions: computed(() => positions.length)
    }
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
    return (meta as { position?: Position } | null | undefined)?.position ?? null
  }
}

/** The store class {@link workflowStoreFactory} builds with position tracking. */
export type PositionedWorkflowStoreClass<T extends object, U extends string | number = string, M extends object = object> = ReturnType<typeof createWorkflowStore<T, U, M>>
/** The store class {@link workflowStoreFactory} builds without position tracking. */
export type WorkflowStoreClass<T extends object, U extends string | number = string, M extends object = object> = Type<WorkflowStore<T, U, M>>

/** A workflow store that tracks step positions, built with the `providePositions` option. */
export type PositionedWorkflowStore<T extends object, U extends string | number = string, M extends object = object> = InstanceType<PositionedWorkflowStoreClass<T, U, M>>
/** A workflow store without position tracking — the position signals aren't part of it. */
export type WorkflowStore<T extends object, U extends | string | number = string, M extends object = object> = Omit<InstanceType<PositionedWorkflowStoreClass<T, U, M>>, keyof PositionSignals>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const workflowStore = new InjectionToken<WorkflowStore<any, any, any>>('An instance of the workflow store')
