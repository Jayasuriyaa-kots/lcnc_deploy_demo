import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  signal,
} from '@angular/core';
import { getPageBuilderRuntimeRows } from '@builder/features/page-builder/services/page-builder-runtime-binding.service';
import { pageBuilderRuntimeDatasources, setPageBuilderRuntimeWidgetState } from '@builder/features/page-builder/services/page-builder-runtime-state.service';
import {
  createDefaultSelectWidgetConfig,
  SelectWidgetConfig,
  SelectWidgetOption,
} from '@builder/features/page-builder/models/page-builder-canvas.model';
import {
  SelectBoundOption,
  extractSelectDatasourceIdFromBinding,
  extractSelectQueryIdFromBinding,
  resolveSelectField,
  transformSelectRowsToOptions,
  tryParseSelectBindingRows,
} from '@builder/features/page-builder/components/widget-showcase/select/select-option-binding.util';
import { injectPageBuilderTranslate } from '@builder/features/page-builder/services/page-builder-i18n.service';

const DEFAULT_SELECT_WIDGET_CONFIG = createDefaultSelectWidgetConfig();

/**
 * TECHNICAL EXCEPTION - Violation 2 (Raw Form Elements):
 * This component is an approved canvas widget rendering/simulation exception.
 * It uses raw HTML elements to simulate dynamic layouts and customizable styling properties
 * (dynamic colors, custom border shape/sizes/paddings) which standard Qo components would override.
 */
