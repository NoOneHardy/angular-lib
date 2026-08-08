import {Component} from '@angular/core'
import {ScrollAnimationDirective} from '../../../../common/src/public-api'

@Component({
  selector: 'n1h-scroll',
  standalone: true,
  imports: [
    ScrollAnimationDirective
  ],
  templateUrl: './scroll.component.html',
  styleUrl: './scroll.component.css'
})
export class ScrollComponent {
  items: number[] = [...Array(100).keys()]
}
