import { ChangeDetectionStrategy, Component, input, output, inject } from '@angular/core';
import { QoButtonComponent, QoCheckboxComponent, QoIconComponent, QoInputComponent, QoSelectComponent, SelectOption } from '@qo/ui-components';


export interface SearchDrawerRow {
  id: string;
  columnId: string;
  label: string;
  fieldType: string;
  operator: string;
  value: string;
  enabled: boolean;
}

export interface SearchDrawerState {
  rows: SearchDrawerRow[];
  operatorOptions: SelectOption[];
}

// Command pattern — all user interactions emitted as a typed union
export type SearchDrawerEvent =
  | { type: 'close' }
  | { type: 'apply' }
  | { type: 'rowToggle';       id: string; checked: boolean }
  | { type: 'operatorChange';  id: string; operator: string }
  | { type: 'valueChange';     id: string; value: string };

/**
 * Dumb component — accepts state input, emits typed Command events.
 * No service injection. No internal mutable state.
 */
import { ReportBuilderI18nService } from '../../services/report-builder-i18n.service';
@Component({
  selector: 'app-report-search-drawer',
  standalone: true,
  imports: [QoButtonComponent, QoCheckboxComponent, QoIconComponent, QoInputComponent, QoSelectComponent],
  templateUrl: './report-search-drawer.component.html',
  styleUrl: './report-search-drawer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportSearchDrawerComponent {
  private readonly i18n = inject(ReportBuilderI18nService);
  protected readonly t = this.i18n.t.bind(this.i18n);
  protected readonly common = this.i18n.common.bind(this.i18n);
  state = input.required<SearchDrawerState>();
  event = output<SearchDrawerEvent>();

  /** Narrow the field type to a concrete qo-input type (avoids template casts). */
  getInputType(fieldType: string): 'text' | 'number' | 'date' | 'time' | 'datetime-local' {
    const n = (fieldType || '').toLowerCase();
    if (n.includes('date') && n.includes('time')) return 'datetime-local';
    if (n.includes('date')) return 'date';
    if (n.includes('time')) return 'time';
    if (n.includes('number') || n.includes('currency') || n.includes('decimal')) return 'number';
    return 'text';
  }

  /** Coerces a qo-select value (string | number) to the string our events expect. */
  asString(value: string | number): string {
    return String(value);
  }

  getPlaceholder(fieldType: string): string {
    const t = this.getInputType(fieldType);
    if (t === 'date') return this.i18n.t('filters.datePlaceholder');
    if (t === 'time') return this.i18n.t('filters.timePlaceholder');
    if (t === 'datetime-local') return this.i18n.t('filters.datetimePlaceholder');
    return this.i18n.t('filters.value');
  }
}
