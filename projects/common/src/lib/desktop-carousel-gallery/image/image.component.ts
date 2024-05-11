import {Component, Input} from '@angular/core';
import {Image} from '../shared/image'
import {NgIf, NgOptimizedImage} from '@angular/common'

@Component({
  selector: 'n1h-image',
  standalone: true,
  imports: [
    NgIf,
    NgOptimizedImage
  ],
  templateUrl: './image.component.html',
  styleUrl: './image.component.css'
})
export class ImageComponent {
  @Input() image?: Image
}
