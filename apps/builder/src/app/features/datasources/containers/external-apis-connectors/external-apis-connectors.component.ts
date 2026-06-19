import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { QoButtonComponent, QoConnectorIconComponent, QoInputComponent } from '@qo/ui-components';
import { ExternalApisFacadeService } from '@builder/features/datasources/services/external-apis-facade.service';
import { DatasourcesI18nService } from '@builder/features/datasources/services/datasources-i18n.service';

@Component({
  selector: 'app-external-apis-connectors',
  standalone: true,
  imports: [QoButtonComponent, QoConnectorIconComponent, QoInputComponent],
  templateUrl: './external-apis-connectors.component.html',
  styleUrl: './external-apis-connectors.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExternalApisConnectorsComponent {
  readonly store = inject(ExternalApisFacadeService);
  private readonly i18n = inject(DatasourcesI18nService);
  protected readonly t = this.i18n.t.bind(this.i18n);
}
