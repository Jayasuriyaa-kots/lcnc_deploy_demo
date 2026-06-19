import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoDirective, TranslocoPipe } from '@jsverse/transloco';
import {
  QoEmptyStateComponent,
  QoButtonComponent,
  QoFormFieldComponent,
  QoIconComponent,
  QoInputComponent,
  QoSelectComponent,
  QoTextareaComponent,
  QoToggleComponent,
  SelectOption,
} from '@qo/ui-components';
import { WorkflowNode } from '@qo/models';
import { FormField } from '@qo/models';
import { WorkflowMappingSource } from '../../../models/workflow-auto-mapping.model';
import { buildWorkflowMappingTargets } from '../../../models/workflow-auto-mapping.utils';
import { WorkflowFormDatasourceQuery } from '../../../services/workflow-form-context.service';
import { WorkflowBuilderI18nService } from '../../../services/workflow-builder-i18n.service';
import { WORKFLOW_LANGUAGE } from '../../../services/workflow-language';
import { WorkflowFieldMapperComponent } from '../workflow-field-mapper/workflow-field-mapper.component';
import { WorkflowRuleBuilderComponent } from '../workflow-rule-builder/workflow-rule-builder.component';
import {
  WorkflowNodeConfigField,
  WorkflowNodeConfigTabId,
  WorkflowNodeDefinition,
} from '../../../models/workflow-editor-palette.config';

export interface WorkflowNodeConfigChange {
  nodeId: string;
  key: string;
  value: unknown;
}

interface WorkflowDatasourceQueryOption {
  datasourceId: string;
  datasourceLabel: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  endpoint: string;
}

const WORKFLOW_DATASOURCE_QUERIES: readonly WorkflowDatasourceQueryOption[] = [
  { datasourceId: 'qo_hrms_prod', datasourceLabel: 'qo_hrms_prod', method: 'GET', endpoint: 'GET /employees' },
  { datasourceId: 'qo_hrms_prod', datasourceLabel: 'qo_hrms_prod', method: 'POST', endpoint: 'POST /employees' },
  { datasourceId: 'qo_hrms_prod', datasourceLabel: 'qo_hrms_prod', method: 'GET', endpoint: 'GET /departments' },
  { datasourceId: 'attendance_api', datasourceLabel: WORKFLOW_LANGUAGE.fallbacks.nodeConfigSamples.attendanceApi, method: 'GET', endpoint: 'GET /employees' },
  { datasourceId: 'attendance_api', datasourceLabel: WORKFLOW_LANGUAGE.fallbacks.nodeConfigSamples.attendanceApi, method: 'POST', endpoint: 'POST /employees' },
  { datasourceId: 'attendance_api', datasourceLabel: WORKFLOW_LANGUAGE.fallbacks.nodeConfigSamples.attendanceApi, method: 'GET', endpoint: 'GET /departments' },
  { datasourceId: 'analytics_store', datasourceLabel: WORKFLOW_LANGUAGE.fallbacks.nodeConfigSamples.analyticsStore, method: 'GET', endpoint: 'GET /events' },
  { datasourceId: 'analytics_store', datasourceLabel: WORKFLOW_LANGUAGE.fallbacks.nodeConfigSamples.analyticsStore, method: 'POST', endpoint: 'POST /events/batch' },
  { datasourceId: 'analytics_store', datasourceLabel: WORKFLOW_LANGUAGE.fallbacks.nodeConfigSamples.analyticsStore, method: 'GET', endpoint: 'GET /metrics/daily' },
  { datasourceId: 'google_sheets', datasourceLabel: WORKFLOW_LANGUAGE.fallbacks.nodeConfigSamples.googleSheets, method: 'GET', endpoint: 'GET /sheet/payroll' },
  { datasourceId: 'google_sheets', datasourceLabel: WORKFLOW_LANGUAGE.fallbacks.nodeConfigSamples.googleSheets, method: 'POST', endpoint: 'POST /sheet/sync' },
  { datasourceId: 'google_sheets', datasourceLabel: WORKFLOW_LANGUAGE.fallbacks.nodeConfigSamples.googleSheets, method: 'GET', endpoint: 'GET /sheet/archive' },
];

