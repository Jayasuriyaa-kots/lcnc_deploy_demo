import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { QoFormFieldComponent, QoIconComponent, QoButtonComponent, QoInputComponent, QoSelectComponent, QoStepperComponent, SelectOption, Step } from '@qo/ui-components';
import { WizardStep } from '@builder/features/report-builder/models/report-builder.models';
import { ReportBuilderColumn, ReportBuilderSourceOption } from '@builder/features/report-builder/facades/report-builder.facade';


export interface CreateReportResult {
  name: string;
  sourceFormId: string;
  reportType: 'list' | 'chart' | 'pivot';
  viewType: 'List View' | 'Card View';
  cardLayout: 'card2' | 'card3' | 'card4' | 'card5';
  selectedColumnIds: string[];
}

type WizardForm = FormGroup<{
  reportName: FormControl<string>;
  sourceFormId: FormControl<string>;
  reportType: FormControl<'list' | 'chart' | 'pivot'>;
  viewType: FormControl<'List View' | 'Card View'>;
  cardLayout: FormControl<'card2' | 'card3' | 'card4' | 'card5'>;
}>;

/**
 * Three-step "create report" wizard: pick source → choose view/layout → select
 * fields. Holds the wizard's form + step state and emits the chosen config on
 * finish (or `cancelled`).
 */
