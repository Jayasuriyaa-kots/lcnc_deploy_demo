import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { QoButtonComponent, QoEmptyStateComponent } from '@qo/ui-components';
import { DynamicIntegrationFormComponent } from '@builder/features/datasources/components/dynamic-integration-form/dynamic-integration-form.component';
import { ExternalApisFacadeService } from '@builder/features/datasources/services/external-apis-facade.service';
import { DatasourcesI18nService } from '@builder/features/datasources/services/datasources-i18n.service';

@Component({
  selector: 'app-external-apis-setup',
  standalone: true,
  imports: [DynamicIntegrationFormComponent, QoButtonComponent, QoEmptyStateComponent],
  templateUrl: './external-apis-setup.component.html',
  styleUrl: './external-apis-setup.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExternalApisSetupComponent {
  readonly store = inject(ExternalApisFacadeService);
  private readonly i18n = inject(DatasourcesI18nService);
  protected readonly t = this.i18n.t.bind(this.i18n);
}
