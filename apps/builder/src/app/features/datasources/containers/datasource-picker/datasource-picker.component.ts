import { ChangeDetectionStrategy, Component, computed, inject, output } from '@angular/core';
import { QoButtonComponent, QoConnectorIconComponent } from '@qo/ui-components';
import {
  DatasourceConnectorOption,
} from '@builder/features/datasources/models/datasource-dashboard.model';
import { DatasourcesFacadeService } from '@builder/features/datasources/services/datasources-facade.service';
import { DatasourcesI18nService } from '@builder/features/datasources/services/datasources-i18n.service';

@Component({
  selector: 'app-datasource-picker',
  standalone: true,
  imports: [QoButtonComponent, QoConnectorIconComponent],
  templateUrl: './datasource-picker.component.html',
  styleUrl: './datasource-picker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatasourcePickerComponent {
  readonly facade = inject(DatasourcesFacadeService);
  private readonly i18n = inject(DatasourcesI18nService);
  protected readonly t = this.i18n.t.bind(this.i18n);
  readonly back = output<void>();
  readonly apiConnectors = computed(() => this.facade.connectorOptions().filter((option) => option.kind === 'api'));
  readonly databaseConnectors = computed(() =>
    this.facade.connectorOptions().filter((option) => option.kind === 'database' && option.id !== 'google_sheets')
  );

  connectorTrack(option: DatasourceConnectorOption): string { return option.id; }

}
