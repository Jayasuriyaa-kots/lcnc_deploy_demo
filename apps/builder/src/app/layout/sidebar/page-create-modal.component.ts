import { ChangeDetectionStrategy, Component, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { QoButtonComponent } from '@qo/ui-components';

export interface CreatePagePayload {
  name: string;
  description: string;
}

@Component({
  selector: 'app-page-create-modal',
  standalone: true,
  imports: [ReactiveFormsModule, QoButtonComponent],
  templateUrl: './page-create-modal.component.html',
  styleUrl: './page-create-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageCreateModalComponent {
  private readonly formBuilder = inject(FormBuilder);

  readonly title = input('Create New Page');
  readonly subtitle = input('Start with a page name and add optional context before opening the editor.');
  readonly submitLabel = input('Create Page');
  readonly initialName = input('');
  readonly initialDescription = input('');
  readonly closed = output<void>();
  readonly created = output<CreatePagePayload>();
  private readonly lastPatchedSignature = signal('');

  readonly form = this.formBuilder.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    description: ['', [Validators.maxLength(500)]],
  });

  constructor() {
    effect(() => {
      const name = this.initialName();
      const description = this.initialDescription();
      const nextSignature = JSON.stringify({ name, description });

      if (nextSignature === this.lastPatchedSignature()) {
        return;
      }

      this.lastPatchedSignature.set(nextSignature);
      this.form.patchValue(
        {
          name,
          description,
        },
        { emitEvent: false },
      );
    }, { allowSignalWrites: true });
  }

  close(): void {
    this.closed.emit();
  }

  createPage(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const name = this.form.controls.name.value?.trim() ?? '';
    const description = this.form.controls.description.value?.trim() ?? '';

    if (!name) {
      return;
    }

    this.created.emit({
      name,
      description,
    });
  }

  isSubmitDisabled(): boolean {
    return this.form.invalid;
  }
}
