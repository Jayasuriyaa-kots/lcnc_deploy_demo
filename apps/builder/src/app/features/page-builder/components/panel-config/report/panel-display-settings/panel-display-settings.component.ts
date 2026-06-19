import { TranslocoPipe } from '@jsverse/transloco';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QoButtonComponent, QoSelectComponent, QoToggleComponent, SelectOption } from '@qo/ui-components';
import {
  SearchCriteriaModalComponent,
  SearchCriteriaRow,
} from '@builder/features/page-builder/components/panel-config/search/search-criteria-modal';
import { PanelDisplaySettingsState, ReportCriteriaType } from '@builder/features/page-builder/models/page-builder-panel-state.model';

import { injectPageBuilderTranslate } from '@builder/features/page-builder/services/page-builder-i18n.service';

@Component({
  selector: 'app-panel-display-settings',
  standalone: true,
  imports: [CommonModule, SearchCriteriaModalComponent, QoButtonComponent, QoSelectComponent, QoToggleComponent,
    TranslocoPipe,
  ],
  templateUrl: './panel-display-settings.component.html',
  styleUrl: './panel-display-settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanelDisplaySettingsComponent {
  protected readonly t = injectPageBuilderTranslate();
  readonly selectedForm = input('Employee Leave Application Form');
  readonly formOptions = input<SelectOption[]>([
    { value: 'Staff In', label: 'Staff In' },
    { value: 'Employee Leave Application Form', label: 'Employee Leave Application Form' },
    { value: 'Attendance Form', label: 'Attendance Form' },
    { value: 'Test 1 Brunda', label: 'Test 1 Brunda' },
  ]);
  readonly state = input<PanelDisplaySettingsState>({
    criteria: 'all',
    rankingEnabled: true,
    groupedBy: 'Decision box',
    aggregateValue: 'Distinct count',
    fieldValue: 'Decision box',
    orderValue: 'Lowest to highest',
    panelLimit: 8,
    selectedRecordCriteriaRows: [],
  });
  readonly stateChange = output<Partial<PanelDisplaySettingsState>>();
  readonly selectedFormChange = output<string>();
  selectedRecordsModalOpen = false;

  readonly selectedRecordFieldOptions: SelectOption[] = [
    { value: '', label: '- Select Field -' },
    { value: 'currentDateTime', label: 'Current Date Time' },
    { value: 'firstName', label: 'First Name' },
    { value: 'lastName', label: 'Last Name' },
    { value: 'department', label: 'Department' },
    { value: 'employeeId', label: 'Employee Id' },
  ];
  readonly selectedRecordOperatorOptions: SelectOption[] = [
    { value: '', label: '- Select Operator -' },
    { value: 'contains', label: 'Contains' },
    { value: 'equals', label: 'Equals' },
    { value: 'startsWith', label: 'Starts With' },
  ];

  criteria(): ReportCriteriaType {
    return this.state().criteria;
  }
  rankingEnabled(): boolean {
    return this.state().rankingEnabled;
  }
  groupedBy(): string {
    return this.state().groupedBy;
  }
  aggregateValue(): string {
    return this.state().aggregateValue;
  }
  orderValue(): string {
    return this.state().orderValue;
  }
  panelLimit(): number {
    return this.state().panelLimit;
  }
  selectedRecordCriteriaRows(): SearchCriteriaRow[] {
    return this.state().selectedRecordCriteriaRows;
  }

  setCriteria(type: ReportCriteriaType): void {
    this.stateChange.emit({ criteria: type });
    this.selectedRecordsModalOpen = type === 'selected';
  }

  toggleRanking(): void {
    this.stateChange.emit({ rankingEnabled: !this.state().rankingEnabled });
  }

  setRankingEnabled(enabled: boolean): void {
    this.stateChange.emit({ rankingEnabled: enabled });
  }

  updateSelectedForm(value: string | number): void {
    this.selectedFormChange.emit(String(value));
  }

  updateSelectedRecordCriteriaRows(rows: SearchCriteriaRow[]): void {
    this.stateChange.emit({ selectedRecordCriteriaRows: rows });
  }

  closeSelectedRecordsModal(): void {
    this.selectedRecordsModalOpen = false;
  }

  doneSelectedRecordsModal(rows: SearchCriteriaRow[]): void {
    this.stateChange.emit({ selectedRecordCriteriaRows: rows });
    this.selectedRecordsModalOpen = false;
  }
}

