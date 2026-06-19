import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { ExternalApiConfigurationValue, ExternalApiMappingValue } from '@builder/features/datasources/models/external-api-schemas';
import { ExternalApiAuth, ExternalApiConnector, ExternalApiFieldMapping, ExternalApiIntegration, ExternalApiResourceConfig, ExternalApiStatus } from '@builder/features/datasources/models/external-apis.types';
import { ExternalApisSeedService } from '@builder/features/datasources/services/external-apis-seed.service';

export abstract class ExternalApisConfigService extends ExternalApisSeedService {  protected createExternalIntegrationFromForm(
    id: string,
    connector: ExternalApiConnector,
    previous: Partial<ExternalApiIntegration> | null = null
  ): ExternalApiIntegration {
    const value = this.currentExternalConfiguration();
    const primaryEndpoint = this.createExternalResourceFromConfiguration(value);
    const remainingEndpoints = previous?.endpoints?.slice(1) ?? [];
    const endpoints = primaryEndpoint ? [primaryEndpoint, ...remainingEndpoints] : remainingEndpoints;

    return {
      id,
      connectorId: connector.id,
      active: this.configBoolean(value, 'active', previous?.active ?? true),
      name: this.configText(value, 'connectionName', connector.name),
      category: connector.category,
      status: this.configStatus(value, previous?.status ?? 'Connected'),
      auth: this.configAuth(value, this.externalSchemaAuthById(connector.id)),
      lastSync: previous?.lastSync ?? this.i18n.translate('common.justNow'),
      usedIn: this.configText(value, 'useIn', this.i18n.translate('uiText.formsReportsWorkflows')),
      logo: connector.logo,
      expanded: previous?.expanded ?? false,
      clientIdOrApiKey: this.configText(value, 'clientIdOrApiKey') || this.configText(value, 'accountSid'),
      clientSecretOrToken: this.configText(value, 'clientSecretOrToken') || this.configText(value, 'authToken'),
      redirectUrl: this.configText(value, 'redirectUrl', this.defaultRedirectUrl(connector)),
      workspaceTenantDomain: this.configText(value, 'workspaceTenantDomain'),
      permissionsScopes: this.configText(value, 'permissionsScopes'),
      endpoints,
    };
  }

  protected createExternalResourceFromConfiguration(value: ExternalApiConfigurationValue): ExternalApiResourceConfig | null {
    const resourceName = this.configText(value, 'resourceName');
    const endpointUrl = this.configText(value, 'endpointUrl');
    if (!resourceName && !endpointUrl) {
      return null;
    }

    const mappings = this.configMappings(value);

    return {
      resourceName: resourceName || 'Default Resource',
      httpMethod: this.configText(value, 'httpMethod', 'GET'),
      endpointUrl,
      usage: this.configText(value, 'resourceUsage', 'Forms'),
      syncMode: this.configText(value, 'syncMode', 'Auto sync'),
      fieldMappings: mappings.map((mapping) => ({
        externalField: mapping.sourcePath,
        internalField: mapping.targetField,
        fieldType: mapping.fieldType,
        required: mapping.required,
      })),
      advancedOptions: {
        requestHeaders: this.configMappings(value, 'requestMappings').map((mapping) => ({
          key: mapping.targetField,
          value: mapping.sourcePath,
        })),
        queryParameters: [],
        responseMappings: mappings.map((mapping) => ({
          responsePath: mapping.sourcePath,
          targetField: mapping.targetField,
        })),
        retryCount: this.configText(value, 'retryCount', '3'),
        timeout: this.configText(value, 'timeout', '5000'),
        fallbackMessage: this.configText(value, 'fallbackMessage', 'Unable to complete this request right now.'),
      },
    };
  }

  protected currentExternalConfiguration(): ExternalApiConfigurationValue {
    const form = this.externalDynamicForm();
    return form ? form.getRawValue() as ExternalApiConfigurationValue : this.externalFormValue();
  }

  protected externalConfigurationFromIntegration(integration: ExternalApiIntegration): ExternalApiConfigurationValue {
    const primaryResource = integration.endpoints[0];
    return {
      connectionName: integration.name,
      status: integration.status,
      useIn: integration.usedIn,
      active: integration.active,
      authenticationType: this.externalSchemaAuthById(integration.connectorId),
      clientIdOrApiKey: integration.clientIdOrApiKey,
      clientSecretOrToken: integration.clientSecretOrToken,
      accountSid: integration.clientIdOrApiKey,
      authToken: integration.clientSecretOrToken,
      redirectUrl: integration.redirectUrl,
      workspaceTenantDomain: integration.workspaceTenantDomain,
      permissionsScopes: integration.permissionsScopes,
      resourceName: primaryResource?.resourceName ?? '',
      httpMethod: primaryResource?.httpMethod ?? 'GET',
      endpointUrl: primaryResource?.endpointUrl ?? '',
      resourceUsage: primaryResource?.usage ?? 'Forms',
      syncMode: primaryResource?.syncMode ?? 'Auto sync',
      retryCount: primaryResource?.advancedOptions?.retryCount ?? '3',
      timeout: primaryResource?.advancedOptions?.timeout ?? '5000',
      fallbackMessage: primaryResource?.advancedOptions?.fallbackMessage ?? 'Unable to complete this request right now.',
      responseMappings: primaryResource?.fieldMappings?.length
        ? primaryResource.fieldMappings.map((mapping) => ({
            sourcePath: mapping.externalField,
            targetField: mapping.internalField,
            fieldType: mapping.fieldType,
            required: mapping.required,
          }))
        : primaryResource?.advancedOptions?.responseMappings?.map((mapping) => ({
            sourcePath: mapping.responsePath,
            targetField: mapping.targetField,
            fieldType: 'Text',
            required: false,
          })) ?? [],
      requestMappings: primaryResource?.advancedOptions?.requestHeaders?.map((mapping) => ({
        sourcePath: mapping.value,
        targetField: mapping.key,
        fieldType: 'Text',
        required: false,
      })) ?? [],
    };
  }

