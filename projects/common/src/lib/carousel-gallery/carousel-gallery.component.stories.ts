import {applicationConfig, Meta, StoryObj} from '@storybook/angular-vite'
import {provideRouter} from '@angular/router'
import {fn} from 'storybook/test'
import {CarouselGalleryComponent} from './carousel-gallery.component'
import {Image} from './shared/image'

const sampleImages: Image[] = [
  {name: 'Mountain Ridge', src: 'https://picsum.photos/id/1015/1200/800', link: '#mountain-ridge', desc: '2024-03-02'},
  {name: 'Foggy Forest', src: 'https://picsum.photos/id/1043/1200/800', link: '#foggy-forest', desc: '2024-04-18'},
  {name: 'Coastal Cliffs', src: 'https://picsum.photos/id/1044/1200/800', link: '#coastal-cliffs', desc: '2024-05-27'},
  {name: 'Desert Dunes', src: 'https://picsum.photos/id/1048/1200/800', link: '#desert-dunes', desc: '2024-06-09'},
  {name: 'Alpine Lake', src: 'https://picsum.photos/id/1053/1200/800', link: '#alpine-lake', desc: '2024-07-14'},
  {name: 'City Skyline', src: 'https://picsum.photos/id/1067/1200/800', link: '#city-skyline', desc: '2024-08-21'},
  {name: 'Autumn Path', src: 'https://picsum.photos/id/1074/1200/800', link: '#autumn-path', desc: '2024-09-30'}
]

const meta: Meta<CarouselGalleryComponent> = {
  title: 'Carousel Gallery/Carousel Gallery',
  component: CarouselGalleryComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [provideRouter([])]
    })
  ],
  render: args => ({
    props: args,
    template: `
      <div style="width: 100%; height: 32em;">
        <n1h-desktop-carousel-gallery [images]="images" [interval]="interval" (loaded)="loaded()"/>
      </div>
    `
  }),
  argTypes: {
    images: {
      description: 'The images to cycle through. Requires at least 5 entries.'
    },
    interval: {
      control: {type: 'number', min: 500, step: 500},
      description: 'Milliseconds between automatic transitions to the next image.'
    },
    loaded: {
      action: 'loaded',
      description: 'Emitted once every image has finished loading and the automatic rotation starts.'
    }
  },
  args: {
    loaded: fn()
  }
}

export default meta

type Story = StoryObj<CarouselGalleryComponent>

export const Default: Story = {
  args: {
    images: sampleImages,
    interval: 5000
  }
}

export const FastRotation: Story = {
  args: {
    images: sampleImages,
    interval: 1500
  }
}

export const InsufficientImages: Story = {
  name: 'Fewer than 5 images (logs an error)',
  args: {
    images: sampleImages.slice(0, 3),
    interval: 5000
  }
}
