import {TestBed} from '@angular/core/testing'
import {ImageLoaderService} from './image-loader.service'

describe('ImageLoaderService', () => {
  let service: ImageLoaderService

  beforeEach(() => {
    TestBed.configureTestingModule({})
    service = TestBed.inject(ImageLoaderService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  describe('imageLoading', () => {
    it('registers a new image as loading and emits the count', () => {
      const img = document.createElement('img')
      const emitted: number[] = []
      service.imagesLoading$.subscribe(value => emitted.push(value))

      service.imageLoading(img)

      expect(emitted).toEqual([1])
    })

    it('tracks multiple distinct images', () => {
      const img1 = document.createElement('img')
      const img2 = document.createElement('img')
      const emitted: number[] = []
      service.imagesLoading$.subscribe(value => emitted.push(value))

      service.imageLoading(img1)
      service.imageLoading(img2)

      expect(emitted).toEqual([1, 2])
    })

    it('does not re-increment an image that is already loading', () => {
      const img = document.createElement('img')
      const emitted: number[] = []

      service.imageLoading(img)
      service.imagesLoading$.subscribe(value => emitted.push(value))
      service.imageLoading(img)

      expect(emitted).toEqual([])
    })

    it('re-registers an image that has already finished loading', () => {
      const img = document.createElement('img')
      const emitted: number[] = []

      service.imageLoading(img)
      service.imageLoadedOrError(img)
      service.imagesLoading$.subscribe(value => emitted.push(value))
      service.imageLoading(img)

      expect(emitted).toEqual([1])
    })
  })

  describe('imageLoadedOrError', () => {
    it('decrements the loading count for a tracked, loading image', () => {
      const img = document.createElement('img')
      const emitted: number[] = []

      service.imageLoading(img)
      service.imagesLoading$.subscribe(value => emitted.push(value))
      service.imageLoadedOrError(img)

      expect(emitted).toEqual([0])
    })

    it('does nothing for an image that was never registered', () => {
      const img = document.createElement('img')
      const emitted: number[] = []
      service.imagesLoading$.subscribe(value => emitted.push(value))

      service.imageLoadedOrError(img)

      expect(emitted).toEqual([])
    })

    it('does nothing for an image already marked as loaded', () => {
      const img = document.createElement('img')
      const emitted: number[] = []

      service.imageLoading(img)
      service.imageLoadedOrError(img)
      service.imagesLoading$.subscribe(value => emitted.push(value))
      service.imageLoadedOrError(img)

      expect(emitted).toEqual([])
    })
  })

  describe('removeImage', () => {
    it('removes a tracked image and decrements the loading count', () => {
      const img = document.createElement('img')
      const emitted: number[] = []

      service.imageLoading(img)
      service.imagesLoading$.subscribe(value => emitted.push(value))
      service.removeImage(img)

      expect(emitted).toEqual([0])
    })

    it('does nothing for an image that was never registered', () => {
      const img = document.createElement('img')
      const emitted: number[] = []
      service.imagesLoading$.subscribe(value => emitted.push(value))

      service.removeImage(img)

      expect(emitted).toEqual([])
    })

    it('allows the same element to be tracked again after removal', () => {
      const img = document.createElement('img')
      const emitted: number[] = []

      service.imageLoading(img)
      service.removeImage(img)
      service.imagesLoading$.subscribe(value => emitted.push(value))
      service.imageLoading(img)

      expect(emitted).toEqual([1])
    })
  })

  describe('reset', () => {
    it('clears all tracked images and resets the count to zero', () => {
      const img1 = document.createElement('img')
      const img2 = document.createElement('img')
      const emitted: number[] = []

      service.imageLoading(img1)
      service.imageLoading(img2)
      service.imagesLoading$.subscribe(value => emitted.push(value))
      service.reset()

      expect(emitted).toEqual([0])
    })

    it('allows previously tracked images to be re-registered after reset', () => {
      const img = document.createElement('img')
      const emitted: number[] = []

      service.imageLoading(img)
      service.reset()
      service.imagesLoading$.subscribe(value => emitted.push(value))
      service.imageLoading(img)

      expect(emitted).toEqual([1])
    })
  })
})
