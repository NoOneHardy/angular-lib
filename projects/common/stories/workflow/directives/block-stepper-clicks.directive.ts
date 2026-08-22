import {AfterViewInit, Directive, ElementRef, inject} from '@angular/core'

@Directive({
  selector: 'mat-stepper[n1hBlockStepperClicks]',
})
export class BlockStepperClicksDirective implements AfterViewInit {
  private elRef = inject<ElementRef<HTMLElement>>(ElementRef)

  ngAfterViewInit(): void {
    const headers = this.elRef.nativeElement.querySelectorAll<HTMLElement>('mat-step-header')

    headers.forEach(header => {
      header.style.pointerEvents = 'none'
    })
  }

}
