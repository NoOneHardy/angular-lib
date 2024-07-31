import {Component, inject} from '@angular/core';
import {ImageLoaderService, ImgLoaderDirective, ScrollAnimationDirective} from '../../../../common/src/public-api'
import {NgForOf, NgIf} from '@angular/common'
import {toSignal} from '@angular/core/rxjs-interop'

@Component({
  selector: 'ex-scroll',
  standalone: true,
  imports: [
    ScrollAnimationDirective,
    NgForOf,
    ImgLoaderDirective,
    NgIf
  ],
  templateUrl: './scroll.component.html',
  styleUrl: './scroll.component.css'
})
export class ScrollComponent {
  items: number[] = [...Array(100).keys()]

  imagesLoaded = toSignal(inject(ImageLoaderService).imagesLoading$)
}
