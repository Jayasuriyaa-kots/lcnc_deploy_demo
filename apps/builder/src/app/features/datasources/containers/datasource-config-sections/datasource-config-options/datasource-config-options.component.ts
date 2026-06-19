import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { ControlContainer, FormGroupDirective, ReactiveFormsModule } from '@angular/forms';
import { QoBadgeComponent, QoButtonComponent, QoCheckboxComponent, QoFileUploadComponent, QoFormFieldComponent, QoIconComponent, QoInputComponent, QoSelectComponent, QoTextareaComponent } from '@qo/ui-components';
import { DatasourcesFacadeService } from '@builder/features/datasources/services/datasources-facade.service';
import { DatasourcesI18nService } from '@builder/features/datasources/services/datasources-i18n.service';

@Component({
  selector: 'app-datasource-config-options',
  standalone: true,
  imports: [ReactiveFormsModule, QoBadgeComponent, QoButtonComponent, QoCheckboxComponent, QoFileUploadComponent, QoFormFieldComponent, QoIconComponent, QoInputComponent, QoSelectComponent, QoTextareaComponent],
  templateUrl: './datasource-config-options.component.html',
  styleUrl: '../datasource-config-sections.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [{ provide: ControlContainer, useExisting: FormGroupDirective }],
})
export class DatasourceConfigOptionsComponent {
  readonly facade = inject(DatasourcesFacadeService);
  private readonly i18n = inject(DatasourcesI18nService);
  protected readonly t = this.i18n.t.bind(this.i18n);
  readonly privateKeySelected = output<File[]>();
  readonly sshKeySelected = output<File[]>();
  readonly caCertificateSelected = output<File[]>();

  onPrivateKeySelected(files: File[]): void { this.privateKeySelected.emit(files); }
  onSshKeySelected(files: File[]): void { this.sshKeySelected.emit(files); }
  onCaCertificateSelected(files: File[]): void { this.caCertificateSelected.emit(files); }
}

