import {state, style} from "@angular/animations";

export const pos1 = state('pos1', style({
  'top': '50%',
  'left': '-350px',
  'transform': 'scale(0.5) translateY(calc(-50% - 25% / .5))',
  'opacity': '0'
}))

export const pos2 = state('pos2', style({
  'top': '50%',
  'left': '0',
  'transform': 'scale(.75) translateY(calc(-50% - 12.5% / .75))'
}))

export const pos3 = state('pos3', style({
  'top': '50%',
  'left': '50%',
  'transform': 'scale(1) translateX(-50%) translateY(-50%)'
}))

export const pos4 = state('pos4', style({
  'top': '50%',
  'left': '100%',
  'transform': 'scale(.75) translateX(calc(-100% / 0.75)) translateY(calc(-50% - 12.5% / .75))'
}))

export const pos5 = state('pos5', style({
  'top': '50%',
  'left': '100%',
  'transform': 'scale(0.5) translateY(calc(-50% - 25% / .75))',
  'opacity': '0'
}))
