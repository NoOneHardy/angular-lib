import {Component, inject} from '@angular/core'
import {JsonPipe} from '@angular/common'
import {FormsModule} from '@angular/forms'
import {workflowStoreFactory} from './workflow.store'
import {TRANSITION_CONFIG, TransitionConfig} from './model/transition-config'

export interface OnboardingData {
  email?: string
  age?: number
  guardianEmail?: string
  newsletter?: boolean
}

export type OnboardingStep = 'account' | 'profile' | 'guardianConsent' | 'preferences'

// Transitions decide *where a valid step goes next*, including branching (here: adults skip
// guardian consent, minors don't). They are not a place to reject invalid input — each step
// validates its own fields locally and simply doesn't call next() until they're valid.
export const onboardingTransitions: TransitionConfig<OnboardingData, OnboardingStep> = {
  account: [
    {step: 'profile', default: true}
  ],
  profile: [
    {step: 'preferences', canActivate: data => (data.age ?? 0) >= 18},
    {step: 'guardianConsent', default: true}
  ],
  guardianConsent: [
    {step: 'preferences', default: true}
  ],
  preferences: [
    {finish: true, default: true}
  ]
}

export const OnboardingWorkflowStore = workflowStoreFactory<OnboardingData, OnboardingStep>('account')

@Component({
  selector: 'n1h-workflow-demo',
  imports: [FormsModule, JsonPipe],
  providers: [
    OnboardingWorkflowStore,
    {provide: TRANSITION_CONFIG, useValue: onboardingTransitions}
  ],
  template: `
    <div style="max-width: 24em; font-family: sans-serif;">
      <p>
        Step: <strong>{{ store.currentStep() }}</strong><br/>
        Path: {{ store.path().join(' → ') || '(none)' }}
      </p>

      @if (store.hasError()) {
        <p style="color: #b91c1c;">Workflow error: {{ store.error() }}</p>
      }

      @if (store.isFinished()) {
        <p>Finished! Collected data:</p>
        <pre>{{ store.data() | json }}</pre>
      } @else {
        @switch (store.currentStep()) {
          @case ('account') {
            <label>
              Email<br/>
              <input [(ngModel)]="email" name="email" placeholder="you@example.com"/>
            </label>
            @if (accountTouched && !isEmailValid()) {
              <p style="color: #b91c1c;">Email is required.</p>
            }
          }
          @case ('profile') {
            <label>
              Age<br/>
              <input type="number" [(ngModel)]="age" name="age"/>
            </label><br/>
            @if (profileTouched && age === null) {
              <p style="color: #b91c1c;">Age is required.</p>
            }
            <label>
              <input type="checkbox" [(ngModel)]="newsletter" name="newsletter"/>
              Subscribe to newsletter
            </label>
          }
          @case ('guardianConsent') {
            <p>A parent or guardian's email is required for members under 18.</p>
            <label>
              Guardian email<br/>
              <input [(ngModel)]="guardianEmail" name="guardianEmail" placeholder="guardian@example.com"/>
            </label>
            @if (guardianTouched && !isGuardianEmailValid()) {
              <p style="color: #b91c1c;">Guardian email is required.</p>
            }
          }
          @case ('preferences') {
            <p>Review your details, then finish.</p>
            <pre>{{ store.data() | json }}</pre>
          }
        }

        <div style="margin-top: 1em; display: flex; gap: .5em;">
          <button type="button" (click)="store.back()" [disabled]="!store.path().length">Back</button>
          <button type="button" (click)="onNext()">
            {{ store.currentStep() === 'preferences' ? 'Finish' : 'Next' }}
          </button>
        </div>
      }
    </div>
  `
})
export class WorkflowDemoComponent {
  protected readonly store = inject(OnboardingWorkflowStore)

  protected email = ''
  protected age: number | null = null
  protected guardianEmail = ''
  protected newsletter = false

  protected accountTouched = false
  protected profileTouched = false
  protected guardianTouched = false

  protected isEmailValid(): boolean {
    return this.email.trim().length > 0
  }

  protected isGuardianEmailValid(): boolean {
    return this.guardianEmail.trim().length > 0
  }

  protected onNext(): void {
    switch (this.store.currentStep()) {
      case 'account':
        this.accountTouched = true
        if (!this.isEmailValid()) return
        return this.store.next({email: this.email})
      case 'profile':
        this.profileTouched = true
        if (this.age === null) return
        return this.store.next({age: this.age, newsletter: this.newsletter})
      case 'guardianConsent':
        this.guardianTouched = true
        if (!this.isGuardianEmailValid()) return
        return this.store.next({guardianEmail: this.guardianEmail})
      case 'preferences':
        return this.store.next()
    }
  }
}
