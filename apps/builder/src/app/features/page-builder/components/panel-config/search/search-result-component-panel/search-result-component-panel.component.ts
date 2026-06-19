import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { QoButtonComponent, QoInputComponent, SelectOption } from '@qo/ui-components';
import {
  SearchCriteriaModalComponent,
  SearchCriteriaRow,
} from '@builder/features/page-builder/components/panel-config/search/search-criteria-modal';
import { SearchOpenIn, SearchResultState, SearchResultTarget } from '@builder/features/page-builder/models/page-builder-panel-state.model';

interface SearchResultOption {
  id: SearchResultTarget;
  title: string;
  description: string;
  icon: string;
}

interface SearchResultItem {
  id: string;
  name: string;
}

import { injectPageBuilderTranslate } from '@builder/features/page-builder/services/page-builder-i18n.service';

@Component({
  selector: 'app-search-result-component-panel',
  standalone: true,
  imports: [CommonModule, SearchCriteriaModalComponent, QoButtonComponent, QoInputComponent,
  ],
  templateUrl: './search-result-component-panel.component.html',
  styleUrl: './search-result-component-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchResultComponentPanelComponent {
  protected readonly t = injectPageBuilderTranslate();
  readonly state = input<SearchResultState>({
    selectedResultTarget: null,
    selectedItemId: 'report-1',
    criteriaRows: [],
    criteriaConfigured: false,
    openIn: 'New window',
    allowPublicAccess: true,
    defaultValue: '',
    placeholder: '',
  });
  readonly stateChange = output<Partial<SearchResultState>>();
  readonly criteriaModalOpen = signal(false);

  readonly resultOptions: SearchResultOption[] = [
    { id: 'report', title: 'Report', description: 'Shows results by filtering a report using the search input', icon: 'insert_chart' },
    { id: 'page', title: 'Page', description: 'Shows results by passing the search input to a page parameter', icon: 'description' },
  ];
  readonly reportItems: SearchResultItem[] = [
    { id: 'report-1', name: 'Report 1' },
    { id: 'report-2', name: 'Test 1 Brunda Report' },
  ];
  readonly pageItems: SearchResultItem[] = [
    { id: 'page-1', name: 'Attendance Results Page' },
    { id: 'page-2', name: 'Employee Lookup Page' },
  ];
  readonly fieldOptions: SelectOption[] = [
    { value: '', label: '- Select Field -' },
    { value: 'name', label: 'Name' },
    { value: 'email', label: 'Email' },
    { value: 'status', label: 'Status' },
  ];
  readonly operatorOptions: SelectOption[] = [
    { value: '', label: '- Select Operator -' },
    { value: 'contains', label: 'Contains' },
    { value: 'equals', label: 'Equals' },
    { value: 'startsWith', label: 'Starts With' },
  ];
  readonly selectionStep = computed<'type' | 'detail'>(() => this.state().selectedResultTarget ? 'detail' : 'type');
  readonly detailHeading = computed(() => this.state().selectedResultTarget === 'report' ? 'Select the report to show search results' : 'Select the page to show search results');
  readonly currentItems = computed<SearchResultItem[]>(() => this.state().selectedResultTarget === 'page' ? this.pageItems : this.reportItems);
  readonly currentSelectionName = computed(() => this.currentItems().find((item) => item.id === this.state().selectedItemId)?.name ?? this.currentItems()[0]?.name ?? '');
  readonly detailFooterText = computed(() => this.state().selectedResultTarget === 'page' ? 'Showing the only page in Brunda app.' : 'Showing the only report in Brunda app.');
  readonly criteriaPreview = computed(() => {
    const rows = this.state().criteriaRows;
    if (rows.length === 0) {
      return '';
    }
    return rows.map((row, index) => {
      const field = row.field || 'Decision_box';
      const operator = this.formatOperator(row.operator);
      const value = row.value || 'input.searchString';
      const clause = `(${field} ${operator} ${value})`;
      return index === 0 ? clause : `${row.joiner} ${clause}`;
    }).join(' ');
  });

  criteriaConfigured(): boolean { return this.state().criteriaConfigured; }
  criteriaRows(): SearchCriteriaRow[] { return this.state().criteriaRows; }
  openIn(): SearchOpenIn { return this.state().openIn; }
  allowPublicAccess(): boolean { return this.state().allowPublicAccess; }
  defaultValue(): string { return this.state().defaultValue; }
  placeholder(): string { return this.state().placeholder; }
  selectedItemId(): string { return this.state().selectedItemId; }

  selectResultTarget(target: SearchResultTarget): void {
    this.stateChange.emit({
      selectedResultTarget: target,
      selectedItemId: (target === 'page' ? this.pageItems : this.reportItems)[0]?.id ?? '',
      criteriaConfigured: false,
    });
  }
  goToTypeSelection(): void { this.stateChange.emit({ selectedResultTarget: null }); }
  selectItem(itemId: string): void { this.stateChange.emit({ selectedItemId: itemId }); this.openCriteriaModal(); }
  openCriteriaModal(): void { this.criteriaModalOpen.set(true); }
  closeCriteriaModal(): void { this.criteriaModalOpen.set(false); }
  updateCriteriaRows(rows: SearchCriteriaRow[]): void { this.stateChange.emit({ criteriaRows: rows }); }
  doneCriteriaModal(rows: SearchCriteriaRow[]): void { this.stateChange.emit({ criteriaRows: rows, criteriaConfigured: true }); this.criteriaModalOpen.set(false); }
  toggleOpenIn(): void { this.stateChange.emit({ openIn: this.state().openIn === 'New window' ? 'Same window' : 'New window' }); }
  toggleAllowPublicAccess(): void { this.stateChange.emit({ allowPublicAccess: !this.state().allowPublicAccess }); }
  setDefaultValue(value: string): void { this.stateChange.emit({ defaultValue: value }); }
  handleDefaultValueChange(event: Event): void { this.setDefaultValue((event.target as HTMLInputElement).value); }
  setPlaceholder(value: string): void { this.stateChange.emit({ placeholder: value }); }
  handlePlaceholderChange(event: Event): void { this.setPlaceholder((event.target as HTMLInputElement).value); }

  private formatOperator(operator: string): string {
    switch (operator) {
      case 'equals':
        return '==';
      case 'startsWith':
        return '^=';
      case 'contains':
      default:
        return '==';
    }
  }
}
