import {Component, inject, OnInit} from '@angular/core'
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms'
import {workflowStore} from '../../../../src/lib/ngrx/workflow/workflow.store'
import {DemoOnboardingWorkflowStore} from '../../workflow-demo.component'
import {MatError, MatFormField, MatInput, MatLabel} from '@angular/material/input'
import {MatButton} from '@angular/material/button'

@Component({
  selector: 'n1h-workflow-demo-guardian',
  imports: [
    FormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    ReactiveFormsModule,
    MatError,
    MatButton
  ],
  templateUrl: './workflow-demo-guardian.component.html',
  styleUrl: '../../workflow-demo.shared.scss'
})
export class WorkflowDemoGuardianComponent implements OnInit {
  private workflow = inject<DemoOnboardingWorkflowStore>(workflowStore)

  form = new FormGroup({
    guardianEmail: new FormControl<string>('', {
      nonNullable: true, validators: [
        Validators.required,
        Validators.email
      ]
    })
  })

  next(): void {
    this.form.markAllAsTouched()
    if (this.form.invalid) return
    const value = this.form.value
    this.workflow.next({...value})
  }

  back(): void {
    this.workflow.back()
  }

  ngOnInit(): void {
    const data = this.workflow.data()
    this.form.patchValue(data)
  }
}
