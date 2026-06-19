import { ChangeDetectionStrategy, Component, computed, inject, output } from '@angular/core';
import { QoButtonComponent, QoEmptyStateComponent, QoIconComponent, QoInputComponent } from '@qo/ui-components';
import { DatasourceCardComponent } from '@builder/features/datasources/components/datasource-card/datasource-card.component';
import { DatasourcesFacadeService } from '@builder/features/datasources/services/datasources-facade.service';
import { DatasourcesI18nService } from '@builder/features/datasources/services/datasources-i18n.service';

@Component({
  selector: 'app-datasource-dashboard',
  standalone: true,
  imports: [DatasourceCardComponent, QoButtonComponent, QoEmptyStateComponent, QoIconComponent, QoInputComponent],
  templateUrl: './datasource-dashboard.component.html',
  styleUrl: './datasource-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatasourceDashboardComponent {
  readonly facade = inject(DatasourcesFacadeService);
  private readonly i18n = inject(DatasourcesI18nService);
  protected readonly t = this.i18n.t.bind(this.i18n);
  readonly addDatasource = output<void>();
  readonly deleteQueryRequested = output<{ sourceId: string; queryId: string }>();
  readonly deleteSourceRequested = output<string>();
  readonly dashboardSources = computed(() =>
    this.facade.sources().filter((source) => this.facade.datasourceMatchesSearch(source))
  );

  onDatasourceSearch(value: unknown): void { this.facade.setDatasourceSearch(String(value ?? '')); }
  clearDatasourceSearch(): void { this.facade.clearDatasourceSearch(); }
  editDatasource(id: string): void { this.facade.editDatasource(id); }
  onQuerySearch(sourceId: string, value: unknown): void { this.facade.setQuerySearch(sourceId, String(value ?? '')); }
  clearQuerySearch(sourceId: string): void { this.facade.clearQuerySearch(sourceId); }
  confirmDeleteQuery(sourceId: string, queryId: string): void { this.deleteQueryRequested.emit({ sourceId, queryId }); }
  confirmDeleteSource(sourceId: string): void { this.deleteSourceRequested.emit(sourceId); }
}
