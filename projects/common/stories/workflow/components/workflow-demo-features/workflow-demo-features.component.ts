import {Component, inject} from '@angular/core'
import {workflowStore} from '../../../../src/lib/ngrx/workflow/workflow.store'
import {DemoOnboardingWorkflowStore} from '../../workflow-demo.component'
import {MatButton} from '@angular/material/button'

@Component({
  selector: 'n1h-workflow-demo-features',
  imports: [
    MatButton
  ],
  templateUrl: './workflow-demo-features.component.html',
  styleUrl: '../../workflow-demo.shared.scss'
})
export class WorkflowDemoFeaturesComponent {
  private workflow = inject<DemoOnboardingWorkflowStore>(workflowStore)

  next(): void {
    this.workflow.next()
  }

  skip(): void {
    this.workflow.skip()
  }
}
