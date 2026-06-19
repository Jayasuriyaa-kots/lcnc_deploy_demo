import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { QoButtonComponent, QoFormFieldComponent, QoInputComponent, QoModalComponent } from '@qo/ui-components';

@Component({
  selector: 'app-new-role-modal',
  standalone: true,
  imports: [ReactiveFormsModule, QoModalComponent, QoButtonComponent, QoFormFieldComponent, QoInputComponent],
  templateUrl: './new-role-modal.component.html',
  styleUrl: './new-role-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewRoleModalComponent {
  readonly form = input.required<FormGroup>();
  readonly close = output<void>();
  readonly createRole = output<string>();

  closeModal(): void {
    this.close.emit();
  }

  submit(): void {
    const roleName = `${this.form().get('roleName')?.value ?? ''}`.trim();

    if (!roleName) {
      this.form().markAllAsTouched();
      return;
    }

    this.createRole.emit(roleName);
  }
}
