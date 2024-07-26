import {Routes} from '@angular/router';
import {CarouselGalleryComponent} from './carousel-gallery/carousel-gallery.component'
import {ScrollComponent} from './scroll/scroll.component'

export const routes: Routes = [
  {
    path: 'carousel-gallery',
    component: CarouselGalleryComponent
  },
  {
    path: 'scroll',
    component: ScrollComponent
  }
];
