import {Component, inject} from '@angular/core'
import {WorkflowStore, workflowStore, workflowStoreFactory} from '../../src/lib/ngrx/workflow/workflow.store'
import {TransitionConfig} from '../../src/lib/ngrx/workflow/model/transition-config'
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

export type DemoOnboardingWorkflowStore = WorkflowStore<OnboardingData, OnboardingStep>

export const onboardingTransitions: TransitionConfig<OnboardingData, OnboardingStep> = {
  [OnboardingStep.ACCOUNT]: [
    {target: OnboardingStep.PROFILE, default: true}
  ],
  [OnboardingStep.PROFILE]: [
    {target: OnboardingStep.PREFERENCES, canActivate: data => data.age && data.age >= 18 || false},
    {target: OnboardingStep.GUARDIAN_CONSENT, default: true}
  ],
  [OnboardingStep.GUARDIAN_CONSENT]: [
    {target: OnboardingStep.PREFERENCES, default: true}
  ],
  [OnboardingStep.PREFERENCES]: [
    {finish: true, default: true}
  ]
}

@Component({
  selector: 'n1h-workflow-demo',
  providers: [
    {provide: workflowStore, useClass: workflowStoreFactory<OnboardingData, OnboardingStep>(onboardingTransitions, OnboardingStep.ACCOUNT)},
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
  protected readonly store: DemoOnboardingWorkflowStore = inject(workflowStore)
  protected readonly OnboardingStep = OnboardingStep
}
