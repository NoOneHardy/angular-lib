import {TestBed} from '@angular/core/testing'
import {WorkflowStore, workflowStore, workflowStoreFactory} from './workflow.store'
import {TRANSITION_CONFIG, TransitionConfig} from './model/transition-config'

interface WizardData {
  name?: string
  age?: number
  isMinorAgreementConfirmed?: boolean
}

enum Step {
  START = 'START',
  MINOR_CONFIRMATION = 'MINOR_CONFIRMATION',
  MIDDLE = 'MIDDLE',
  END = 'END'
}

const defaultConfig: TransitionConfig<WizardData, Step> = {
  [Step.START]: [
    {target: Step.MIDDLE, default: true},
    {target: Step.MINOR_CONFIRMATION, canActivate: (data) => data.age && data.age < 18 || false},
  ],
  [Step.MINOR_CONFIRMATION]: [
    {finish: true, default: true},
    {target: Step.MIDDLE, canActivate: (data) => !!data.isMinorAgreementConfirmed},
  ],
  [Step.MIDDLE]: [
    {target: Step.END, default: true},
  ],
  [Step.END]: [
    {finish: true, default: true}
  ]
}

function configureStore(
  config: Partial<TransitionConfig<WizardData, Step>> = defaultConfig,
  initialStep: Step = Step.START,
  initialData: Partial<WizardData> = {}
) {
  return TestBed.configureTestingModule({
    providers: [
      {
        provide: workflowStore,
        useClass: workflowStoreFactory<WizardData, Step>(initialStep, initialData)
      },
      {provide: TRANSITION_CONFIG, useValue: config}
    ]
  }).inject<WorkflowStore<WizardData, Step>>(workflowStore)
}

