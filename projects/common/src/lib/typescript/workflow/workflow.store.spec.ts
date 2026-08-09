import {TestBed} from '@angular/core/testing'
import {workflowStoreFactory} from './workflow.store'
import {TRANSITION_CONFIG, TransitionConfig} from './model/transition-config'

interface WizardData {
  name?: string
  age?: number
}

type Step = 'start' | 'middle' | 'end'

function configure(config: Partial<TransitionConfig<WizardData, Step>>, initialStep: Step = 'start') {
  const Store = workflowStoreFactory<WizardData, Step>(initialStep)
  TestBed.configureTestingModule({
    providers: [
      Store,
      {provide: TRANSITION_CONFIG, useValue: config}
    ]
  })
  return TestBed.inject(Store)
}

describe('workflowStoreFactory', () => {
  it('starts with the given initial step and empty defaults', () => {
    const store = configure({start: [{step: 'middle', default: true}]})

    expect(store.currentStep()).toBe('start')
    expect(store.data()).toEqual({})
    expect(store.direction()).toBe('forward')
    expect(store.path()).toEqual([])
    expect(store.error()).toBeNull()
    expect(store.isFinished()).toBe(false)
    expect(store.hasError()).toBe(false)
  })

  describe('next', () => {
    it('merges provided data into existing data', () => {
      const store = configure({start: [{step: 'middle', default: true}]})

      store.next({name: 'Ada'})

      expect(store.data()).toEqual({name: 'Ada'})
    })

    it('does not touch data when called without an argument', () => {
      const store = configure({start: [{step: 'middle', default: true}]})

      store.next()

      expect(store.data()).toEqual({})
    })

    it('preserves previously set fields when merging new data', () => {
      const store = configure({
        start: [{step: 'middle', default: true}],
        middle: [{finish: true, default: true}]
      })

      store.next({name: 'Ada'})
      store.next({age: 30})

      expect(store.data()).toEqual({name: 'Ada', age: 30})
    })

    it('moves to the target step of a matching default transition', () => {
      const store = configure({start: [{step: 'middle', default: true}]})

      store.next()

      expect(store.currentStep()).toBe('middle')
      expect(store.direction()).toBe('forward')
      expect(store.error()).toBeNull()
    })

    it('prefers a guarded transition over the default when it matches', () => {
      const store = configure({
        start: [
          {step: 'end', canActivate: data => data.age !== undefined && data.age >= 18},
          {step: 'middle', default: true}
        ]
      })

      store.next({age: 21})

      expect(store.currentStep()).toBe('end')
    })

    it('falls back to the default transition when no guard matches', () => {
      const store = configure({
        start: [
          {step: 'end', canActivate: data => data.age !== undefined && data.age >= 18},
          {step: 'middle', default: true}
        ]
      })

      store.next({age: 5})

      expect(store.currentStep()).toBe('middle')
    })

    it('picks the first matching guarded transition when multiple match', () => {
      const store = configure({
        start: [
          {step: 'middle', canActivate: () => true},
          {step: 'end', canActivate: () => true}
        ]
      })

      store.next()

      expect(store.currentStep()).toBe('middle')
    })

    it('sets an error when no guard matches and there is no default', () => {
      const store = configure({
        start: [{step: 'middle', canActivate: () => false}]
      })

      store.next()

      expect(store.error()).toBe('No transition found')
      expect(store.hasError()).toBe(true)
      expect(store.currentStep()).toBe('start')
    })

    it('sets an error when the transitions list for the current step is empty', () => {
      const store = configure({start: []})

      store.next()

      expect(store.error()).toBe('No transition found')
      expect(store.currentStep()).toBe('start')
    })

    it('marks the workflow finished when the matching transition has no step', () => {
      const store = configure({start: [{finish: true, default: true}]})

      store.next()

      expect(store.isFinished()).toBe(true)
      expect(store.currentStep()).toBe('start')
      expect(store.error()).toBeNull()
    })

    it('does not reset isFinished on a later successful transition', () => {
      const store = configure({start: [{finish: true, default: true}]})

      store.next()
      store.next()

      expect(store.isFinished()).toBe(true)
    })

    it('treats an empty-string step as a valid, distinct step', () => {
      const store = configure(
        {'': [{step: 'middle', default: true}]} as unknown as Partial<TransitionConfig<WizardData, Step>>,
        '' as Step
      )

      store.next({name: 'Ada'})

      expect(store.error()).toBeNull()
      expect(store.currentStep()).toBe('middle')
      expect(store.data()).toEqual({name: 'Ada'})
    })

    it('treats a numeric step of 0 as a valid current step', () => {
      const NumericStore = workflowStoreFactory<WizardData, number>(0)
      TestBed.resetTestingModule()
      TestBed.configureTestingModule({
        providers: [
          NumericStore,
          {provide: TRANSITION_CONFIG, useValue: {0: [{step: 1, default: true}]}}
        ]
      })
      const store = TestBed.inject(NumericStore)

      store.next()

      expect(store.error()).toBeNull()
      expect(store.currentStep()).toBe(1)
    })

    it('treats a numeric target step of 0 as a valid destination', () => {
      const NumericStore = workflowStoreFactory<WizardData, number>(1)
      TestBed.resetTestingModule()
      TestBed.configureTestingModule({
        providers: [
          NumericStore,
          {provide: TRANSITION_CONFIG, useValue: {1: [{step: 0, default: true}]}}
        ]
      })
      const store = TestBed.inject(NumericStore)

      store.next()

      expect(store.isFinished()).toBe(false)
      expect(store.currentStep()).toBe(0)
    })

    it('sets an error instead of throwing when the transition config has no entry for the current step', () => {
      const store = configure({} as TransitionConfig<WizardData, Step>)

      expect(() => store.next()).not.toThrow()
      expect(store.error()).toBe('No transition found')
    })

    it('clears a previously set error on a later successful transition', () => {
      const store = configure({
        start: [{step: 'middle', canActivate: (data: WizardData) => !!data.name}]
      })

      store.next()
      expect(store.error()).toBe('No transition found')

      store.next({name: 'Ada'})

      expect(store.error()).toBeNull()
      expect(store.hasError()).toBe(false)
      expect(store.currentStep()).toBe('middle')
    })

    it('clears a previously set error when the workflow finishes', () => {
      const store = configure({
        start: [{finish: true, canActivate: (data: WizardData) => !!data.name}]
      })

      store.next()
      expect(store.error()).toBe('No transition found')

      store.next({name: 'Ada'})

      expect(store.isFinished()).toBe(true)
      expect(store.error()).toBeNull()
    })

    it('pushes the current step onto path on every forward transition', () => {
      const store = configure({
        start: [{step: 'middle', default: true}],
        middle: [{step: 'end', default: true}]
      })

      store.next()
      expect(store.path()).toEqual(['start'])

      store.next()
      expect(store.path()).toEqual(['start', 'middle'])
    })

    it('does not push onto path when a transition finishes the workflow', () => {
      const store = configure({start: [{finish: true, default: true}]})

      store.next()

      expect(store.path()).toEqual([])
    })

    it('does not push onto path when the transition errors', () => {
      const store = configure({start: [{step: 'middle', canActivate: () => false}]})

      store.next()

      expect(store.path()).toEqual([])
    })
  })

  describe('back', () => {
    it('sets an error when called before any forward transition', () => {
      const store = configure({start: [{step: 'middle', default: true}]})

      store.back('name')

      expect(store.error()).toBe('No previous step found')
      expect(store.hasError()).toBe(true)
      expect(store.currentStep()).toBe('start')
    })

    it('returns to the previous step recorded by next()', () => {
      const store = configure({
        start: [{step: 'middle', default: true}],
        middle: [{step: 'end', default: true}]
      })

      store.next()
      store.next()
      store.back()

      expect(store.currentStep()).toBe('middle')
      expect(store.direction()).toBe('backward')
      expect(store.path()).toEqual(['start'])
      expect(store.error()).toBeNull()
    })

    it('walks all the way back through a multi-step path', () => {
      const store = configure({
        start: [{step: 'middle', default: true}],
        middle: [{step: 'end', default: true}]
      })

      store.next()
      store.next()
      store.back()
      store.back()

      expect(store.currentStep()).toBe('start')
      expect(store.path()).toEqual([])
    })

    it('errors again once the path is exhausted', () => {
      const store = configure({start: [{step: 'middle', default: true}]})

      store.next()
      store.back()
      store.back()

      expect(store.error()).toBe('No previous step found')
      expect(store.currentStep()).toBe('start')
    })

    it('resets the given keys to undefined on the merged data', () => {
      const store = configure({start: [{step: 'middle', default: true}]})

      store.next({name: 'Ada', age: 30})
      store.back('age')

      expect(store.data()).toEqual({name: 'Ada', age: undefined})
    })

    it('leaves data untouched when called without keys', () => {
      const store = configure({start: [{step: 'middle', default: true}]})

      store.next({name: 'Ada'})
      store.back()

      expect(store.data()).toEqual({name: 'Ada'})
    })

    it('clears a previously set error on a successful step back', () => {
      const store = configure({
        start: [{step: 'middle', default: true}],
        middle: [{step: 'end', canActivate: () => false}]
      })

      store.next()
      store.next()
      expect(store.error()).toBe('No transition found')

      store.back()

      expect(store.error()).toBeNull()
    })
  })

  describe('setError', () => {
    it('sets the error message and flips hasError', () => {
      const store = configure({start: [{step: 'middle', default: true}]})

      expect(store.hasError()).toBe(false)

      store.setError('boom')

      expect(store.error()).toBe('boom')
      expect(store.hasError()).toBe(true)
    })

    it('treats an empty string error as no error via hasError', () => {
      const store = configure({start: [{step: 'middle', default: true}]})

      store.setError('')

      expect(store.error()).toBe('')
      expect(store.hasError()).toBe(false)
    })
  })
})
