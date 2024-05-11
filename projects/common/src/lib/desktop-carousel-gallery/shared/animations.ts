import {animate, transition, trigger} from "@angular/animations";
import {pos1, pos2, pos3, pos4, pos5} from "./states";

export const duration_ms = 750

export const rotate = trigger('rotate', [
  pos1,
  pos2,
  pos3,
  pos4,
  pos5,
  transition('pos5 <=> pos4', [
    animate(duration_ms)
  ]),
  transition('pos4 <=> pos3', [
    animate(duration_ms)
  ]),
  transition('pos3 <=> pos2', [
    animate(duration_ms)
  ]),
  transition('pos2 <=> pos1', [
    animate(duration_ms)
  ])
])
