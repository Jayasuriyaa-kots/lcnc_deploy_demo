import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { QoBadgeComponent, QoButtonComponent, QoConfirmDialogService, QoConnectorIconComponent, QoEmptyStateComponent, QoIconComponent, QoInputComponent, QoSelectComponent, QoTableColumnDirective, QoTableComponent, QoToggleComponent } from '@qo/ui-components';
import { ExternalApiIntegration } from '@builder/features/datasources/models/external-apis.types';
import { DatasourcesI18nService } from '@builder/features/datasources/services/datasources-i18n.service';
import { ExternalApisFacadeService } from '@builder/features/datasources/services/external-apis-facade.service';

@Component({
  selector: 'app-external-apis-dashboard',
  standalone: true,
  imports: [QoBadgeComponent, QoButtonComponent, QoConnectorIconComponent, QoEmptyStateComponent, QoIconComponent, QoInputComponent, QoSelectComponent, QoTableColumnDirective, QoTableComponent, QoToggleComponent],
  templateUrl: './external-apis-dashboard.component.html',
  styleUrl: './external-apis-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExternalApisDashboardComponent {
  readonly store = inject(ExternalApisFacadeService);
  private readonly i18n = inject(DatasourcesI18nService);
  protected readonly t = this.i18n.t.bind(this.i18n);
  private readonly confirmDialog = inject(QoConfirmDialogService);

  async confirmDeleteIntegration(integration: ExternalApiIntegration): Promise<void> {
    const shouldDelete = await this.confirmDialog.confirm(
      this.i18n.translate('externalApis.deleteIntegrationTitle'),
      this.i18n.translate('externalApis.deleteIntegrationDescription', { name: integration.name }),
      {
        confirmLabel: this.i18n.translate('externalApis.delete'),
        cancelLabel: this.i18n.translate('externalApis.cancel'),
        danger: true,
      }
    );

    if (shouldDelete) {
      this.store.deleteExternalIntegration(integration);
    }
  }
}
