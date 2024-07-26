import {AfterViewInit, Directive, ElementRef, inject, Input} from '@angular/core';
import {animate, AnimationBuilder, AnimationMetadata, style} from '@angular/animations'

@Directive({
  selector: '[n1h-fade-scroll]',
  standalone: true
})
export class ScrollAnimationDirective implements AfterViewInit {
  @Input() delay: number = 0
  @Input() duration: number = 500
  @Input() direction: Direction = 'horizontal'

  private el: ElementRef<HTMLElement> = inject(ElementRef)
  private builder = inject(AnimationBuilder)
  private observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const animation = entry.isIntersecting ? this.scrollIn(this.direction) : this.scrollOut(this.direction)

      const factory = this.builder.build(animation)
      const player = factory.create(this.el.nativeElement)
      setTimeout(() => {
        player.play()
      }, this.delay)
    })
  })

  ngAfterViewInit() {
    this.observer.observe(this.el.nativeElement)
  }

  private scrollIn(direction: Direction): AnimationMetadata[] {
    return [
      this.hidden(direction),
      animate(`${this.duration}ms ease-in-out`, this.visible(direction))
    ]
  }

  private scrollOut(direction: Direction): AnimationMetadata[] {
    return [
      this.visible(direction),
      animate(`1ms ease-in-out`, this.hidden(direction))
    ]
  }

  private visible(direction: Direction) {
    return style({
      'transform': direction === 'vertical' ? 'translateY(0)' : 'translateX(0)',
      'opacity': 1
    })
  }

  private hidden(direction: Direction) {
    return style({
      'transform': direction === 'vertical' ? 'translateY(2.5em)' : 'translateX(-2.5em)',
      'opacity': 0
    })
  }
}

type Direction = 'vertical' | 'horizontal'
