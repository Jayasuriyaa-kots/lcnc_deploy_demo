import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, output, signal, input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { QoButtonComponent, QoFormFieldComponent, QoInputComponent, QoSelectComponent, SelectOption } from '@qo/ui-components';

import { BuilderAction } from '@builder/features/form-builder/models/form-builder.models';
import { FormBuilderI18nService } from '@builder/features/form-builder/services/form-builder-i18n.service';
import { TranslocoPipe } from '@jsverse/transloco';

type ActionForm = FormGroup<{
  name: FormControl<string>;
  style: FormControl<BuilderAction['style']>;
  actionType: FormControl<BuilderAction['actionType']>;
}>;

@Component({
  selector: 'app-form-action-buttons',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, QoButtonComponent, QoFormFieldComponent, QoInputComponent, QoSelectComponent, TranslocoPipe],
  templateUrl: './form-action-buttons.component.html',
  styleUrl: './form-action-buttons.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormActionButtonsComponent {
  private readonly i18n = inject(FormBuilderI18nService);
  protected readonly t = this.i18n.t.bind(this.i18n);
  readonly actions = input<BuilderAction[]>([]);
  readonly actionsChanged = output<BuilderAction[]>();

  readonly editorOpen = signal(false);
  readonly editingIndex = signal<number | null>(null);

  get styleOptions(): SelectOption[] {
    return [
      { label: this.i18n.scope('actionButtons.primary'), value: 'primary' },
      { label: this.i18n.scope('actionButtons.secondary'), value: 'secondary' },
      { label: this.i18n.scope('actionButtons.ghost'), value: 'ghost' }
    ];
  }

  get actionTypeOptions(): SelectOption[] {
    return [
      { label: this.i18n.scope('actionButtons.submit'), value: 'submit' },
      { label: this.i18n.scope('actionButtons.saveDraft'), value: 'save-draft' },
      { label: this.i18n.common('clear'), value: 'reset' },
      { label: this.i18n.common('cancel'), value: 'cancel' },
      { label: this.i18n.scope('actionButtons.custom'), value: 'custom' }
    ];
  }
  readonly actionForm: ActionForm = new FormGroup({
    name: new FormControl<string>(this.i18n.scope('actionButtons.newButton'), { nonNullable: true, validators: [Validators.required] }),
    style: new FormControl<BuilderAction['style']>('secondary', { nonNullable: true }),
    actionType: new FormControl<BuilderAction['actionType']>('custom', { nonNullable: true })
  });
  readonly controls = this.actionForm.controls;

  // Opens the editor with a fresh action draft.
  openAdd(): void {
    this.editingIndex.set(null);
    this.setEditorValue(this.createDraftFormValue());
    this.editorOpen.set(true);
  }

  // Opens the editor with an existing action loaded for changes.
  openEdit(action: BuilderAction): void {
    this.editingIndex.set(this.actions().findIndex((item) => item.id === action.id));
    this.setEditorValue({
      name: action.name,
      style: action.style,
      actionType: action.actionType
    });
    this.editorOpen.set(true);
  }

  // Accepts only supported button style values from the select.
  updateStyle(value: BuilderAction['style'] | SelectOption['value']): void {
    if (value === 'primary' || value === 'secondary' || value === 'ghost') {
      this.controls.style.setValue(value);
    }
  }

  // Accepts only supported action type values from the select.
  updateActionType(value: BuilderAction['actionType'] | SelectOption['value']): void {
    if (value === 'submit' || value === 'save-draft' || value === 'reset' || value === 'cancel' || value === 'custom') {
      this.controls.actionType.setValue(value);
    }
  }

  // Saves a new or edited action and emits the full action list.
  save(): void {
    if (this.actionForm.invalid) {
      this.actionForm.markAllAsTouched();
      return;
    }

    const draft = this.actionForm.getRawValue();
    const editingIndex = this.editingIndex();
    const nextAction: BuilderAction = {
      id: editingIndex === null ? this.createId() : this.actions()[editingIndex]?.id ?? this.createId(),
      ...draft
    };

    const next = editingIndex === null
      ? [...this.actions(), nextAction]
      : this.actions().map((action, index) => index === editingIndex ? nextAction : action);

    this.actionsChanged.emit(next);
    this.close();
  }

  // Removes the currently edited action.
  remove(): void {
    const editingIndex = this.editingIndex();
    if (editingIndex === null) {
      return;
    }

    this.actionsChanged.emit(this.actions().filter((_action, index) => index !== editingIndex));
    this.close();
  }

  // Closes the editor and resets form state.
  close(): void {
    this.editorOpen.set(false);
    this.editingIndex.set(null);
    this.setEditorValue(this.createDraftFormValue());
  }

  // Creates default form values for a new custom action.
  private createDraftFormValue(): ActionForm['value'] {
    return { name: this.i18n.scope('actionButtons.newButton'), style: 'secondary', actionType: 'custom' };
  }

  // Writes values into the action editor and clears dirty/touched state.
  private setEditorValue(value: ActionForm['value']): void {
    this.actionForm.setValue({
      name: value.name ?? this.i18n.scope('actionButtons.newButton'),
      style: value.style ?? 'secondary',
      actionType: value.actionType ?? 'custom'
    });
    this.actionForm.markAsPristine();
    this.actionForm.markAsUntouched();
  }

  // Generates a local id for new action buttons.
  private createId(): string {
    return `action_${Math.random().toString(36).slice(2, 10)}`;
  }
}

