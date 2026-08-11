import {Component, computed, inject} from '@angular/core'
import {workflowStore} from '../../../../src/lib/ngrx/workflow/workflow.store'
import {DemoOnboardingWorkflowStore} from '../../workflow-demo.component'
import {JsonPipe} from '@angular/common'
import {MatButton} from '@angular/material/button'

@Component({
  selector: 'n1h-workflow-demo-preferences',
  imports: [
    JsonPipe,
    MatButton
  ],
  templateUrl: './workflow-demo-preferences.component.html',
  styleUrl: '../../workflow-demo.shared.scss'
})
export class WorkflowDemoPreferencesComponent {
  private workflow: DemoOnboardingWorkflowStore = inject(workflowStore)

  data = computed(() => this.workflow.data())

  back(): void {
    this.workflow.back()
  }

  finish(): void {
    this.workflow.next()
  }
}
