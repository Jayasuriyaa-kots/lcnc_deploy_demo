import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'qo-form-field',
  standalone: true,
  template: `
    <div class="qo-form-field">
      @if (label()) {
        <label class="qo-form-label" [for]="id()">
          {{ label() }}
          @if (required()) {
            <span class="qo-form-required">*</span>
          }
        </label>
      }
      
      <div class="qo-form-control-wrapper">
        <ng-content></ng-content>
      </div>

      @if (error()) {
        <div class="qo-form-error">{{ error() }}</div>
      } @else if (hint()) {
        <div class="qo-form-hint">{{ hint() }}</div>
      }
    </div>
  `,
  styleUrl: './form-field.component.scss'
,
  changeDetection: ChangeDetectionStrategy.OnPush})
export class QoFormFieldComponent {
  label = input<string>('');
  hint = input<string | undefined>(undefined);
  error = input<string | undefined>(undefined);
  required = input<boolean>(false);
  id = input<string>(`qo-input-${Math.random().toString(36).substring(2, 9)}`);
}