  protected mergeExternalApiConfigurationValues(
    base: ExternalApiConfigurationValue,
    overlay: ExternalApiConfigurationValue | null
  ): ExternalApiConfigurationValue {
    if (!overlay) {
      return { ...base };
    }

    const merged: ExternalApiConfigurationValue = { ...base };
    for (const [key, value] of Object.entries(overlay)) {
      if (this.hasMeaningfulExternalApiValue(value)) {
        merged[key] = value as ExternalApiConfigurationValue[keyof ExternalApiConfigurationValue];
      }
    }

    return merged;
  }

  protected hasMeaningfulExternalApiValue(value: unknown): boolean {
    if (value === null || value === undefined) {
      return false;
    }

    if (typeof value === 'string') {
      return value.trim().length > 0;
    }

    if (Array.isArray(value)) {
      return value.length > 0;
    }

    return true;
  }

  protected configText(value: ExternalApiConfigurationValue, key: string, fallback = ''): string {
    const raw = value[key];
    if (typeof raw === 'string') {
      return raw.trim() || fallback;
    }
    if (typeof raw === 'number' || typeof raw === 'boolean') {
      return String(raw);
    }
    return fallback;
  }

  protected configBoolean(value: ExternalApiConfigurationValue, key: string, fallback: boolean): boolean {
    const raw = value[key];
    return typeof raw === 'boolean' ? raw : fallback;
  }

  protected configMappings(value: ExternalApiConfigurationValue, key = 'responseMappings'): ExternalApiMappingValue[] {
    const raw = value[key];
    if (!Array.isArray(raw)) {
      return [];
    }

    return raw
      .map((mapping) => ({
        sourcePath: typeof mapping.sourcePath === 'string' ? mapping.sourcePath.trim() : '',
        targetField: typeof mapping.targetField === 'string' ? mapping.targetField.trim() : '',
        fieldType: typeof mapping.fieldType === 'string' ? mapping.fieldType : 'Text',
        required: Boolean(mapping.required),
      }))
      .filter((mapping) => mapping.sourcePath || mapping.targetField);
  }

  protected configStatus(value: ExternalApiConfigurationValue, fallback: ExternalApiStatus): ExternalApiStatus {
    const status = this.configText(value, 'status', fallback);
    return ['Connected', 'Expired Token', 'Error', 'Not Connected'].includes(status)
      ? status as ExternalApiStatus
      : fallback;
  }

  protected configAuth(value: ExternalApiConfigurationValue, fallback: ExternalApiAuth): ExternalApiAuth {
    const auth = this.configText(value, 'authenticationType', fallback);
    return auth.trim() ? (auth as ExternalApiAuth) : fallback;
  }

  protected prepareExternalSetup(initializer: () => void): void {
    this.externalConfigReady.set(false);
    this.externalWorkspace.set('setup');
    setTimeout(() => {
      initializer();
      this.externalConfigReady.set(true);
    });
  }

  protected configureExternalDynamicForm(
    connectorId: string,
    initialValue: ExternalApiConfigurationValue | null
  ): void {
    const { schema, form, activeMappingTab } = this.configuration.createDynamicForm(connectorId, initialValue);
    this.patchExternalDynamicFormValues(form, initialValue);
    this.externalFormSchema.set(schema);
    this.externalDynamicForm.set(form);
    this.externalActiveMappingTab.set(activeMappingTab);
    this.externalFormValue.set(form.getRawValue() as ExternalApiConfigurationValue);
  }

  protected patchExternalDynamicFormValues(
    form: FormGroup,
    initialValue: ExternalApiConfigurationValue | null
  ): void {
    if (!initialValue) {
      return;
    }

    const primitivePatch = Object.entries(initialValue).reduce<Record<string, string | number | boolean>>(
      (patch, [key, value]) => {
        if (Array.isArray(value)) {
          return patch;
        }

        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          patch[key] = value;
        }

        return patch;
      },
      {}
    );

    form.patchValue(primitivePatch, { emitEvent: false });

    for (const [key, value] of Object.entries(initialValue)) {
      const control = form.controls[key];
      if (!(control instanceof FormArray) || !Array.isArray(value)) {
        continue;
      }

      control.clear({ emitEvent: false });
      const mappings = value.length ? value : [{ sourcePath: '', targetField: '', fieldType: 'Text', required: false }];
      for (const mapping of mappings) {
        control.push(this.createExternalMappingFormGroup(mapping), { emitEvent: false });
      }
    }
  }

  protected createExternalMappingFormGroup(mapping: ExternalApiMappingValue): FormGroup {
    return new FormGroup({
      sourcePath: new FormControl(mapping.sourcePath ?? '', { nonNullable: true }),
      targetField: new FormControl(mapping.targetField ?? '', { nonNullable: true }),
      fieldType: new FormControl(mapping.fieldType ?? 'Text', { nonNullable: true }),
      required: new FormControl(Boolean(mapping.required), { nonNullable: true }),
    });
  }
}

