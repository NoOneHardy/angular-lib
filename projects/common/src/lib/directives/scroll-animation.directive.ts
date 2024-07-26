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
      if (entry.isIntersecting) this.builder.build(this.scrollOut(this.direction)).create(this.el.nativeElement).play()
      setTimeout(() => {
        player.play()
      }, entry.isIntersecting ? this.delay : 0)
    })
  }, {
    rootMargin: '40px'
  })

  ngAfterViewInit() {
    this.observer.observe(this.el.nativeElement)
  }

  private scrollIn(direction: Direction): AnimationMetadata[] {
    return [
      this.hidden(direction),
      animate('0ms ease-in-out', this.prepared(direction)),
      animate(`${this.duration}ms ease-in-out`, this.visible(direction))
    ]
  }

  private scrollOut(direction: Direction): AnimationMetadata[] {
    return [
      this.visible(direction),
      animate('0ms ease-in-out', this.hidden(direction))
    ]
  }

  private visible(direction: Direction) {
    return style({
      'transform': direction === 'vertical' ? 'translateY(0)' : 'translateX(0)',
      'opacity': 1
    })
  }

  private prepared(direction: Direction) {
    return style({
      'transform': direction === 'vertical' ? 'translateY(40px)' : 'translateX(-40px)',
      'opacity': 0
    })
  }

  private hidden(direction: Direction) {
    return style({
      'transform': direction === 'vertical' ? 'translateY(0)' : 'translateX(0)',
      'opacity': 0
    })
  }
}

type Direction = 'vertical' | 'horizontal'
