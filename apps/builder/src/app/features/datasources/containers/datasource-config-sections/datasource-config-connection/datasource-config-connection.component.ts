import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ControlContainer, FormGroupDirective, ReactiveFormsModule } from '@angular/forms';
import { QoFormFieldComponent, QoInputComponent, QoSelectComponent, QoTextareaComponent } from '@qo/ui-components';
import { DatasourcesFacadeService } from '@builder/features/datasources/services/datasources-facade.service';
import { DatasourcesI18nService } from '@builder/features/datasources/services/datasources-i18n.service';

@Component({
  selector: 'app-datasource-config-connection',
  standalone: true,
  imports: [ReactiveFormsModule, QoFormFieldComponent, QoInputComponent, QoSelectComponent, QoTextareaComponent],
  templateUrl: './datasource-config-connection.component.html',
  styleUrl: '../datasource-config-sections.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [{ provide: ControlContainer, useExisting: FormGroupDirective }],
})
export class DatasourceConfigConnectionComponent {
  readonly facade = inject(DatasourcesFacadeService);
  private readonly i18n = inject(DatasourcesI18nService);
  protected readonly t = this.i18n.t.bind(this.i18n);
}

