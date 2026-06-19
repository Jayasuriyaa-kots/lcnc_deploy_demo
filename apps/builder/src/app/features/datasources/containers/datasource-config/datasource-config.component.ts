import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { QoButtonComponent } from '@qo/ui-components';
import { DatasourceConfigConnectionComponent } from '@builder/features/datasources/containers/datasource-config-sections/datasource-config-connection';
import { DatasourceConfigOptionsComponent } from '@builder/features/datasources/containers/datasource-config-sections/datasource-config-options';
import { DatasourcesFacadeService } from '@builder/features/datasources/services/datasources-facade.service';
import { DatasourcesI18nService } from '@builder/features/datasources/services/datasources-i18n.service';

@Component({
  selector: 'app-datasource-config',
  standalone: true,
  imports: [ReactiveFormsModule, DatasourceConfigConnectionComponent, DatasourceConfigOptionsComponent, QoButtonComponent],
  templateUrl: './datasource-config.component.html',
  styleUrl: './datasource-config.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatasourceConfigComponent {
  readonly facade = inject(DatasourcesFacadeService);
  private readonly i18n = inject(DatasourcesI18nService);
  protected readonly t = this.i18n.t.bind(this.i18n);
  readonly back = output<void>();
  readonly cancel = output<void>();
  readonly privateKeySelected = output<File[]>();
  readonly sshKeySelected = output<File[]>();
  readonly caCertificateSelected = output<File[]>();
}
