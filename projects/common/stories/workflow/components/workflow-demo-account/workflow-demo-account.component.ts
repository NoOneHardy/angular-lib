import {Component, inject, OnInit} from '@angular/core'
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms'
import {MatError, MatFormField, MatInput, MatLabel} from '@angular/material/input'
import {MatButton} from '@angular/material/button'
import {workflowStore} from '../../../../src/lib/ngrx/workflow/workflow.store'
import {DemoOnboardingWorkflowStore} from '../../workflow-demo.component'

@Component({
  selector: 'n1h-workflow-demo-account',
  templateUrl: './workflow-demo-account.component.html',
  imports: [
    ReactiveFormsModule,
    MatLabel,
    MatFormField,
    MatError,
    MatInput,
    MatButton
  ],
  styleUrl: '../../workflow-demo.shared.scss'
})
export class WorkflowDemoAccountComponent implements OnInit {
  private workflow: DemoOnboardingWorkflowStore = inject(workflowStore)

  form = new FormGroup({
    email: new FormControl<string>('', {nonNullable: true, validators: [Validators.required, Validators.email]})
  })

  next(): void {
    this.form.markAllAsTouched()
    if (this.form.invalid) return

    const value = this.form.value
    this.workflow.next({...value})
  }

  ngOnInit(): void {
    const data = this.workflow.data()
    this.form.patchValue(data)
  }
}
