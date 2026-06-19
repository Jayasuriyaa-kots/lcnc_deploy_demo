import { computed, effect, inject, signal } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ExternalApiConfigurationValue, ExternalApiSchema } from '@builder/features/datasources/models/external-api-schemas';
import { ExternalApiCategory, ExternalApiConnector, ExternalApiIntegration, ExternalApiWorkspace } from '@builder/features/datasources/models/external-apis.types';
import { ExternalApiSchemaFacade } from '@builder/features/datasources/facades/external-api-schema.facade';
import { DatasourcesI18nService } from '@builder/features/datasources/services/datasources-i18n.service';
import { DatasourcesPersistenceService } from '@builder/features/datasources/services/datasources-persistence.service';
import { ExternalApiConfigurationService } from '@builder/features/datasources/services/external-api-configuration.service';
import { QoToastService } from '@qo/ui-components';

/**
 * State-owning base slice of ExternalApisFacadeService.
 * It is abstract so Angular never creates a second feature state holder.
 */
export abstract class ExternalApisStateFacadeSlice {
  protected readonly externalApiSchemaService = inject(ExternalApiSchemaFacade);
  protected readonly configuration = inject(ExternalApiConfigurationService);
  protected readonly persistence = inject(DatasourcesPersistenceService);
  protected readonly i18n = inject(DatasourcesI18nService);
  private readonly toast = inject(QoToastService);

  protected notifySuccess(message: string, title: string): void {
    this.toast.success(message, title);
  }

  protected notifyWarning(message: string, title: string): void {
    this.toast.warning(message, title);
  }

  protected notifyError(message: string, title: string): void {
    this.toast.error(message, title);
  }

  protected abstract readStoredExternalIntegrations(): ExternalApiIntegration[];
  protected abstract defaultExternalIntegrations(): ExternalApiIntegration[];
  protected abstract persistExternalIntegrations(integrations: ExternalApiIntegration[]): void;
  readonly externalWorkspace = signal<ExternalApiWorkspace>('dashboard');
  readonly externalApiSearch = signal('');
  readonly externalCategoryFilter = signal(this.i18n.translate('common.allCategories'));
  readonly externalStatusFilter = signal(this.i18n.translate('common.allStatus'));
  readonly connectorSearch = signal('');
  readonly externalDetailSearch = signal<Record<string, string>>({});
  readonly selectedExternalConnector = signal<ExternalApiConnector | null>(null);
  readonly responsePreview = signal('');
  readonly editingIntegration = signal<ExternalApiIntegration | null>(null);
  readonly externalConfigReady = signal(false);
  readonly externalFormValue = signal<ExternalApiConfigurationValue>({});
  readonly externalFormSchema = signal<ExternalApiSchema | null>(null);
  readonly externalDynamicForm = signal<FormGroup | null>(null);
  readonly externalActiveMappingTab = signal('requestMappings');
  private readonly externalIntegrationsInitialized = signal(false);
  readonly externalConnectors = computed<ExternalApiConnector[]>(() =>
    this.externalApiSchemaService.connectors().map((connector) => ({
      id: connector.key,
      name: connector.name,
      authSummary: connector.authSummary,
      logo: connector.logo,
      category: connector.category as ExternalApiCategory,
    }))
  );
  readonly externalIntegrations = signal<ExternalApiIntegration[]>([]);

  readonly externalCategoryOptions = computed(() => [
    { label: this.i18n.translate('common.allCategories'), value: this.i18n.translate('common.allCategories') },
    ...Array.from(new Set(this.externalConnectors().map((connector) => connector.category))).map((value) => ({
      label: value,
      value,
    })),
  ]);
  readonly externalStatusOptions = [
    { label: this.i18n.translate('common.allStatus'), value: this.i18n.translate('common.allStatus') },
    { label: this.i18n.translate('common.connected'), value: 'Connected' },
    { label: this.i18n.translate('common.expiredToken'), value: 'Expired Token' },
    { label: this.i18n.translate('common.error'), value: 'Error' },
    { label: this.i18n.translate('common.notConnected'), value: 'Not Connected' },
  ];

  readonly filteredExternalIntegrations = computed(() => {
    const query = this.externalApiSearch().trim().toLowerCase();
    const category = this.externalCategoryFilter();
    const status = this.externalStatusFilter();

    return this.externalIntegrations().filter((integration) => {
      const matchesQuery =
        !query ||
        integration.name.toLowerCase().includes(query) ||
        integration.category.toLowerCase().includes(query);
      const matchesCategory = category === this.i18n.translate('common.allCategories') || integration.category === category;
      const matchesStatus = status === this.i18n.translate('common.allStatus') || integration.status === status;

      return matchesQuery && matchesCategory && matchesStatus;
    });
  });

  readonly filteredExternalConnectors = computed(() => {
    const query = this.connectorSearch().trim().toLowerCase();
    return this.externalConnectors().filter((connector) => !query || connector.name.toLowerCase().includes(query));
  });

  constructor() {
    this.externalApiSchemaService.load();

    effect(() => {
      const connectors = this.externalConnectors();
      if (!connectors.length || this.externalIntegrationsInitialized()) {
        return;
      }

      const savedIntegrations = this.readStoredExternalIntegrations();
      this.externalIntegrations.set(
        savedIntegrations.length ? savedIntegrations : this.defaultExternalIntegrations()
      );
      this.externalIntegrationsInitialized.set(true);
    });

    effect(() => {
      if (!this.externalIntegrationsInitialized()) {
        return;
      }
      this.persistExternalIntegrations(this.externalIntegrations());
    });
  }
}

