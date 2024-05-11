import {Component, Input, OnInit} from '@angular/core'
import {interval, Subscription} from 'rxjs'
import {Image} from './shared/image'
import {NgForOf, NgIf, NgOptimizedImage} from '@angular/common'
import {ImageComponent} from './image/image.component'
import {rotate} from './shared/animations'

@Component({
  selector: 'n1h-desktop-carousel-gallery',
  animations: [
    rotate
  ],
  standalone: true,
  imports: [
    NgOptimizedImage,
    ImageComponent,
    NgForOf,
    NgIf
  ],
  templateUrl: './desktop-carousel-gallery.component.html',
  styleUrl: './desktop-carousel-gallery.component.css'
})
export class DesktopCarouselGalleryComponent implements OnInit {
  @Input() images: Image[] = []
  @Input() interval: number = 5000

  private auto?: Subscription
  private index = 0
  private indexOfLeftItem = 0
  private indexOfRightItem = 4
  private timeout?: number

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
    this.auto = this.refreshSubscription()
    for (this.index; this.index < 5; this.index++) {
      this.display.push(this.images[this.index])
    }
    this.active = this.display[2]
  }

  refreshSubscription(): Subscription {
    return interval(this.interval).subscribe(() => {
      this.next()
    })
  }

  next() {
    this.checkBounds()
    this.display[this.indexOfLeftItem++] = this.images[this.index++]
    this.indexOfRightItem++

    // Add 2 to get the image in the middle
    if (this.indexOfLeftItem + 2 >= this.display.length) this.active = this.display[this.indexOfLeftItem + 2 - this.display.length]
    else this.active = this.display[this.indexOfLeftItem + 2]

    this.states.unshift(this.states[4])
    this.states.pop()
  }

  previous() {
    this.checkBounds()
    this.display[this.indexOfRightItem--] = this.images[this.index--]
    this.indexOfLeftItem--

    // Add 2 to get the image in the middle
    if (this.indexOfLeftItem + 2 >= this.display.length) this.active = this.display[this.indexOfLeftItem + 2 - this.display.length]
    else this.active = this.display[this.indexOfLeftItem + 2]

    this.states.push(this.states[0])
    this.states.shift()
  }

  checkBounds() {
    if (this.indexOfLeftItem == -1) this.indexOfLeftItem = this.display.length - 1
    if (this.indexOfRightItem == -1) this.indexOfRightItem = this.display.length - 1
    if (this.indexOfLeftItem == this.display.length) this.indexOfLeftItem = 0
    if (this.indexOfRightItem == this.display.length) this.indexOfRightItem = 0
    if (this.index == -1) this.index = this.images.length - 1
    if (this.index == this.images.length) this.index = 0
  }

  onScroll(e: WheelEvent) {
    e.preventDefault()
    this.auto?.unsubscribe()
    clearTimeout(this.timeout)

    if (e.deltaY > 0) this.next()
    if (e.deltaY < 0) this.previous()

    this.timeout = setTimeout(() => {
      this.auto = this.refreshSubscription()
    }, 5000)
  }
}
