import {Component, EventEmitter, inject, Input, OnInit, Output} from '@angular/core'
import {interval, Subscription} from 'rxjs'
import {Image} from './shared/image'
import { NgOptimizedImage } from '@angular/common'
import {ImageComponent} from './image/image.component'
import {ImageLoaderService} from '../shared/services/image-loader.service'
import {SwipeService} from '../services/swipe.service'

@Component({
  selector: 'n1h-desktop-carousel-gallery',
  standalone: true,
  imports: [
    NgOptimizedImage,
    ImageComponent
  ],
  templateUrl: './carousel-gallery.component.html',
  styleUrl: './carousel-gallery.component.css'
})
export class CarouselGalleryComponent implements OnInit {
  @Input() images: Image[] = []
  @Input() interval: number = 5000
  @Output() loaded = new EventEmitter<void>()

  private auto?: Subscription
  private index = 0
  private leftDisplayIndex = 0
  private timeout?: number
  private imageLoaderService = inject(ImageLoaderService)
  private swipeService = inject(SwipeService)

  display: Image[] = []
  active?: Image
  states = [
    'pos1',
    'pos2',
    'pos3',
    'pos4',
    'pos5'
  ]

  ngOnInit() {
    this.imageLoaderService.reset()

    if (this.images.length < 5) {
      console.error(`DesktopCarouselGalleryComponent: 'images' requires a length of at least '5'. Current length: '${this.images.length}'`)
      return
    }

    for (let i = 0; i < 5; i++) {
      this.display.push(this.images[i])
    }
    this.active = this.display[2]

    const sub = this.imageLoaderService.imagesLoading$.subscribe(count => {
      if (count == 0) {
        this.loaded.emit()

        // Start animation when all images are loaded
        this.auto = this.refreshSubscription()
        sub.unsubscribe()
      }
    })

    document.addEventListener('keyup', e => {
      if (e.key) {
        if (e.key === 'ArrowRight') {
          this.next()
        } else if (e.key === 'ArrowLeft') {
          this.previous()
        }
      }
    })

    this.swipeService.swipeDir$.subscribe(dir => {
      if (dir > 0) this.previous()
      if (dir < 0) this.next()
    })
  }

  refreshSubscription(): Subscription {
    return interval(this.interval).subscribe(() => {
      this.next()
    })
  }

  next() {
    // Set index to index of this.display's first item in this.images
    this.index = this.checkImagesBounds(this.index + 1)
    this.leftDisplayIndex = this.checkDisplayBounds(this.leftDisplayIndex + 1)

    // Set right item to next image in this.images
    this.display[this.checkDisplayBounds(this.leftDisplayIndex + 4)] = this.images[this.checkImagesBounds(this.index + 4)]

    // Set active image
    this.active = this.images[this.checkImagesBounds(this.index + 2)]

    this.states.unshift(this.states[4])
    this.states.pop()
  }

  previous() {
    // Set index to index of this.display's first item in this.images
    this.index = this.checkImagesBounds(this.index - 1)
    this.leftDisplayIndex = this.checkDisplayBounds(this.leftDisplayIndex - 1)

    // Set left item to next image in this.images
    this.display[this.leftDisplayIndex] = this.images[this.index]

    // Set active image
    this.active = this.images[this.checkImagesBounds(this.index + 2)]

    this.states.push(this.states[0])
    this.states.shift()
  }

  checkImagesBounds(index: number): number {
    if (index < 0) return this.checkImagesBounds(index + this.images.length)
    if (index >= this.images.length) return this.checkImagesBounds(index - this.images.length)
    return index
  }

  checkDisplayBounds(index: number): number {
    if (index < 0) return this.checkDisplayBounds(index + this.display.length)
    if (index >= this.display.length) return this.checkDisplayBounds(index - this.display.length)
    return index
  }

  onScroll(e: WheelEvent) {
    e.preventDefault()
    this.auto?.unsubscribe()
    clearTimeout(this.timeout)

    if (e.deltaY > 0) this.next()
    if (e.deltaY < 0) this.previous()

    this.timeout = setTimeout(() => {
      this.auto = this.refreshSubscription()
    }, 5000) as unknown as number
  }

  onMouseEnter(e: MouseEvent) {
    e.preventDefault()
    if (e.target instanceof HTMLElement && e.target.classList.contains('center')) {
      this.auto?.unsubscribe()
      clearTimeout(this.timeout)

      this.timeout = setTimeout(() => {
        this.auto = this.refreshSubscription()
      }, 20000) as unknown as number
    }
  }

  onMouseLeave(e: MouseEvent) {
    e.preventDefault()
    this.auto?.unsubscribe()
    clearTimeout(this.timeout)

    this.auto = this.refreshSubscription()
  }

  swipe(e: TouchEvent, when: 'start' | 'end') {
    this.swipeService.swipe(e, when)
  }
}
