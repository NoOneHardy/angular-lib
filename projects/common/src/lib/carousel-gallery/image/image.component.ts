import {Component, Input, OnInit} from '@angular/core'
import {Image} from '../shared/image'
import {DatePipe, NgOptimizedImage} from '@angular/common'
import {ImgLoaderDirective} from '../../shared/directives/img-loader.directive'
import {RouterLink} from '@angular/router'

@Component({
  selector: 'n1h-image',
  imports: [
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
  @Input() invisible: boolean = false

  ngOnInit() {
    if (this.image && (new Date(this.image.desc)).toString() != 'Invalid Date') this.date = new Date(this.image.desc)
  }
}
