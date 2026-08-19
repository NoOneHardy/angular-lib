import {Component, inject} from '@angular/core'
import {PositionedWorkflowStore, workflowStore, workflowStoreFactory} from '../../src/lib/ngrx/workflow/workflow.store'
import {PositionedTransitionConfig} from '../../src/lib/ngrx/workflow/model/transition-config'
import {WorkflowDemoAccountComponent} from './components/workflow-demo-account/workflow-demo-account.component'
import {FormsModule} from '@angular/forms'
import {JsonPipe} from '@angular/common'
import {WorkflowDemoProfileComponent} from './components/workflow-demo-profile/workflow-demo-profile.component'
import {WorkflowDemoGuardianComponent} from './components/workflow-demo-guardian/workflow-demo-guardian.component'
import {
  WorkflowDemoPreferencesComponent
} from './components/workflow-demo-preferences/workflow-demo-preferences.component'

export interface OnboardingData {
  email: string
  age: number
  guardianEmail: string
  newsletter: boolean
}

export enum OnboardingStep {
  ACCOUNT = 'ACCOUNT',
  PROFILE = 'PROFILE',
  GUARDIAN_CONSENT = 'GUARDIAN_CONSENT',
  PREFERENCES = 'PREFERENCES'
}

export interface OnboardingStepMeta {
  title: string
  position: number
}

export type DemoOnboardingWorkflowStore = PositionedWorkflowStore<OnboardingData, OnboardingStep, OnboardingStepMeta>

export const onboardingTransitions: PositionedTransitionConfig<OnboardingData, OnboardingStep, OnboardingStepMeta> = {
  [OnboardingStep.ACCOUNT]: {
    meta: {title: 'Account', position: 1},
    transitions: [
      {target: OnboardingStep.PROFILE, default: true}
    ]
  },
  [OnboardingStep.PROFILE]: {
    meta: {title: 'Profile', position: 2},
    transitions: [
      {target: OnboardingStep.PREFERENCES, canActivate: data => data.age && data.age >= 18 || false},
      {target: OnboardingStep.GUARDIAN_CONSENT, default: true}
    ]
  },
  [OnboardingStep.GUARDIAN_CONSENT]: {
    meta: {title: 'Guardian', position: 2},
    transitions: [
      {target: OnboardingStep.PREFERENCES, default: true}
    ]
  },
  [OnboardingStep.PREFERENCES]: {
    meta: {title: 'Preferences', position: 3},
    transitions: [
      {finish: true, default: true}
    ]
  }
}

@Component({
  selector: 'n1h-workflow-demo',
  providers: [
    {
      provide: workflowStore,
      useClass: workflowStoreFactory<OnboardingData, OnboardingStep, OnboardingStepMeta>(
        onboardingTransitions,
        OnboardingStep.ACCOUNT,
        {providePositions: true}
      )
    },
  ],
  imports: [
    WorkflowDemoAccountComponent,
    FormsModule,
    JsonPipe,
    WorkflowDemoProfileComponent,
    WorkflowDemoGuardianComponent,
    WorkflowDemoPreferencesComponent
  ],
  templateUrl: './workflow-demo.component.html',
  styleUrl: './workflow-demo.shared.scss'
})
export class WorkflowDemoComponent {
  protected readonly store = inject<DemoOnboardingWorkflowStore>(workflowStore)
  protected readonly OnboardingStep = OnboardingStep
}