import { ReportBuilderI18nService } from '../../services/report-builder-i18n.service';
@Component({
  selector: 'app-report-create-wizard',
  standalone: true,
  imports: [QoFormFieldComponent, QoIconComponent, ReactiveFormsModule, QoButtonComponent, QoInputComponent, QoSelectComponent, QoStepperComponent],
  templateUrl: './report-create-wizard.component.html',
  styleUrl: './report-create-wizard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportCreateWizardComponent {
  private readonly i18n = inject(ReportBuilderI18nService);
  protected readonly t = this.i18n.t.bind(this.i18n);
  protected readonly common = this.i18n.common.bind(this.i18n);
  readonly sourceOptions = input<ReportBuilderSourceOption[]>([]);
  readonly created = output<CreateReportResult>();
  readonly cancelled = output<void>();

  readonly wizardStep = signal<WizardStep>(1);
  readonly wizardSelectedColumnIds = signal<string[]>([]);
  // Signal mirror of the sourceFormId FormControl so that computed signals
  // (selectedSource, wizardColumns) react when the user picks a different source.
  private readonly selectedSourceIdSignal = signal<string>('');

  readonly wizardForm: WizardForm = new FormGroup({
    reportName: new FormControl('New Report', { nonNullable: true, validators: [Validators.required] }),
    sourceFormId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    reportType: new FormControl<'list' | 'chart' | 'pivot'>('list', { nonNullable: true }),
    viewType: new FormControl<'List View' | 'Card View'>('List View', { nonNullable: true }),
    cardLayout: new FormControl<'card2' | 'card3' | 'card4' | 'card5'>('card2', { nonNullable: true }),
  });

  /** Source form picker options (name · datasource · table). */
  readonly sourceFormOptions = computed<SelectOption[]>(() =>
    this.sourceOptions().map((source) => ({
      label: `${source.name} · ${source.datasourceLabel} · ${source.tableLabel}`,
      value: source.id
    })));

  readonly viewTypeOptions: SelectOption[] = [
    { label: this.i18n.t('common.listView'), value: 'List View' },
    { label: this.i18n.t('common.cardView'), value: 'Card View' }
  ];
  readonly cardLayoutOptions: Array<{ id: 'card2' | 'card3' | 'card4' | 'card5'; label: string; description: string }> = [
    { id: 'card2', label: this.i18n.t('options.cardView2'), description: this.i18n.t('createWizard.cardView2Description') },
    { id: 'card3', label: this.i18n.t('options.cardView3'), description: this.i18n.t('createWizard.cardView3Description') },
    { id: 'card4', label: this.i18n.t('options.cardView4'), description: this.i18n.t('createWizard.cardView4Description') },
    { id: 'card5', label: this.i18n.t('options.cardView5'), description: this.i18n.t('createWizard.cardView5Description') },
  ];

  /** Stepper steps with completion state driven by the current wizard step. */
  readonly steps = computed<Step[]>(() => [
    { id: 'source', label: this.i18n.t('createWizard.sourceStep'), completed: this.wizardStep() > 1 },
    { id: 'view', label: this.i18n.t('createWizard.viewStep'), completed: this.wizardStep() > 2 },
    { id: 'fields', label: this.i18n.t('createWizard.fieldsStep') }
  ]);

  /** The chosen source option (recomputes when the source dropdown changes). */
  readonly selectedSource = computed(() =>
    this.sourceOptions().find((source) => source.id === this.selectedSourceIdSignal()));

  /** Columns of the chosen source. */
  readonly wizardColumns = computed<ReportBuilderColumn[]>(() => this.selectedSource()?.columns ?? []);

  constructor() {
    // Default/repair the chosen source and seed the selected columns.
    effect(() => {
      const sources = this.sourceOptions();
      const currentSourceId = this.selectedSourceIdSignal();

      if (!sources.length) {
        this.wizardForm.controls.sourceFormId.setValue('', { emitEvent: false });
        this.selectedSourceIdSignal.set('');
        this.wizardSelectedColumnIds.set([]);
        return;
      }

      const resolvedSourceId = sources.some((source) => source.id === currentSourceId)
        ? currentSourceId
        : sources[0].id;

      if (resolvedSourceId !== currentSourceId) {
        this.wizardForm.controls.sourceFormId.setValue(resolvedSourceId, { emitEvent: false });
        this.selectedSourceIdSignal.set(resolvedSourceId);
      }

      this.syncWizardColumns();
    }, { allowSignalWrites: true });
  }

  /** Pre-selects the first 5 columns of the chosen source. */
  syncWizardColumns(): void {
    this.wizardSelectedColumnIds.set(this.wizardColumns().slice(0, 5).map((column) => column.id));
  }

  /** Source dropdown changed — updates the form/signal and re-seeds columns. */
  onSourceChange(value: string | number | boolean | null | undefined | Record<string, unknown>): void {
    const resolvedId = this.resolveSourceId(value);
    this.wizardForm.controls.sourceFormId.setValue(resolvedId);
    // Keep the signal in sync so selectedSource / wizardColumns recompute.
    this.selectedSourceIdSignal.set(resolvedId);
    this.syncWizardColumns();
  }

  /** View-type dropdown changed. */
  onViewTypeChange(value: string | number | boolean | null | undefined | Record<string, unknown>): void {
    const resolved = this.resolveSelectStringValue(value);
    this.wizardForm.controls.viewType.setValue((resolved as 'List View' | 'Card View') || 'List View');
  }

  /** Sets the report type (list/chart/pivot). */
  setReportType(reportType: 'list' | 'chart' | 'pivot'): void {
    this.wizardForm.controls.reportType.setValue(reportType);
  }

  /** Chooses a card layout variant and switches the view to Card View. */
  setCardLayout(layout: 'card2' | 'card3' | 'card4' | 'card5'): void {
    this.wizardForm.controls.cardLayout.setValue(layout);
    this.wizardForm.controls.viewType.setValue('Card View');
  }

  /** Toggles a column in the wizard's selected-fields set. */
  toggleWizardColumn(columnId: string): void {
    this.wizardSelectedColumnIds.update((selectedIds) =>
      selectedIds.includes(columnId)
        ? selectedIds.filter((id) => id !== columnId)
        : [...selectedIds, columnId]
    );
  }

  /** Advances to the next step (requires a source on step 1). */
  nextWizardStep(): void {
    if (this.wizardStep() === 1 && !this.wizardForm.controls.sourceFormId.value) {
      this.wizardForm.controls.sourceFormId.markAsTouched();
      return;
    }

    this.wizardStep.set(Math.min(3, this.wizardStep() + 1) as WizardStep);
  }

  /** Goes back to the previous step. */
  prevWizardStep(): void {
    this.wizardStep.set(Math.max(1, this.wizardStep() - 1) as WizardStep);
  }

  /** Validates and emits the final create-report config. */
  createReport(): void {
    const name = this.wizardForm.controls.reportName.getRawValue().trim();
    const sourceFormId = this.wizardForm.controls.sourceFormId.getRawValue();

    if (!name || !sourceFormId || !this.wizardSelectedColumnIds().length) {
      this.wizardForm.markAllAsTouched();
      return;
    }

    this.created.emit({
      name,
      sourceFormId,
      reportType: this.wizardForm.controls.reportType.getRawValue(),
      viewType: this.wizardForm.controls.viewType.getRawValue(),
      cardLayout: this.wizardForm.controls.cardLayout.getRawValue(),
      selectedColumnIds: this.wizardSelectedColumnIds()
    });
  }

  /** Cancels the wizard. */
  cancel(): void {
    this.cancelled.emit();
  }

  /** Whether a column is in the selected-fields set. */
  isWizardColumnSelected(columnId: string): boolean {
    return this.wizardSelectedColumnIds().includes(columnId);
  }

  /** Coerces a select payload (string/number/object) to a string value. */
  private resolveSelectStringValue(value: string | number | boolean | null | undefined | Record<string, unknown>): string {
    if (typeof value === 'string') {
      return value;
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }
    if (value && typeof value === 'object' && 'value' in value) {
      const nested = (value as { value?: unknown }).value;
      return nested == null ? '' : String(nested);
    }
    return '';
  }

  /** Resolves a select payload to a valid known source id (with fallbacks). */
  private resolveSourceId(value: string | number | boolean | null | undefined | Record<string, unknown>): string {
    const candidate = this.resolveSelectStringValue(value);
    const sourceIds = this.sourceOptions().map((source) => source.id);

    if (sourceIds.includes(candidate)) {
      return candidate;
    }

    if (value && typeof value === 'object') {
      const payload = value as Record<string, unknown>;
      const possible = [payload.id, payload.key, payload.sourceFormId, payload.sourceId];
      for (const item of possible) {
        const next = item == null ? '' : String(item);
        if (sourceIds.includes(next)) {
          return next;
        }
      }

      const serialized = JSON.stringify(payload);
      const matched = sourceIds.find((id) => serialized.includes(id));
      if (matched) {
        return matched;
      }
    }

    return this.wizardForm.controls.sourceFormId.value || sourceIds[0] || '';
  }
}
