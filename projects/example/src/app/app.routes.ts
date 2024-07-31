import {Routes} from '@angular/router';
import {CarouselGalleryDisplayComponent} from './carousel-gallery/carousel-gallery-display.component'
import {ScrollComponent} from './scroll/scroll.component'

export const routes: Routes = [
  {
    path: 'carousel-gallery',
    component: CarouselGalleryDisplayComponent
  },
  {
    path: 'scroll',
    component: ScrollComponent
  }
];
