import { ChangeDetectionStrategy, Component, computed, input, model, inject } from '@angular/core';
import { DeployerI18nService } from '../../../../services/deployer-i18n.service';
import {
  QoButtonComponent,
  QoEmptyStateComponent,
  QoTableColumnDirective,
  QoTableComponent,
  QoTableDetailDirective,
  QoTableEmptyDirective,
  TableRow
} from '@qo/ui-components';
import { EndpointSubtableComponent, UsageEndpointRow } from '../endpoint-subtable/endpoint-subtable.component';

export interface UsageSourceRow {
  id: string;
  source: string;
  application: string;
  type: string;
  availability: string;
  latency: string;
  rpm: string;
  errors: string;
  auth: string;
  jobs: string;
  eps: string;
  dotTone: string;
  availabilityTone: string;
  errorTone: string;
  authTone: string;
  readCount: string;
  writeCount: string;
  endpoints: readonly UsageEndpointRow[];
}

@Component({
  selector: 'app-data-source-table',
  standalone: true,
  imports: [
    EndpointSubtableComponent,
    QoButtonComponent,
    QoEmptyStateComponent,
    QoTableColumnDirective,
    QoTableComponent,
    QoTableDetailDirective,
    QoTableEmptyDirective
  ],
  
  templateUrl: './data-source-table.component.html',
  styleUrl: './data-source-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataSourceTableComponent {
  readonly i18n = inject(DeployerI18nService);
  readonly sources = input.required<readonly UsageSourceRow[]>();
  readonly expandedSourceId = model<string | null>(null);
  readonly sourceRows = computed<TableRow[]>(() => [...this.sources()] as unknown as TableRow[]);
  readonly detailWhen = (row: TableRow): boolean => this.isExpanded(String(row['id']));

  isExpanded(sourceId: string): boolean {
    return this.expandedSourceId() === sourceId;
  }

  toggleExpandedSource(sourceId: string): void {
    this.expandedSourceId.set(this.isExpanded(sourceId) ? null : sourceId);
  }

  onExpandButtonClick(event: Event, sourceId: string): void {
    event.stopPropagation();
    this.toggleExpandedSource(sourceId);
  }

  onLogsButtonClick(event: Event): void {
    event.stopPropagation();
  }
}
