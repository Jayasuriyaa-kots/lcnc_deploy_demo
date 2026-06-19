import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import {
  QoBadgeComponent,
  QoButtonComponent,
  QoConnectorIconComponent,
  QoEmptyStateComponent,
  QoInputComponent,
  QoStatusDotComponent,
  QoTableColumnDirective,
  QoTableComponent,
  QoTableEmptyDirective,
  QoToggleComponent,
} from '@qo/ui-components';
import {
  DatasourceQueryMethod,
  DatasourceQueryRecord,
  DatasourceSourceRecord,
} from '@builder/features/datasources/models/datasource-dashboard.model';
import { DatasourcesI18nService } from '@builder/features/datasources/services/datasources-i18n.service';

@Component({
  selector: 'app-datasource-card',
  standalone: true,
  imports: [
    QoBadgeComponent,
    QoButtonComponent,
    QoConnectorIconComponent,
    QoEmptyStateComponent,
    QoInputComponent,
    QoStatusDotComponent,
    QoTableComponent,
    QoTableColumnDirective,
    QoTableEmptyDirective,
    QoToggleComponent,
  ],
  templateUrl: './datasource-card.component.html',
  styleUrl: './datasource-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatasourceCardComponent {
  private readonly i18n = inject(DatasourcesI18nService);
  protected readonly t = this.i18n.t.bind(this.i18n);
  readonly source = input.required<DatasourceSourceRecord>();
  readonly visibleQueries = input<DatasourceQueryRecord[]>([]);
  readonly querySearch = input<string>('');
  readonly querySearchPlaceholder = input('');
  readonly querySearchActive = input(false);

  readonly toggled = output<string>();
  readonly editRequested = output<string>();
  readonly schemaOpened = output<string>();
  readonly addQuery = output<string>();
  readonly querySearchChange = output<string>();
  readonly querySearchCleared = output<void>();
  readonly detailOpened = output<{ sourceId: string; queryId: string }>();
  readonly deleteRequested = output<{ sourceId: string; queryId: string }>();
  readonly sourceDeleteRequested = output<string>();
  readonly sourceActiveToggled = output<string>();
  readonly queryActiveToggled = output<{ sourceId: string; queryId: string }>();

  readonly metricItems = computed(() => [
    { label: this.i18n.translate('card.metricAvail'), value: this.source().metrics.availability, tone: this.metricTone('availability', this.source().metrics.availability) },
    { label: this.i18n.translate('card.colP95'), value: this.source().metrics.p95, tone: 'default' },
    { label: this.i18n.translate('card.metricRpm'), value: this.source().metrics.rpm, tone: 'default' },
    { label: this.i18n.translate('card.metricErrors'), value: this.source().metrics.errors, tone: this.metricTone('errors', this.source().metrics.errors) },
    { label: this.i18n.translate('card.metricAuth'), value: this.source().metrics.auth, tone: this.metricTone('auth', this.source().metrics.auth) },
    { label: this.i18n.translate('card.metricJobs'), value: this.source().metrics.jobs, tone: 'default' },
  ]);

  onToggle(): void {
    this.toggled.emit(this.source().id);
  }

  editDatasource(id: string): void {
    this.editRequested.emit(id);
  }

  onSchema(): void {
    if (this.source().active) {
      this.schemaOpened.emit(this.source().id);
    }
  }

  onAddQuery(): void {
    if (this.source().active) {
      this.addQuery.emit(this.source().id);
    }
  }

  toggleSourceActive(): void {
    this.sourceActiveToggled.emit(this.source().id);
  }

  requestSourceDelete(): void {
    this.sourceDeleteRequested.emit(this.source().id);
  }

  openDetail(queryId: string): void {
    this.detailOpened.emit({ sourceId: this.source().id, queryId });
  }

  requestDelete(queryId: string): void {
    this.deleteRequested.emit({ sourceId: this.source().id, queryId });
  }

  toggleQueryActive(queryId: string): void {
    this.queryActiveToggled.emit({ sourceId: this.source().id, queryId });
  }

  isQueryMuted(query: DatasourceQueryRecord): boolean {
    return !this.source().active || !query.active;
  }

  onQuerySearch(value: unknown): void {
    this.querySearchChange.emit(String(value ?? ''));
  }

  clearQuerySearch(): void {
    this.querySearchCleared.emit();
  }

  methodBadgeColor(method: DatasourceQueryMethod): 'success' | 'warning' | 'danger' | 'info' | 'blue' {
    if (method === 'POST' || method === 'INSERT' || method === 'MUTATION') {
      return 'success';
    }
    if (method === 'PUT' || method === 'PATCH' || method === 'UPDATE') {
      return 'info';
    }
    if (method === 'DELETE') {
      return 'danger';
    }
    return 'warning';
  }

  statusColor(): 'success' | 'warning' | 'neutral' {
    if (!this.source().active) {
      return 'neutral';
    }

    return this.source().status === 'healthy' ? 'success' : 'warning';
  }

  trackQuery(query: DatasourceQueryRecord): string {
    return query.id;
  }

  uppercase(value: string): string {
    return value.toUpperCase();
  }

  authMarker(value: string): string {
    return value === 'OK' || value === 'None' ? '✓' : '✕';
  }

  private metricTone(kind: 'errors' | 'auth' | 'availability', value: string): 'good' | 'warning' | 'danger' | 'default' {
    if (kind === 'auth') {
      return value === 'OK' || value === 'None' ? 'good' : value === 'Refresh' ? 'warning' : 'danger';
    }
    if (kind === 'errors') {
      if (value === '0.0%') {
        return 'good';
      }
      return value === '0.1%' ? 'warning' : 'danger';
    }
    if (value === '100%' || value === '99.9%') {
      return 'good';
    }
    return 'warning';
  }
}
