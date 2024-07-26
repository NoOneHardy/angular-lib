import { Component } from '@angular/core';
import {ScrollAnimationDirective} from '@noonehardy/common'
import {NgForOf} from '@angular/common'

@Component({
  selector: 'ex-scroll',
  standalone: true,
  imports: [
    ScrollAnimationDirective,
    NgForOf
  ],
  templateUrl: './scroll.component.html',
  styleUrl: './scroll.component.css'
})
export class ScrollComponent {
  items: number[] = [...Array(100).keys()]
}
