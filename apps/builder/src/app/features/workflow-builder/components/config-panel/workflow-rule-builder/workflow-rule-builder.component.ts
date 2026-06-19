import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoDirective } from '@jsverse/transloco';
import { FormField } from '@qo/models';
import { QoIconComponent, QoInputComponent, QoSelectComponent, SelectOption } from '@qo/ui-components';
import { WORKFLOW_LANGUAGE } from '../../../services/workflow-language';

export type WorkflowRuleConnector = 'AND' | 'OR';

export interface WorkflowRuleItem {
  id: string;
  connector?: WorkflowRuleConnector;
  field: string;
  operator: string;
  value: string;
  message: string;
}

export interface WorkflowRuleSet {
  logic: WorkflowRuleConnector;
  items: WorkflowRuleItem[];
}

interface RuleOperator {
  label: string;
  value: string;
  valueRequired: boolean;
}

const DEFAULT_OPERATORS: readonly RuleOperator[] = [
  { label: WORKFLOW_LANGUAGE.options.ruleOperator.equals, value: 'equals', valueRequired: true },
  { label: WORKFLOW_LANGUAGE.options.ruleOperator.notEquals, value: 'not_equals', valueRequired: true },
  { label: WORKFLOW_LANGUAGE.options.ruleOperator.isEmpty, value: 'is_empty', valueRequired: false },
  { label: WORKFLOW_LANGUAGE.options.ruleOperator.isNotEmpty, value: 'is_not_empty', valueRequired: false },
  { label: WORKFLOW_LANGUAGE.options.ruleOperator.contains, value: 'contains', valueRequired: true },
  { label: WORKFLOW_LANGUAGE.options.ruleOperator.startsWith, value: 'starts_with', valueRequired: true },
  { label: WORKFLOW_LANGUAGE.options.ruleOperator.endsWith, value: 'ends_with', valueRequired: true },
  { label: WORKFLOW_LANGUAGE.options.ruleOperator.greaterThan, value: 'greater_than', valueRequired: true },
  { label: WORKFLOW_LANGUAGE.options.ruleOperator.lessThan, value: 'less_than', valueRequired: true },
  { label: WORKFLOW_LANGUAGE.options.ruleOperator.isEmail, value: 'is_email', valueRequired: false },
  { label: WORKFLOW_LANGUAGE.options.ruleOperator.matchesRegex, value: 'matches_regex', valueRequired: true },
];

