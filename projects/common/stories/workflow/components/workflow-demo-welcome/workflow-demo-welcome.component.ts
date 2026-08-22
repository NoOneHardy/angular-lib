import {Component, inject} from '@angular/core'
import {workflowStore} from '../../../../src/lib/ngrx/workflow/workflow.store'
import {DemoOnboardingWorkflowStore} from '../../workflow-demo.component'
import {MatButton} from '@angular/material/button'

@Component({
  selector: 'n1h-workflow-demo-welcome',
  imports: [
    MatButton
  ],
  templateUrl: './workflow-demo-welcome.component.html',
  styleUrl: '../../workflow-demo.shared.scss'
})
export class WorkflowDemoWelcomeComponent {
  private workflow = inject<DemoOnboardingWorkflowStore>(workflowStore)

  next(): void {
    this.workflow.next()
  }

  skip(): void {
    this.workflow.skip()
  }
}
