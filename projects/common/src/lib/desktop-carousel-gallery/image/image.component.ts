import {Component, Input} from '@angular/core';
import {Image} from '../shared/image'
import {NgIf, NgOptimizedImage} from '@angular/common'
import {ImgLoaderDirective} from '../../shared/directives/img-loader.directive'

@Component({
  selector: 'n1h-image',
  standalone: true,
  imports: [
    NgIf,
    NgOptimizedImage,
    ImgLoaderDirective
  ],
  templateUrl: './image.component.html',
  styleUrl: './image.component.css'
})
export class ImageComponent {
  @Input() image?: Image
}