describe('workflowStoreFactory', () => {
  it('should start with the given initial step and empty defaults', () => {
    const store = configureStore()

    expect(store.currentStep()).toBe(Step.START)
    expect(store.data()).toEqual({})
    expect(store.direction()).toBe('forward')
    expect(store.path()).toEqual([])
    expect(store.error()).toBeNull()
    expect(store.isFinished()).toBe(false)
    expect(store.hasError()).toBe(false)
  })

  it('should start with the given initial data', () => {
    const store = configureStore(defaultConfig, Step.START, {
      name: 'Michael Scott'
    })

    expect(store.currentStep()).toBe(Step.START)
    expect(store.data()).toEqual({name: 'Michael Scott'})
  })

  describe('next', () => {
    it('should merge provided data into existing data', () => {
      const store = configureStore(defaultConfig, Step.START, {
        age: 32
      })

      store.next({name: 'Tony Stark'})

      expect(store.data()).toEqual({name: 'Tony Stark', age: 32})
    })

    it('should not touch data when called without an argument', () => {
      const store = configureStore(defaultConfig, Step.START, {
        age: 32
      })

      store.next()

      expect(store.data()).toEqual({age: 32})
    })

    it('should preserve previously set fields when merging new data', () => {
      const store = configureStore()

      store.next({name: 'Tony Stark'})
      store.next({age: 30})

      expect(store.data()).toEqual({name: 'Tony Stark', age: 30})
    })

    it('should move to the target step of a matching default transition', () => {
      const store = configureStore()

      store.next()

      expect(store.currentStep()).toBe(Step.MIDDLE)
      expect(store.direction()).toBe('forward')
      expect(store.error()).toBeNull()
    })

    it('should prefer a guarded transition over the default when it matches', () => {
      const store = configureStore()

      store.next({age: 12})

      expect(store.currentStep()).toBe(Step.MINOR_CONFIRMATION)
    })

    it('should fall back to the default transition when no guard matches', () => {
      const store = configureStore()

      store.next({age: 19})

      expect(store.currentStep()).toBe(Step.MIDDLE)
    })

    it('should pick the first matching guarded transition when multiple match', () => {
      const store = configureStore({
        [Step.START]: [
          {target: Step.MIDDLE, canActivate: () => true},
          {target: Step.END, canActivate: () => true}
        ]
      })

      store.next()

      expect(store.currentStep()).toBe(Step.MIDDLE)
    })

    it('should set an error when no guard matches and there is no default', () => {
      const store = configureStore({
        [Step.START]: [{target: Step.MIDDLE, canActivate: () => false}]
      })

      store.next()

      expect(store.error()).toBe('No transition found')
      expect(store.hasError()).toBe(true)
      expect(store.currentStep()).toBe(Step.START)
    })

    it('should set an error when the transitions list for the current step is empty', () => {
      const store = configureStore({[Step.START]: []})

      store.next()

      expect(store.error()).toBe('No transition found')
      expect(store.currentStep()).toBe(Step.START)
    })

    it('should set an error when transitions don\'t include the current step', () => {
      const store = configureStore({[Step.START]: []}, Step.MIDDLE)

      store.next()

      expect(store.error()).toBe('No transition found')
      expect(store.currentStep()).toBe(Step.MIDDLE)
    })

    it('should mark the workflow finished when the matching transition has no step', () => {
      const store = configureStore({[Step.START]: [{finish: true, default: true}]})

      store.next()

      expect(store.isFinished()).toBe(true)
      expect(store.currentStep()).toBe(Step.START)
      expect(store.error()).toBeNull()
    })

    it('should not reset isFinished on a later successful transition', () => {
      const store = configureStore({[Step.START]: [{finish: true, default: true}]})

      store.next()
      store.next()

      expect(store.isFinished()).toBe(true)
    })

    it('should treat an empty-string step as a valid, distinct step', () => {
      const store = configureStore(
        {'': [{target: Step.MIDDLE, default: true}]} as unknown as Partial<TransitionConfig<WizardData, Step>>,
        '' as Step
      )

      store.next({name: 'Tony Stark'})

      expect(store.error()).toBeNull()
      expect(store.currentStep()).toBe(Step.MIDDLE)
      expect(store.data()).toEqual({name: 'Tony Stark'})
    })

    it('should treat a numeric step of 0 as a valid current step', () => {
      const NumericStore = workflowStoreFactory<WizardData, number>(0)
      TestBed.resetTestingModule()
      TestBed.configureTestingModule({
        providers: [
          NumericStore,
          {provide: TRANSITION_CONFIG, useValue: {0: [{target: 1, default: true}]}}
        ]
      })
      const store = TestBed.inject(NumericStore)

      store.next()

      expect(store.error()).toBeNull()
      expect(store.currentStep()).toBe(1)
    })

    it('should treat a numeric target step of 0 as a valid destination', () => {
      TestBed.configureTestingModule({
        providers: [
          {provide: workflowStore, useClass: workflowStoreFactory<WizardData, number>(1)},
          {provide: TRANSITION_CONFIG, useValue: {1: [{target: 0, default: true}]}}
        ]
      })
      const store = TestBed.inject(workflowStore)

      store.next()

      expect(store.isFinished()).toBe(false)
      expect(store.currentStep()).toBe(0)
    })

    it('should set an error instead of throwing when the transition config has no entry for the current step', () => {
      const store = configureStore({} as TransitionConfig<WizardData, Step>)

      expect(() => store.next()).not.toThrow()
      expect(store.error()).toBe('No transition found')
    })

    it('should clear a previously set error on a later successful transition', () => {
      const store = configureStore({
        [Step.START]: [{target: Step.MIDDLE, canActivate: (data: WizardData) => !!data.name}]
      })

      store.next()
      expect(store.error()).toBe('No transition found')

      store.next({name: 'Tony Stark'})

      expect(store.error()).toBeNull()
      expect(store.hasError()).toBe(false)
      expect(store.currentStep()).toBe(Step.MIDDLE)
    })

    it('should clear a previously set error when the workflow finishes', () => {
      const store = configureStore({
        [Step.START]: [{finish: true, canActivate: (data: WizardData) => !!data.name}]
      })

      store.next()
      expect(store.error()).toBe('No transition found')

      store.next({name: 'Tony Stark'})

      expect(store.isFinished()).toBe(true)
      expect(store.error()).toBeNull()
    })

    it('should push the current step onto path on every forward transition', () => {
      const store = configureStore()

      store.next()
      expect(store.path()).toEqual([Step.START])

      store.next()
      expect(store.path()).toEqual([Step.START, Step.MIDDLE])
    })

    it('should push onto path when a transition finishes the workflow', () => {
      const store = configureStore({[Step.START]: [{finish: true, default: true}]})

      store.next()

      expect(store.path()).toEqual([Step.START])
    })

    it('should not push onto path when the transition errors', () => {
      const store = configureStore({[Step.START]: [{target: Step.MIDDLE, canActivate: () => false}]})

      store.next()

      expect(store.path()).toEqual([])
    })
  })

  describe('back', () => {
    it('should fail silently when called before any forward transition', () => {
      const store = configureStore()

      store.back('name')

      expect(store.error()).toBeNull()
      expect(store.hasError()).toBe(false)
      expect(store.currentStep()).toBe(Step.START)
    })

    it('should return to the previous step recorded by next()', () => {
      const store = configureStore()

      store.next()
      store.next()
      store.back()

      expect(store.currentStep()).toBe(Step.MIDDLE)
      expect(store.direction()).toBe('backward')
      expect(store.path()).toEqual([Step.START])
      expect(store.error()).toBeNull()
    })

    it('should walk all the way back through a multi-step path', () => {
      const store = configureStore()

      store.next()
      store.next()
      store.back()
      store.back()

      expect(store.currentStep()).toBe(Step.START)
      expect(store.path()).toEqual([])
    })

    it('should fail silently once the path is exhausted', () => {
      const store = configureStore()

      store.next()
      store.back()
      store.back()

      expect(store.error()).toBeNull()
      expect(store.currentStep()).toBe(Step.START)
    })

    it('should reset the given keys to undefined on the merged data', () => {
      const store = configureStore()

      store.next({name: 'Tony Stark', age: 30})
      store.back('age')

      expect(store.data()).toEqual({name: 'Tony Stark', age: undefined})
    })

    it('should leave data untouched when called without keys', () => {
      const store = configureStore()

      store.next({name: 'Tony Stark'})
      store.back()

      expect(store.data()).toEqual({name: 'Tony Stark'})
    })

    it('should clear a previously set error on a successful step back', () => {
      const store = configureStore({
        [Step.START]: [{target: Step.MIDDLE, default: true}],
        [Step.MIDDLE]: [{target: Step.END, canActivate: () => false}]
      })

      store.next()
      store.next()
      expect(store.error()).toBe('No transition found')

      store.back()

      expect(store.error()).toBeNull()
    })
  })

  describe('setError', () => {
    it('should set the error message and flips hasError', () => {
      const store = configureStore()

      expect(store.hasError()).toBe(false)

      store.setError('boom')

      expect(store.error()).toBe('boom')
      expect(store.hasError()).toBe(true)
    })

    it('should treat an empty string error as well as error via hasError', () => {
      const store = configureStore()

      store.setError('')

      expect(store.error()).toBe('')
      expect(store.hasError()).toBe(true)
    })
  })

  describe('canGoBack', () => {
    it('should return false when path is empty', () => {
      const store = configureStore()

      expect(store.canGoBack()).toBe(false)
    })

    it('should return true when path contains a step', () => {
      const store = configureStore()

      store.next()
      expect(store.canGoBack()).toBe(true)
    })

    it('should return true when path contains multiple steps', () => {
      const store = configureStore()

      store.next()
      store.next()
      expect(store.canGoBack()).toBe(true)
      store.back()
      expect(store.canGoBack()).toBe(true)
    })

    it('should return false after walking back to the first step', () => {
      const store = configureStore()

      store.next()
      store.next()
      store.back()
      store.back()
      expect(store.canGoBack()).toBe(false)
    })
  })
})