@Component({
  selector: 'app-select-widget',
  standalone: true,
  imports: [
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ui-select-widget.component.html',
  styleUrl: './ui-select-widget.component.scss',
})
export class UiSelectWidgetComponent {
  protected readonly t = injectPageBuilderTranslate();
  readonly config = input<SelectWidgetConfig>(DEFAULT_SELECT_WIDGET_CONFIG);
  readonly widgetId = input('');
  readonly selectedOptionIds = signal<string[]>([]);
  readonly isOpen = signal(false);
  readonly searchTerm = signal('');
  readonly lastEmittedStateSignature = signal('');

  readonly resolvedConfig = computed<SelectWidgetConfig>(() => {
    const config = this.config();
    return {
      ...DEFAULT_SELECT_WIDGET_CONFIG,
      ...(config ?? {}),
      options: config?.options?.length
        ? config.options.map((option) => ({ ...option }))
        : DEFAULT_SELECT_WIDGET_CONFIG.options.map((option) => ({ ...option })),
    };
  });

  readonly isBoundMode = computed(() => {
    const config = this.resolvedConfig();
    return !!config.queryBinding.trim() || !!config.datasourceId.trim() || !!config.queryId.trim();
  });

  readonly boundRows = computed(() => {
    const config = this.resolvedConfig();
    const binding = config.queryBinding.trim();
    const jsonRows = tryParseSelectBindingRows(binding);
    if (jsonRows.length) {
      return jsonRows;
    }

    const datasourceId = config.datasourceId || extractSelectDatasourceIdFromBinding(binding);
    if (!datasourceId) {
      return [];
    }

    const allowedQueryIds = Object.keys(pageBuilderRuntimeDatasources()[datasourceId]?.queries ?? {});
    const queryId = config.queryId || extractSelectQueryIdFromBinding(binding, datasourceId, allowedQueryIds);
    return getPageBuilderRuntimeRows(datasourceId, queryId).map((row) => ({ ...row }));
  });

  readonly resolvedOptions = computed<SelectBoundOption[]>(() => {
    const config = this.resolvedConfig();
    if (this.isBoundMode()) {
      const rows = this.boundRows();
      const labelField = resolveSelectField(rows, config.labelField, ['label', 'name', 'title', 'text', 'value', 'id']);
      const valueField = resolveSelectField(rows, config.valueField, ['value', 'id', 'key', 'name', labelField]);
      return rows.length ? transformSelectRowsToOptions(rows, labelField, valueField) : [];
    }

    return config.options.map((option) => ({
      id: option.id,
      label: option.label,
      value: option.value,
      originalRow: this.createStaticOptionRow(option),
    }));
  });

  readonly filteredOptions = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const options = this.resolvedOptions();
    if (!this.resolvedConfig().allowSearch || !term) {
      return options;
    }

    return options.filter((option) => option.label.toLowerCase().includes(term));
  });

  readonly isMultiSelect = computed(
    () => this.resolvedConfig().multiSelect || this.resolvedConfig().variant === 'multiselect',
  );

  readonly previewOptions = computed(() =>
    this.isMultiSelect() ? this.filteredOptions().slice(0, 12) : this.filteredOptions().slice(0, 8),
  );

  readonly allSelectableOptionIds = computed(() => this.previewOptions().map((option) => option.id));

  readonly allSelected = computed(() => {
    const optionIds = this.allSelectableOptionIds();
    return optionIds.length > 0 && optionIds.every((id) => this.selectedOptionIds().includes(id));
  });

  readonly selectedCount = computed(() => this.selectedOptionIds().length);

  readonly selectedOptions = computed(() =>
    this.resolvedOptions().filter((option) => this.selectedOptionIds().includes(option.id)),
  );

  readonly selectedSummary = computed(() => {
    const selected = this.selectedOptions();
    if (!selected.length) {
      return this.resolvedConfig().placeholder || 'Choose an option...';
    }

    return selected.map((option) => option.label).join(', ');
  });

  readonly selectedDisplayLabel = computed(() => {
    const selected = this.selectedOptions()[0];
    return selected?.label || this.resolvedConfig().placeholder || 'Choose an option...';
  });

  constructor() {
    effect(
      () => {
        const options = this.resolvedOptions();
        const selectedIds = this.selectedOptionIds();
        const validIds = selectedIds.filter((id) => options.some((option) => option.id === id));
        const nextDefaultSelection = this.resolveDefaultSelection(options);
        const nextIds =
          validIds.length > 0 ? (this.isMultiSelect() ? validIds : validIds.slice(0, 1)) : nextDefaultSelection;

        if (!this.areIdListsEqual(selectedIds, nextIds)) {
          this.selectedOptionIds.set(nextIds);
        }
      },
      { allowSignalWrites: true },
    );

    effect(() => {
      const widgetId = this.widgetId().trim();
      if (!widgetId) {
        return;
      }

      const selected = this.selectedOptions();
      const primary = selected[0] ?? null;
      const payload = {
        value: this.isMultiSelect() ? selected.map((option) => option.value) : primary?.value ?? null,
        selectedOptionLabel: primary?.label ?? '',
        selectedOptionValue: primary?.value ?? null,
        selectedOption: primary
          ? {
              label: primary.label,
              value: primary.value,
            }
          : null,
        selectedRow: primary?.originalRow ?? {},
        selectedRows: selected.map((option) => option.originalRow).filter((row): row is Record<string, unknown> => !!row),
        options: this.resolvedOptions().map((option) => ({
          label: option.label,
          value: option.value,
          originalRow: option.originalRow ?? {},
        })),
      };
      const signature = JSON.stringify(payload);
      if (signature === this.lastEmittedStateSignature()) {
        return;
      }

      this.lastEmittedStateSignature.set(signature);
      setPageBuilderRuntimeWidgetState(widgetId, payload);
    }, { allowSignalWrites: true });
  }

  toggleOpen(event: MouseEvent): void {
    event.stopPropagation();
    this.isOpen.update((value) => !value);
  }

  updateSearchTerm(value: string): void {
    this.searchTerm.set(value);
  }

  toggleSelectAll(event: MouseEvent): void {
    event.stopPropagation();

    if (this.allSelected()) {
      this.selectedOptionIds.set([]);
      return;
    }

    this.selectedOptionIds.set(this.allSelectableOptionIds());
  }

  clearSelection(event: MouseEvent): void {
    event.stopPropagation();
    this.selectedOptionIds.set([]);
  }

  toggleOption(optionId: string, event: MouseEvent): void {
    event.stopPropagation();

    if (!this.isMultiSelect()) {
      this.selectedOptionIds.set([optionId]);
      this.isOpen.set(false);
      return;
    }

    this.selectedOptionIds.update((selectedIds) =>
      selectedIds.includes(optionId)
        ? selectedIds.filter((id) => id !== optionId)
        : [...selectedIds, optionId],
    );
  }

  selectRadio(optionId: string, event: MouseEvent): void {
    event.stopPropagation();
    this.selectedOptionIds.set([optionId]);
  }

  isSelected(optionId: string): boolean {
    return this.selectedOptionIds().includes(optionId);
  }

  private resolveDefaultSelection(options: SelectBoundOption[]): string[] {
    if (!options.length) {
      return [];
    }

    const defaultValue = this.resolvedConfig().defaultValue;
    if (defaultValue === null || defaultValue === '') {
      return [];
    }

    const match = options.find((option) => this.valuesEqual(option.value, defaultValue));
    return match ? [match.id] : [];
  }

  private valuesEqual(left: unknown, right: unknown): boolean {
    return String(left ?? '') === String(right ?? '');
  }

  private createStaticOptionRow(option: SelectWidgetOption): Record<string, unknown> {
    return {
      id: option.id,
      label: option.label,
      value: option.value,
    };
  }

  private areIdListsEqual(left: string[], right: string[]): boolean {
    return left.length === right.length && left.every((value, index) => value === right[index]);
  }
}
