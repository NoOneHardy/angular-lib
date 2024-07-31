import {Component} from '@angular/core';
import {RouterLink, RouterOutlet} from '@angular/router';
import {CarouselGalleryComponent} from '../../../common/src/public-api'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CarouselGalleryComponent, RouterLink],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
}
