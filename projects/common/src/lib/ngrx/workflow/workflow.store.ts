import {patchState, signalStore, withComputed, withMethods, withState} from '@ngrx/signals'
import {computed, InjectionToken, Signal, Type} from '@angular/core'
import {PositionedTransitionConfig, TransitionConfig} from './model/transition-config'
import {Transition} from './model/transition'
import {PlainWorkflowOptions, PositionedWorkflowOptions, WorkflowOptions} from './model/workflow-options'
import {Position, PositionSignals} from './model/position'
import {WorkflowStep} from './model/workflow-step'
import {WorkflowPath} from './model/workflow-path'

/**
 * Builds a workflow store class that tracks step positions.
 *
 * Requires a {@link PositionedTransitionConfig} — with `providePositions` enabled, every step has to
 * declare a `meta.position` for the position signals of the store to resolve.
 */
export function workflowStoreFactory<T extends object, S extends WorkflowStep = string, M extends object = object>(
  transitionConfig: PositionedTransitionConfig<T, S, M>,
  initialStep: S,
  options: PositionedWorkflowOptions<T>
): PositionedWorkflowStoreClass<T, S, M>
/**
 * Builds a workflow store class without position tracking.
 *
 * Step `meta` stays optional, and the store carries no position signals at all.
 */
export function workflowStoreFactory<T extends object, S extends WorkflowStep = string, M extends object = object>(
  transitionConfig: TransitionConfig<T, S, M>,
  initialStep: S,
  options?: PlainWorkflowOptions<T>
): WorkflowStoreClass<T, S, M>
export function workflowStoreFactory<T extends object, S extends WorkflowStep = string, M extends object = object>(
  transitionConfig: TransitionConfig<T, S, M>,
  initialStep: S,
  options: Partial<WorkflowOptions<T>> = {}
): PositionedWorkflowStoreClass<T, S, M> {
  return createWorkflowStore<T, S, M>(transitionConfig, initialStep, options)
}

/**
 * Builds the store class itself.
 *
 * Only called by {@link workflowStoreFactory}, which adds the `providePositions`-aware typing on top.
 */
export function createWorkflowStore<T extends object, S extends WorkflowStep, M extends object>(
  transitionConfig: TransitionConfig<T, S, M>,
  initialStep: S,
  options: Partial<WorkflowOptions<T>>
) {
  interface WorkflowState {
    data: Partial<T>
    currentStep: S
    currentMeta: M | null
    direction: 'forward' | 'backward'
    path: WorkflowPath<T, S, M>
    error: string | null
    isFinished: boolean
    isSkipping: boolean
  }

  const initialState: WorkflowState = {
    data: options.initialData ?? {},
    currentStep: initialStep,
    currentMeta: transitionConfig[initialStep]?.meta ?? null,
    direction: 'forward',
    path: [],
    error: null,
    isFinished: false,
    isSkipping: false
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
          if (state.isFinished()) return

          const currentStep = state.currentStep()
          if (currentStep === undefined || currentStep === null) return this.setError('No current step found')

          if (data) patchState(state, {data: {...state.data(), ...data}})

          // Collect the current state for path
          const currentMeta = state.currentMeta()
          const currentData = state.data()

          const config = transitionConfig[currentStep]
          if (config === undefined) return this.setError('No transition config found for current step')

          if (!config.skippable && state.isSkipping()) return patchState(state, {isSkipping: false})

          const transitions = config.transitions
          const transition = transitions ? getTransition(state.data(), transitions) : null

          if (transition === null) return this.setError('No transition found')

          const transitionTarget = transition.target !== undefined ? {currentStep: transition.target} : {isFinished: true}
          patchState(state, {
            ...transitionTarget,
            direction: 'forward',
            path: [
              ...state.path(),
              {
                step: currentStep,
                data: currentData,
                meta: currentMeta
              }
            ],
            error: null
          })

          const newMeta = transitionConfig[state.currentStep()]?.meta ?? null
          const metaOverride = transition.meta ?? {}
          patchState(state, {
            currentMeta: newMeta ? {...newMeta, ...metaOverride} : null
          })

          if (state.isSkipping()) this.next()
        },
        back(): void {
          patchState(state, {isFinished: false})

          const path = state.path()
          if (path.length === 0) return
          const target = path[path.length - 1]

          patchState(state, {
            currentStep: target.step,
            currentMeta: target.meta,
            direction: 'backward',
            path: path.slice(0, -1),
            error: null
          })

          if (!options.preserveDataOnBack) patchState(state, {data: target.data})
        },
        skip(data?: Partial<T>): void {
          patchState(state, {isSkipping: true})
          this.next(data)
        },
        setError(error: string): void {
          patchState(state, {error})
        }
      }
    })
  )

  function getTransition(data: Partial<T>, transitions: Transition<T, S, M>[]): Transition<T, S, M> | null {
    const guardedTransition = transitions.find(t => t.canActivate ? !!t.canActivate(data) : false)
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
        return position === null ? null : positions.findIndex(p => p.order === position.order)
      }),
      totalPositions: computed(() => positions.length)
    }
  }

  /** Collects the position of every step in ascending order, dropping duplicates. */
  function collectPositions(): Position[] {
    const steps: TransitionConfig<T, S, M>[S][] = Object.values(transitionConfig)
    const posEntries = steps.map(s => positionOf(s.meta)).filter(p => p !== null)
    const posMap = Object.fromEntries(posEntries.map(p => [p.order, p.label]))
    return [...new Set(posEntries.map(p => p.order))]
      .sort((a, b) => a - b)
      .map(order => ({order, label: posMap[order]}))
  }

  /**
   * Reads the position off a step's `meta`.
   *
   * `M` itself doesn't have to declare a `position` — the {@link PositionedTransitionConfig} overload of
   * {@link workflowStoreFactory} is what guarantees one, so it is read back defensively here.
   */
  function positionOf(meta: M | null | undefined): Position | null {
    const position = (meta as { position?: Position | number } | null | undefined)?.position
    if (position === undefined || position === null) return null
    if (typeof position === 'number') return {order: position, label: ''}
    return position
  }
}

/** The store class {@link workflowStoreFactory} builds with position tracking. */
export type PositionedWorkflowStoreClass<T extends object, S extends WorkflowStep = string, M extends object = object> = ReturnType<typeof createWorkflowStore<T, S, M>>
/** The store class {@link workflowStoreFactory} builds without position tracking. */
export type WorkflowStoreClass<T extends object, S extends WorkflowStep = string, M extends object = object> = Type<WorkflowStore<T, S, M>>

/** A workflow store that tracks step positions, built with the `providePositions` option. */
export type PositionedWorkflowStore<T extends object, S extends WorkflowStep = string, M extends object = object> = InstanceType<PositionedWorkflowStoreClass<T, S, M>>
/** A workflow store without position tracking — the position signals aren't part of it. */
export type WorkflowStore<T extends object, S extends | string | number = string, M extends object = object> = Omit<InstanceType<PositionedWorkflowStoreClass<T, S, M>>, keyof PositionSignals>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const workflowStore = new InjectionToken<WorkflowStore<any, any, any>>('An instance of the workflow store')
