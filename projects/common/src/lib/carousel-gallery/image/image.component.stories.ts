import {applicationConfig, Meta, StoryObj} from '@storybook/angular-vite'
import {provideRouter} from '@angular/router'
import {ImageComponent} from './image.component'
import {Image} from '../shared/image'

const sampleImage: Image = {
  name: 'Alpine Lake',
  src: 'https://picsum.photos/id/1053/1200/800',
  link: '#alpine-lake',
  desc: '2024-07-14'
}

const meta: Meta<ImageComponent> = {
  title: 'Carousel Gallery/Image',
  component: ImageComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [provideRouter([])]
    })
  ],
  render: args => ({
    props: args,
    template: `
      <div style="width: 24em; height: 32em;">
        <n1h-image [image]="image" [date]="date" [invisible]="invisible"></n1h-image>
      </div>
    `
  }),
  argTypes: {
    image: {
      description: 'The image to display, including its name, source, link and description.'
    },
    invisible: {
      control: 'boolean',
      description: 'Excludes the underlying `<img>` from the `ImageLoaderService`.'
    }
  }
}

export default meta

type Story = StoryObj<ImageComponent>

export const Default: Story = {
  args: {
    image: sampleImage,
    invisible: false
  }
}

export const Invisible: Story = {
  args: {
    image: sampleImage,
    invisible: true
  }
}
