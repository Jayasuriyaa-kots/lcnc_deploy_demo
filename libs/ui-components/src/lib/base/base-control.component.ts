import { Directive, input } from '@angular/core';
import { QoSize } from './types/component.types';

@Directive()
export abstract class BaseControlComponent {
  readonly disabled = input<boolean>(false);
  readonly label = input<string | undefined>(undefined);
  readonly size = input<QoSize>('md');
}
