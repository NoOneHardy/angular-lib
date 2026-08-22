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
import {MatStep, MatStepper} from '@angular/material/stepper'
import {BlockStepperClicksDirective} from './directives/block-stepper-clicks.directive'
import {WorkflowDemoWelcomeComponent} from './components/workflow-demo-welcome/workflow-demo-welcome.component'
import {WorkflowDemoFeaturesComponent} from './components/workflow-demo-features/workflow-demo-features.component'

export interface OnboardingData {
  email: string
  age: number
  guardianEmail: string
  newsletter: boolean
}

export enum OnboardingStep {
  WELCOME = 'WELCOME',
  FEATURES = 'FEATURES',
  ACCOUNT = 'ACCOUNT',
  PROFILE = 'PROFILE',
  GUARDIAN_CONSENT = 'GUARDIAN_CONSENT',
  PREFERENCES = 'PREFERENCES'
}

export interface OnboardingStepMeta {
  title: string
}

export type DemoOnboardingWorkflowStore = PositionedWorkflowStore<OnboardingData, OnboardingStep, OnboardingStepMeta>

export const onboardingTransitions: PositionedTransitionConfig<OnboardingData, OnboardingStep, OnboardingStepMeta> = {
  [OnboardingStep.WELCOME]: {
    meta: {
      title: 'Welcome',
      position: {
        order: 0,
        label: 'Welcome'
      }
    },
    // lets a visitor who already knows the product skip straight past both intro screens to the login/account step
    skippable: true,
    transitions: [
      {target: OnboardingStep.FEATURES, default: true}
    ]
  },
  [OnboardingStep.FEATURES]: {
    meta: {
      title: 'Features',
      position: {
        order: 0,
        label: 'Welcome'
      }
    },
    skippable: true,
    transitions: [
      {target: OnboardingStep.ACCOUNT, default: true}
    ]
  },
  [OnboardingStep.ACCOUNT]: {
    meta: {
      title: 'Account',
      position: {
        order: 10,
        label: 'Account'
      }
    },
    transitions: [
      {target: OnboardingStep.PROFILE, default: true}
    ]
  },
  [OnboardingStep.PROFILE]: {
    meta: {
      title: 'Profile',
      position: {
        order: 20,
        label: 'Profile'
      }
    },
    transitions: [
      {target: OnboardingStep.PREFERENCES, canActivate: data => !!data.age && data.age >= 18},
      {target: OnboardingStep.GUARDIAN_CONSENT, default: true}
    ]
  },
  [OnboardingStep.GUARDIAN_CONSENT]: {
    meta: {
      title: 'Guardian Consent',
      position: {
        order: 20,
        label: 'Profile'
      }
    },
    transitions: [
      {target: OnboardingStep.PREFERENCES, default: true}
    ]
  },
  [OnboardingStep.PREFERENCES]: {
    meta: {
      title: 'Preferences',
      position: {
        order: 30,
        label: 'Preferences'
      }
    },
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
        OnboardingStep.WELCOME,
        {providePositions: true}
      )
    },
  ],
  imports: [
    WorkflowDemoWelcomeComponent,
    WorkflowDemoFeaturesComponent,
    WorkflowDemoAccountComponent,
    FormsModule,
    JsonPipe,
    WorkflowDemoProfileComponent,
    WorkflowDemoGuardianComponent,
    WorkflowDemoPreferencesComponent,
    MatStepper,
    MatStep,
    BlockStepperClicksDirective
  ],
  templateUrl: './workflow-demo.component.html',
  styleUrl: './workflow-demo.shared.scss'
})
export class WorkflowDemoComponent {
  protected readonly store: DemoOnboardingWorkflowStore = inject<DemoOnboardingWorkflowStore>(workflowStore)
  protected readonly OnboardingStep = OnboardingStep
  protected readonly Object = Object
}
