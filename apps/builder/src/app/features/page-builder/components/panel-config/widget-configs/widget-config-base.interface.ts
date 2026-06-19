import { InputSignal, OutputEmitterRef } from '@angular/core';

export interface WidgetConfigBase<TConfig> {
  readonly config: InputSignal<TConfig>;
  readonly configChange: OutputEmitterRef<TConfig>;
}