@Component({
  selector: 'app-workflow-rule-builder',
  standalone: true,
  imports: [CommonModule, TranslocoDirective, QoIconComponent, QoInputComponent, QoSelectComponent],
  templateUrl: './workflow-rule-builder.component.html',
  styleUrl: './workflow-rule-builder.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkflowRuleBuilderComponent {
  readonly lang = WORKFLOW_LANGUAGE;
  readonly fields = input<readonly FormField[]>([]);
  readonly value = input<unknown>(null);
  readonly valueChange = output<WorkflowRuleSet>();
  readonly logicOptions: SelectOption[] = [
    { label: this.lang.options.logic.and, value: 'AND' },
    { label: this.lang.options.logic.or, value: 'OR' },
  ];

  readonly rules = computed(() => this.normalizeRuleSet(this.value()));
  readonly fieldOptions = computed(() => {
    const fields = this.fields();

    if (fields.length) {
      return fields.map((field) => ({
        label: field.label,
        value: field.name || field.id,
      }));
    }

    return [
      { label: this.lang.options.sampleFields.firstName, value: 'firstName' },
      { label: this.lang.options.sampleFields.lastName, value: 'lastName' },
      { label: this.lang.options.sampleFields.emailAddress, value: 'email' },
      { label: this.lang.options.sampleFields.department, value: 'department' },
      { label: this.lang.options.sampleFields.joiningDate, value: 'joiningDate' },
      { label: this.lang.options.sampleFields.employmentType, value: 'employmentType' },
      { label: this.lang.options.sampleFields.mobileNumber, value: 'mobileNumber' },
      { label: this.lang.options.sampleFields.managerComments, value: 'managerComments' },
    ];
  });

  readonly operators = DEFAULT_OPERATORS;
  readonly operatorOptions = computed<SelectOption[]>(() =>
    this.operators.map((operator) => ({
      label: operator.label,
      value: operator.value,
    }))
  );

  trackRule(_: number, rule: WorkflowRuleItem): string {
    return rule.id;
  }

  addRule(): void {
    const current = this.rules();
    this.emitRules({
      ...current,
      items: [
        ...current.items,
        {
          id: this.createRuleId(),
          connector: current.items.length === 0 ? undefined : current.logic,
          field: '',
          operator: '',
          value: '',
          message: '',
        },
      ],
    });
  }

  removeRule(ruleId: string): void {
    const current = this.rules();
    const items = current.items
      .filter((rule) => rule.id !== ruleId)
      .map((rule, index) => ({
        ...rule,
        connector: index === 0 ? undefined : rule.connector ?? current.logic,
      }));

    this.emitRules({ ...current, items });
  }

  updateRule(ruleId: string, key: keyof WorkflowRuleItem, value: string): void {
    const current = this.rules();
    const items = current.items.map((rule) => {
      if (rule.id !== ruleId) {
        return rule;
      }

      const nextRule = { ...rule, [key]: value };

      if (key === 'operator' && !this.operatorRequiresValue(value)) {
        nextRule.value = '';
      }

      return nextRule;
    });

    this.emitRules({ ...current, items });
  }

  updateConnector(ruleId: string, connector: WorkflowRuleConnector): void {
    this.updateRule(ruleId, 'connector', connector);
  }

  updateDefaultLogic(logic: WorkflowRuleConnector): void {
    const current = this.rules();
    const items = current.items.map((rule, index) => ({
      ...rule,
      connector: index === 0 ? undefined : rule.connector ?? logic,
    }));

    this.emitRules({ logic, items });
  }

  operatorRequiresValue(operator: string): boolean {
    return this.operators.find((candidate) => candidate.value === operator)?.valueRequired ?? true;
  }

  private emitRules(rules: WorkflowRuleSet): void {
    this.valueChange.emit({
      logic: rules.logic,
      items: rules.items.map((rule, index) => ({
        ...rule,
        connector: index === 0 ? undefined : rule.connector ?? rules.logic,
      })),
    });
  }

  private normalizeRuleSet(value: unknown): WorkflowRuleSet {
    if (this.isRuleSet(value)) {
      return {
        logic: value.logic === 'OR' ? 'OR' : 'AND',
        items: value.items.map((item, index) => this.normalizeRuleItem(item, index, value.logic)),
      };
    }

    if (this.isLegacySingleRule(value)) {
      return {
        logic: 'AND',
        items: [this.normalizeRuleItem(value, 0, 'AND')],
      };
    }

    return { logic: 'AND', items: [] };
  }

  private normalizeRuleItem(value: unknown, index: number, defaultConnector: WorkflowRuleConnector): WorkflowRuleItem {
    const record = typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};
    const connector = record['connector'] === 'OR' ? 'OR' : defaultConnector;

    return {
      id: typeof record['id'] === 'string' && record['id'] ? record['id'] : this.createRuleId(index),
      connector: index === 0 ? undefined : connector,
      field: this.asString(record['field']),
      operator: this.asString(record['operator']),
      value: this.asString(record['value']),
      message: this.asString(record['message']),
    };
  }

  private isRuleSet(value: unknown): value is WorkflowRuleSet {
    return typeof value === 'object' && value !== null && Array.isArray((value as WorkflowRuleSet).items);
  }

  private isLegacySingleRule(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && ('field' in value || 'operator' in value || 'value' in value);
  }

  private asString(value: unknown): string {
    return value == null ? '' : String(value);
  }

  private createRuleId(seed = Date.now()): string {
    return `rule_${seed}_${Math.random().toString(36).slice(2, 8)}`;
  }
}
