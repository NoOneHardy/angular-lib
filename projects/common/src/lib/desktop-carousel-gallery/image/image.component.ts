import {AfterViewInit, Component, Input, OnInit} from '@angular/core';
import {Image} from '../shared/image'
import {DatePipe, NgIf, NgOptimizedImage} from '@angular/common'
import {ImgLoaderDirective} from '../../shared/directives/img-loader.directive'
import {RouterLink} from '@angular/router'

@Component({
  selector: 'n1h-image',
  standalone: true,
  imports: [
    NgIf,
    NgOptimizedImage,
    ImgLoaderDirective,
    RouterLink,
    DatePipe
  ],
  templateUrl: './image.component.html',
  styleUrl: './image.component.css'
})
export class ImageComponent implements OnInit {
  @Input() image?: Image
  @Input() date?: Date

  ngOnInit() {
    if (this.image && (new Date(this.image.desc)).toString() != 'Invalid Date') this.date = new Date(this.image.desc)
  }
}
