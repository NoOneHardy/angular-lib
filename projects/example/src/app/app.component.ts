import {Component} from '@angular/core';
import {RouterLink, RouterOutlet} from '@angular/router';
import {DesktopCarouselGalleryComponent} from '@noonehardy/common'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, DesktopCarouselGalleryComponent, RouterLink],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
}
