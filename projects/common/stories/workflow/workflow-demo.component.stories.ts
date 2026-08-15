import {Meta, StoryObj} from '@storybook/angular-vite'
import {WorkflowDemoComponent} from './workflow-demo.component'

const meta: Meta<WorkflowDemoComponent> = {
  title: 'NgRx/Workflow',
  component: WorkflowDemoComponent
}

export default meta

type Story = StoryObj<WorkflowDemoComponent>

export const Interactive: Story = {}
