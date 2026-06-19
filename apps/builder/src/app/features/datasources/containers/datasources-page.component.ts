import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { QoButtonComponent, QoConfirmDialogService, QoEmptyStateComponent } from '@qo/ui-components';
import { DatasourceConfigComponent } from '@builder/features/datasources/containers/datasource-config/datasource-config.component';
import { DatasourceDashboardComponent } from '@builder/features/datasources/containers/datasource-dashboard/datasource-dashboard.component';
import { DatasourcePickerComponent } from '@builder/features/datasources/containers/datasource-picker/datasource-picker.component';
import { DatasourceQueryEditorComponent } from '@builder/features/datasources/containers/datasource-query-editor/datasource-query-editor.component';
import { ExternalApisPageComponent } from '@builder/features/datasources/containers/external-apis-page/external-apis-page.component';
import { DatasourceSection } from '@builder/features/datasources/models/datasource-dashboard.model';
import { DatasourcesI18nService } from '@builder/features/datasources/services/datasources-i18n.service';
import { DatasourcesFacadeService } from '@builder/features/datasources/services/datasources-facade.service';
import { ExternalApisFacadeService } from '@builder/features/datasources/services/external-apis-facade.service';

@Component({
  selector: 'app-datasources-page',
  standalone: true,
  imports: [
    DatasourceConfigComponent,
    DatasourceDashboardComponent,
    DatasourcePickerComponent,
    DatasourceQueryEditorComponent,
    ExternalApisPageComponent,
    QoButtonComponent,
    QoEmptyStateComponent,
  ],
  templateUrl: './datasources-page.component.html',
  styleUrl: './datasources-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatasourcesPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly confirmDialog = inject(QoConfirmDialogService);
  private readonly i18n = inject(DatasourcesI18nService);
  protected readonly t = this.i18n.t.bind(this.i18n);
  readonly facade = inject(DatasourcesFacadeService);
  readonly externalApis = inject(ExternalApisFacadeService);

  readonly sectionParam = toSignal(
    this.route.paramMap.pipe(
      map((params) => {
        const section = params.get('section');
        return section === 'apis' || section === 'logs' || section === 'compliance' ? section : 'sources';
      })
    ),
    { initialValue: 'sources' as DatasourceSection }
  );

  readonly showDashboard = computed(() => this.facade.section() === 'sources' && this.facade.workspace() === 'dashboard');
  readonly showPicker = computed(() =>
    this.facade.section() === 'sources' &&
    this.facade.workspace() === 'picker' &&
    this.facade.workspace() !== 'config' &&
    this.facade.workspace() !== 'editor'
  );
  readonly showConfig = computed(() => this.facade.workspace() === 'config');
  readonly showEditor = computed(() => this.facade.workspace() === 'editor');
  readonly showExternalApis = computed(() => this.facade.section() === 'apis');
  readonly showLogs = computed(() => this.facade.section() === 'logs');
  readonly showCompliance = computed(() => this.facade.section() === 'compliance');

  constructor() {
    effect(() => {
      this.facade.setSection(this.sectionParam());
    });
  }

  async openSourcesSection(): Promise<void> {
    this.facade.backToDashboard();
    await this.router.navigate(['/datasources/sources'], { queryParamsHandling: 'preserve' });
  }

  async openPickerSection(): Promise<void> {
    this.facade.openPicker();
    await this.router.navigate(['/datasources/sources'], { queryParamsHandling: 'preserve' });
  }

  async onConfigBack(): Promise<void> {
    if (this.facade.isEditingSource()) {
      this.facade.cancelEditingDatasource();
      await this.router.navigate(['/datasources/sources'], { queryParamsHandling: 'preserve' });
      return;
    }

    await this.openPickerSection();
  }

  async onConfigCancel(): Promise<void> {
    await this.onConfigBack();
  }

  onSshKeySelected(files: File[]): void {
    this.facade.setUploadField('sshKeyName', files);
  }

  onPrivateKeySelected(files: File[]): void {
    this.facade.setUploadField('privateKeyName', files);
  }

  onCaCertificateSelected(files: File[]): void {
    this.facade.setUploadField('caCertificateFileName', files);
  }

  async confirmDeleteQuery(request: { sourceId: string; queryId: string }): Promise<void> {
    const shouldDelete = await this.confirmDialog.confirm(
      this.i18n.translate('editor.deleteQueryTitle'),
      this.i18n.translate('editor.deleteQueryDescription'),
      {
        confirmLabel: this.i18n.translate('externalApis.delete'),
        cancelLabel: this.i18n.translate('externalApis.cancel'),
        danger: true,
      }
    );
    if (shouldDelete) this.facade.deleteQuery(request.sourceId, request.queryId);
  }

  async confirmDeleteSource(sourceId: string): Promise<void> {
    const shouldDelete = await this.confirmDialog.confirm(
      this.i18n.translate('editor.deleteDatasourceTitle'),
      this.i18n.translate('editor.deleteDatasourceDescription'),
      {
        confirmLabel: this.i18n.translate('externalApis.delete'),
        cancelLabel: this.i18n.translate('externalApis.cancel'),
        danger: true,
      }
    );
    if (shouldDelete) this.facade.deleteSource(sourceId);
  }
}