@Component({
  selector: 'app-workflow-node-config-panel',
  standalone: true,
  imports: [
    CommonModule,
    TranslocoDirective,
    TranslocoPipe,
    QoButtonComponent,
    QoEmptyStateComponent,
    QoFormFieldComponent,
    QoIconComponent,
    QoInputComponent,
    QoSelectComponent,
    QoTextareaComponent,
    QoToggleComponent,
    WorkflowFieldMapperComponent,
    WorkflowRuleBuilderComponent,
  ],
  templateUrl: './workflow-node-config-panel.component.html',
  styleUrl: './workflow-node-config-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkflowNodeConfigPanelComponent {
  readonly lang = WORKFLOW_LANGUAGE;
  private readonly i18n = inject(WorkflowBuilderI18nService);
  readonly node = input<WorkflowNode | null>(null);
  readonly definition = input<WorkflowNodeDefinition | null>(null);
  readonly validationMessages = input<string[]>([]);
  readonly formFields = input<readonly FormField[]>([]);
  readonly formDatasourceQueries = input<readonly WorkflowFormDatasourceQuery[]>([]);
  readonly mappingSources = input<readonly WorkflowMappingSource[]>([]);
  readonly configChange = output<WorkflowNodeConfigChange>();
  readonly collapse = output<void>();

  readonly activeTabId = signal<WorkflowNodeConfigTabId>('general');
  readonly visibleTabs = computed(() => this.definition()?.configTabs ?? []);
  readonly visibleFields = computed(() => {
    const definition = this.definition();

    if (!definition) {
      return [];
    }

    return definition.configSchema.filter((field) => field.tab === this.activeTabId());
  });

  selectTab(tabId: WorkflowNodeConfigTabId): void {
    this.activeTabId.set(tabId);
  }

  collapsePanel(): void {
    this.collapse.emit();
  }

  fillSampleData(): void {
    const node = this.node();
    const definition = this.definition();

    if (!node || !definition) {
      return;
    }

    for (const field of definition.configSchema) {
      if (!field.required || !this.isEmptyValue(node.config[field.key])) {
        continue;
      }

      this.configChange.emit({
        nodeId: node.id,
        key: field.key,
        value: this.sampleValueForField(field),
      });
    }
  }

  tabHasError(tabId: WorkflowNodeConfigTabId): boolean {
    const definition = this.definition();

    if (!definition) {
      return false;
    }

    return definition.configSchema
      .filter((field) => field.tab === tabId)
      .some((field) => !!this.fieldError(field));
  }

  fieldError(field: WorkflowNodeConfigField): string {
    const node = this.node();

    if (!node) {
      return '';
    }

    const explicitError = this.validationMessages().find((message) => message.startsWith(`${node.label}: ${field.label}`));
    if (explicitError) {
      return explicitError.replace(`${node.label}: `, '');
    }

    if (field.required && this.isEmptyValue(node.config[field.key])) {
      return this.i18n.scope('validation.required', { label: field.label });
    }

    return '';
  }

  fieldValue(field: WorkflowNodeConfigField): string | number | boolean | null {
    const node = this.node();

    if (!node) {
      return null;
    }

    const value = node.config[field.key];

    if (field.type === 'toggle') {
      return value === true;
    }

    if (field.type === 'number') {
      return typeof value === 'number' ? value : value == null || value === '' ? null : Number(value);
    }

    if (this.isComplexField(field)) {
      return this.serializeComplexValue(value);
    }

    return value == null ? '' : String(value);
  }

  fieldOptions(field: WorkflowNodeConfigField): SelectOption[] {
    if (field.key === 'datasource') {
      return this.datasourceOptions();
    }

    if (field.key === 'query') {
      return this.querySelectOptions();
    }

    if (field.key === 'fields' || field.key === 'targetField') {
      const formFieldOptions = this.formFieldOptions();

      if (formFieldOptions.length) {
        return formFieldOptions;
      }
    }

    return this.optionsForField(field).map((option) => ({
      label: option,
      value: option,
    }));
  }

  inputType(field: WorkflowNodeConfigField): 'text' | 'number' {
    return field.type === 'number' ? 'number' : 'text';
  }

  isTextareaField(field: WorkflowNodeConfigField): boolean {
    return field.type === 'textarea' || (field.type !== 'mapping' && field.type !== 'ruleBuilder' && this.isComplexField(field));
  }

  isMappingField(field: WorkflowNodeConfigField): boolean {
    return field.type === 'mapping';
  }

  isRuleBuilderField(field: WorkflowNodeConfigField): boolean {
    return field.type === 'ruleBuilder';
  }

  isSelectField(field: WorkflowNodeConfigField): boolean {
    return field.type === 'select';
  }

  isToggleField(field: WorkflowNodeConfigField): boolean {
    return field.type === 'toggle';
  }

  isInputField(field: WorkflowNodeConfigField): boolean {
    return !this.isRuleBuilderField(field) && !this.isTextareaField(field) && !this.isSelectField(field) && !this.isToggleField(field);
  }

  updateField(field: WorkflowNodeConfigField, value: unknown): void {
    const node = this.node();

    if (!node) {
      return;
    }

    const normalizedValue = this.normalizeValue(field, value);

    this.configChange.emit({
      nodeId: node.id,
      key: field.key,
      value: normalizedValue,
    });

    if (field.key === 'query') {
      this.syncMethodFromQuery(node.id, normalizedValue);
      this.syncFormQueryDetails(node.id, normalizedValue);
    }
  }

  rawFieldValue(field: WorkflowNodeConfigField): unknown {
    return this.node()?.config[field.key] ?? {};
  }

  mappingTargets(field: WorkflowNodeConfigField) {
    const definition = this.definition();

    if (!definition) {
      return [];
    }

    if (field.key === 'values') {
      const selectedQuery = this.selectedFormQuery();

      if (selectedQuery?.expectedInput.length) {
        return selectedQuery.expectedInput.map((input) => ({
          key: input.key,
          label: input.label,
          type: input.type,
          required: input.required,
        }));
      }
    }

    return buildWorkflowMappingTargets(field, definition, this.formFields());
  }

  fieldRows(field: WorkflowNodeConfigField): number {
    switch (field.type) {
      case 'textarea':
        return 3;
      case 'code':
      case 'json':
      case 'schema':
        return 8;
      case 'mapping':
      case 'ruleBuilder':
      case 'keyValue':
      case 'fileMapping':
      case 'emailList':
        return 6;
      default:
        return 4;
    }
  }

  private normalizeValue(field: WorkflowNodeConfigField, value: unknown): unknown {
    if (field.type === 'toggle') {
      return value === true;
    }

    if (field.type === 'number') {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    }

    if (this.isComplexField(field) && typeof value === 'string') {
      const trimmed = value.trim();

      if (!trimmed) {
        return '';
      }

      try {
        return JSON.parse(trimmed);
      } catch {
        return value;
      }
    }

    return value;
  }

  private isComplexField(field: WorkflowNodeConfigField): boolean {
    return ['json', 'schema', 'mapping', 'ruleBuilder', 'code', 'keyValue', 'fileMapping', 'emailList', 'multiSelect', 'duration'].includes(field.type);
  }

  private optionsForField(field: WorkflowNodeConfigField): readonly string[] {
    if (field.options?.length) {
      return field.options;
    }

    switch (field.key) {
      case 'datasource':
      case 'query':
      case 'fields':
      case 'targetField':
        return [];
      case 'table':
        return [
          this.lang.fallbacks.nodeConfigSamples.customers,
          this.lang.fallbacks.nodeConfigSamples.orders,
          this.lang.fallbacks.nodeConfigSamples.tickets,
        ];
      case 'sender':
        return ['no-reply@quanta.local', 'support@quanta.local', 'ops@quanta.local'];
      case 'page':
      case 'targetPage':
        return [
          this.lang.fallbacks.nodeConfigSamples.dashboard,
          this.lang.fallbacks.nodeConfigSamples.customerDetail,
          this.lang.fallbacks.nodeConfigSamples.operationsConsole,
        ];
      case 'widget':
      case 'targetWidget':
        return [
          this.lang.fallbacks.nodeConfigSamples.customerTable,
          this.lang.fallbacks.nodeConfigSamples.statusCard,
          this.lang.fallbacks.nodeConfigSamples.activityFeed,
        ];
      case 'bucket':
        return ['public-assets', 'private-documents', 'workflow-uploads'];
      default:
        return [];
    }
  }

  private sampleValueForField(field: WorkflowNodeConfigField): unknown {
    if (field.type === 'toggle') {
      return true;
    }

    if (field.type === 'number') {
      return 25;
    }

    if (field.type === 'select') {
      return this.fieldOptions(field)[0]?.value ?? field.placeholder ?? field.label;
    }

    switch (field.type) {
      case 'emailList':
        return ['ops.user@quanta.local'];
      case 'keyValue':
        return { status: 'active' };
      case 'json':
      case 'schema':
        return { sample: true };
      case 'mapping':
        return { value: '{{start.payload}}' };
      case 'ruleBuilder':
        return {
          logic: 'AND',
          items: [
            {
              id: 'rule_sample_required_name',
              field: 'firstName',
              operator: 'is_not_empty',
              value: '',
              message: this.lang.samples.firstNameRequired,
            },
            {
              id: 'rule_sample_valid_email',
              connector: 'AND',
              field: 'email',
              operator: 'is_email',
              value: '',
              message: this.lang.samples.validEmailRequired,
            },
          ],
        };
      case 'fileMapping':
        return { source: '{{start.file}}', name: 'sample.pdf' };
      case 'multiSelect':
        return [this.lang.fallbacks.nodeConfigSamples.admin];
      case 'duration':
        return '30s';
      case 'code':
        return 'return input;';
      case 'textarea':
        return this.sampleTextForField(field);
      default:
        return this.sampleTextForField(field);
    }
  }

  private sampleTextForField(field: WorkflowNodeConfigField): string {
    switch (field.key) {
      case 'to':
        return 'ops.user@quanta.local';
      case 'subject':
        return this.lang.nodeConfig.defaults.workflowNotification;
      case 'body':
        return this.lang.fallbacks.nodeConfigSamples.workflowNotificationBody;
      case 'target':
        return '/customers/{{record.id}}';
      default:
        return field.placeholder ?? `Sample ${field.label}`;
    }
  }

  private datasourceOptions(): SelectOption[] {
    const formDatasourceOptions = this.formDatasourceQueries().map((query) => [
      query.datasourceId,
      {
        label: query.datasourceLabel,
        value: query.datasourceId,
      },
    ] as const);
    const staticDatasourceOptions = WORKFLOW_DATASOURCE_QUERIES.map((item) => [
      item.datasourceId,
      {
        label: item.datasourceLabel,
        value: item.datasourceId,
      },
    ] as const);

    return [...new Map([...formDatasourceOptions, ...staticDatasourceOptions]).values()];
  }

  private queryOptions(): readonly string[] {
    const config = this.node()?.config ?? {};
    const datasource = typeof config['datasource'] === 'string' ? config['datasource'] : '';
    const method = typeof config['method'] === 'string' ? config['method'] : this.lang.fallbacks.nodeConfigSamples.allMethods;

    return WORKFLOW_DATASOURCE_QUERIES
      .filter((item) => !datasource || item.datasourceId === datasource)
      .filter((item) => method === this.lang.fallbacks.nodeConfigSamples.allMethods || item.method === method)
      .map((item) => item.endpoint);
  }

  private querySelectOptions(): SelectOption[] {
    const config = this.node()?.config ?? {};
    const datasource = typeof config['datasource'] === 'string' ? config['datasource'] : '';
    const method = typeof config['method'] === 'string' ? config['method'] : this.lang.fallbacks.nodeConfigSamples.allMethods;
    const formQueryOptions = this.formDatasourceQueries()
      .filter((query) => !datasource || query.datasourceId === datasource)
      .filter((query) => method === this.lang.fallbacks.nodeConfigSamples.allMethods || query.method === method)
      .map((query) => ({
        label: query.queryQualifiedName || query.queryLabel,
        value: query.queryId,
      }));
    const staticQueryOptions = this.queryOptions().map((option) => ({
      label: option,
      value: option,
    }));

    return [...formQueryOptions, ...staticQueryOptions];
  }

  private formFieldOptions(): SelectOption[] {
    return this.formFields().map((field) => ({
      label: field.label,
      value: field.name || field.id,
    }));
  }

  private selectedFormQuery(): WorkflowFormDatasourceQuery | null {
    const config = this.node()?.config ?? {};
    const queryId = typeof config['query'] === 'string' ? config['query'] : '';
    const datasource = typeof config['datasource'] === 'string' ? config['datasource'] : '';

    return (
      this.formDatasourceQueries().find((query) => query.queryId === queryId) ??
      this.formDatasourceQueries().find((query) => query.datasourceId === datasource) ??
      null
    );
  }

  private syncMethodFromQuery(nodeId: string, value: unknown): void {
    if (typeof value !== 'string') {
      return;
    }

    const formQuery = this.formDatasourceQueries().find((query) => query.queryId === value);
    const method = formQuery?.method ?? value.split(' ')[0];

    if (method !== 'GET' && method !== 'POST' && method !== 'PUT' && method !== 'PATCH' && method !== 'DELETE') {
      return;
    }

    this.configChange.emit({
      nodeId,
      key: 'method',
      value: method,
    });
  }

  private syncFormQueryDetails(nodeId: string, value: unknown): void {
    if (typeof value !== 'string') {
      return;
    }

    const formQuery = this.formDatasourceQueries().find((query) => query.queryId === value);

    if (!formQuery) {
      return;
    }

    this.configChange.emit({
      nodeId,
      key: 'queryText',
      value: formQuery.queryText ?? '',
    });
    this.configChange.emit({
      nodeId,
      key: 'queryQualifiedName',
      value: formQuery.queryQualifiedName ?? formQuery.queryLabel,
    });
  }

  private serializeComplexValue(value: unknown): string {
    if (value === undefined || value === null || value === '') {
      return '';
    }

    if (typeof value === 'string') {
      return value;
    }

    return JSON.stringify(value, null, 2);
  }

  private isEmptyValue(value: unknown): boolean {
    if (value === undefined || value === null || value === '') {
      return true;
    }

    if (Array.isArray(value)) {
      return value.length === 0;
    }

    if (typeof value === 'object') {
      if ('items' in value && Array.isArray((value as { items: unknown[] }).items)) {
        return (value as { items: unknown[] }).items.length === 0;
      }

      return Object.keys(value).length === 0;
    }

    return false;
  }
}
