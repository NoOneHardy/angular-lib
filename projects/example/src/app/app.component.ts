import {Component} from '@angular/core'
import {RouterLink, RouterOutlet} from '@angular/router'

@Component({
  selector: 'n1h-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
}
