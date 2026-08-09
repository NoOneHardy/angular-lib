import {applicationConfig, Meta, StoryObj} from '@storybook/angular-vite'
import {provideAnimations} from '@angular/platform-browser/animations'
import {ScrollAnimationDirective} from './scroll-animation.directive'

const meta: Meta<ScrollAnimationDirective> = {
  title: 'Directives/ScrollAnimation',
  component: ScrollAnimationDirective,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [provideAnimations()]
    })
  ],
  render: args => ({
    props: args,
    template: `
      <div style="height: 20em; overflow-y: auto; border: 1px solid rgba(128,128,128,.4); padding: 0 1em;">
        <p>Scroll down inside this box to trigger the animation.</p>
        <div style="height: 16em;"></div>
        <div
          n1hFadeScroll
          [delay]="delay"
          [duration]="duration"
          [direction]="direction"
          style="width: 12em; height: 6em; display: flex; align-items: center; justify-content: center;
                 background: #4f46e5; color: #fff; border-radius: .5em;">
          Animated box
        </div>
        <div style="height: 20em;"></div>
      </div>
    `
  }),
  argTypes: {
    delay: {
      control: {type: 'number', min: 0, step: 50},
      description: 'Milliseconds to wait before the entrance animation starts.'
    },
    duration: {
      control: {type: 'number', min: 0, step: 50},
      description: 'Duration of the entrance animation in milliseconds.'
    },
    direction: {
      control: 'radio',
      options: ['horizontal', 'vertical'],
      description: 'Axis the element slides in from when it enters the viewport.'
    }
  }
}

export default meta

type Story = StoryObj<ScrollAnimationDirective>

export const Default: Story = {
  args: {
    delay: 0,
    duration: 500,
    direction: 'horizontal'
  }
}

export const Delayed: Story = {
  args: {
    delay: 400,
    duration: 800,
    direction: 'vertical'
  }
}
