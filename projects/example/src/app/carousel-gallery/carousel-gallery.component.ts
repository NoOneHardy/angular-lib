import { Component } from '@angular/core';
import {DesktopCarouselGalleryComponent, Image} from '@noonehardy/common'

@Component({
  selector: 'ex-carousel-gallery',
  standalone: true,
  imports: [
    DesktopCarouselGalleryComponent
  ],
  templateUrl: './carousel-gallery.component.html',
  styleUrl: './carousel-gallery.component.css'
})
export class CarouselGalleryComponent {
  images: Image[] = [
    {
      name: 'Rain',
      src: 'https://images.pexels.com/photos/531880/pexels-photo-531880.jpeg',
      desc: 'It\'s regular water',
      link: '/'
    },
    {
      name: 'Artificial intelligence',
      src: 'https://en.almamater.si/upload/courses/AAI_V6_11239.jpg',
      desc: 'ChatGPT',
      link: '/'
    },
    {
      name: 'Lake',
      src: 'https://helpx.adobe.com/content/dam/help/en/photoshop/using/convert-color-image-black-white/jcr_content/main-pars/before_and_after/image-before/Landscape-Color.jpg',
      desc: 'A lot of water',
      link: '/'
    },
    {
      name: 'Mountains',
      src: 'https://img.freepik.com/free-photo/painting-mountain-lake-with-mountain-background_188544-9126.jpg',
      desc: 'A bunch of rocks',
      link: '/'
    },
    {
      name: 'Sunrise',
      src: 'https://cdn.pixabay.com/photo/2016/05/05/02/37/sunset-1373171_1280.jpg',
      desc: 'An internet provider in switzerland',
      link: '/'
    },
    {
      name: 'Iris',
      src: 'https://media.istockphoto.com/id/1322220448/photo/abstract-digital-futuristic-eye.jpg?s=612x612&w=0&k=20&c=oAMmGJxyTTNW0XcttULhkp5IxfW9ZTaoVdVwI2KwK5s=',
      desc: 'The colorful part of the eye',
      link: '/'
    },
    {
      name: 'Gym',
      src: 'https://www.hussle.com/blog/wp-content/uploads/2020/12/Gym-structure-1080x675.png',
      desc: 'Do not skip leg day',
      link: '/'
    },
    {
      name: 'Food',
      src: 'https://www.eatclub.tv/wp-content/uploads/2023/07/unterschied-junkfood-fast-food-titel.jpg',
      desc: 'Portable energy',
      link: '/'
    }
  ];

  onLoad() {
    console.log('Loaded')
  }
}
