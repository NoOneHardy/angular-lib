import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {DesktopCarouselGalleryComponent, Image} from 'common'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, DesktopCarouselGalleryComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  images: Image[] = [
    {
      name: 'Rain',
      url: 'https://images.pexels.com/photos/531880/pexels-photo-531880.jpeg',
      desc: 'It\'s regular water'
    },
    {
      name: 'Artificial intelligence',
      url: 'https://en.almamater.si/upload/courses/AAI_V6_11239.jpg',
      desc: 'ChatGPT'
    },
    {
      name: 'Lake',
      url: 'https://helpx.adobe.com/content/dam/help/en/photoshop/using/convert-color-image-black-white/jcr_content/main-pars/before_and_after/image-before/Landscape-Color.jpg',
      desc: 'A lot of water'
    },
    {
      name: 'Mountains',
      url: 'https://img.freepik.com/free-photo/painting-mountain-lake-with-mountain-background_188544-9126.jpg',
      desc: 'A bunch of rocks'
    },
    {
      name: 'Sunrise',
      url: 'https://cdn.pixabay.com/photo/2016/05/05/02/37/sunset-1373171_1280.jpg',
      desc: 'An internet provider in switzerland'
    },
    {
      name: 'Iris',
      url: 'https://media.istockphoto.com/id/1322220448/photo/abstract-digital-futuristic-eye.jpg?s=612x612&w=0&k=20&c=oAMmGJxyTTNW0XcttULhkp5IxfW9ZTaoVdVwI2KwK5s=',
      desc: 'The colorful part of the eye'
    }
  ];
}
