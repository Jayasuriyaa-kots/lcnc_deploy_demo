import { ChangeDetectionStrategy, Component, effect, input, output, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { QoFormFieldComponent, QoIconComponent, QoButtonComponent, QoInputComponent, QoSelectComponent, QoTextareaComponent, SelectOption } from '@qo/ui-components';


export interface ReportSettingsUpdates {
  name: string;
  description: string;
  viewType: 'List View' | 'Card View';
  defaultLayout: 'Compact' | 'Comfortable' | 'Detailed';
  recordClickAction: 'View Record' | 'Do Nothing';
}

type SettingsForm = FormGroup<{
  name: FormControl<string>;
  description: FormControl<string>;
  viewType: FormControl<'List View' | 'Card View'>;
  defaultLayout: FormControl<'Compact' | 'Comfortable' | 'Detailed'>;
  recordClickAction: FormControl<'View Record' | 'Do Nothing'>;
  pageSize: FormControl<string>;
  baseFilter: FormControl<string>;
}>;

/**
 * Report settings modal. Edits a report's name, description, view type, default
 * layout, and record-click action in a reactive form, emitting the updates on save.
 */
import { ReportBuilderI18nService } from '../../services/report-builder-i18n.service';
@Component({
  selector: 'app-report-settings-modal',
  standalone: true,
  imports: [QoFormFieldComponent, QoIconComponent, ReactiveFormsModule, QoButtonComponent, QoInputComponent, QoSelectComponent, QoTextareaComponent],
  templateUrl: './report-settings-modal.component.html',
  styleUrl: './report-settings-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportSettingsModalComponent {
  private readonly i18n = inject(ReportBuilderI18nService);
  protected readonly t = this.i18n.t.bind(this.i18n);
  protected readonly common = this.i18n.common.bind(this.i18n);

  readonly name = input('');
  readonly description = input('');
  readonly viewType = input<'List View' | 'Card View'>('List View');
  readonly defaultLayout = input<'Compact' | 'Comfortable' | 'Detailed'>('Comfortable');
  readonly recordClickAction = input<'View Record' | 'Do Nothing'>('View Record');

  readonly closed = output<void>();
  readonly saved = output<ReportSettingsUpdates>();

  readonly form: SettingsForm = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    description: new FormControl('', { nonNullable: true }),
    viewType: new FormControl<'List View' | 'Card View'>('List View', { nonNullable: true }),
    defaultLayout: new FormControl<'Compact' | 'Comfortable' | 'Detailed'>('Comfortable', { nonNullable: true }),
    recordClickAction: new FormControl<'View Record' | 'Do Nothing'>('View Record', { nonNullable: true }),
    pageSize: new FormControl('25 Records', { nonNullable: true }),
    baseFilter: new FormControl('', { nonNullable: true })
  });

  readonly viewTypeOptions: SelectOption[] = [
    { label: this.i18n.t('common.listView'), value: 'List View' },
    { label: this.i18n.t('common.cardView'), value: 'Card View' }
  ];

  readonly defaultLayoutOptions: SelectOption[] = [
    { label: this.i18n.t('options.compact'), value: 'Compact' },
    { label: this.i18n.t('preview.comfortable'), value: 'Comfortable' },
    { label: this.i18n.t('options.detailed'), value: 'Detailed' }
  ];

  readonly recordClickActionOptions: SelectOption[] = [
    { label: this.i18n.t('options.viewRecord'), value: 'View Record' },
    { label: this.i18n.t('options.doNothing'), value: 'Do Nothing' }
  ];

  get pageSizeOptions(): SelectOption[] {
    return [10, 25, 50, 100].map((count) => ({
      label: this.i18n.t('settings.pageSizeRecords', { count }),
      value: `${count} Records`,
    }));
  }

  constructor() {
    // Reset the form from the inputs whenever they change (no re-emit).
    effect(() => {
      this.form.reset({
        name: this.name(),
        description: this.description(),
        viewType: this.viewType(),
        defaultLayout: this.defaultLayout(),
        recordClickAction: this.recordClickAction(),
        pageSize: this.form.controls.pageSize.getRawValue(),
        baseFilter: this.form.controls.baseFilter.getRawValue()
      }, { emitEvent: false });
    }, { allowSignalWrites: true });
  }

  /** Closes the modal without saving. */
  close(): void {
    this.closed.emit();
  }

  /** Validates the form and emits the settings updates, then closes. */
  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.saved.emit({
      name: value.name,
      description: value.description,
      viewType: value.viewType,
      defaultLayout: value.defaultLayout,
      recordClickAction: value.recordClickAction
    });
    this.close();
  }
}
