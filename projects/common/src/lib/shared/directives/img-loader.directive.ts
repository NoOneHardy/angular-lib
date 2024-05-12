import {Directive, ElementRef, HostListener} from '@angular/core'
import {ImageLoaderService} from '../services/image-loader.service'

@Directive({
  standalone: true,
  selector: '[img]'
})
export class ImgLoaderDirective {
  constructor(private el: ElementRef, private imageLoaderService: ImageLoaderService) {
    imageLoaderService.imageLoading(el.nativeElement)
  }

  @HostListener('load')
  onLoad() {
    this.imageLoaderService.imageLoadedOrError(this.el.nativeElement)
  }

  @HostListener('error')
  onError() {
    this.imageLoaderService.imageLoadedOrError(this.el.nativeElement)
  }
}
