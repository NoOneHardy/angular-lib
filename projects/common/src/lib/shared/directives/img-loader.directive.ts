import {AfterViewInit, Directive, ElementRef, HostListener, inject, OnDestroy} from '@angular/core'
import {ImageLoaderService} from '../services/image-loader.service'

@Directive({
  standalone: true,
  selector: '[n1hLoadedImg]'
})
export class ImgLoaderDirective implements AfterViewInit, OnDestroy {
  private el = inject(ElementRef)
  private imgLoader = inject(ImageLoaderService)

  @HostListener('load')
  onLoad() {
    this.imgLoader.imageLoadedOrError(this.el.nativeElement)
  }

  @HostListener('error')
  onError() {
    this.imgLoader.imageLoadedOrError(this.el.nativeElement)
  }

  ngAfterViewInit(): void {
    this.imgLoader.imageLoading(this.el.nativeElement)
  }

  ngOnDestroy(): void {
    this.imgLoader.removeImage(this.el.nativeElement)
  }
}
