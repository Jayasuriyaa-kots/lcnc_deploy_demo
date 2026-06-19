import { REPORTS_LANG } from '../lang/reports.lang';
export type ReportFilterFieldCategory =
  | 'text'
  | 'number'
  | 'date'
  | 'time'
  | 'datetime'
  | 'singleChoice'
  | 'multiChoice'
  | 'boolean'
  | 'media';

export interface ReportFilterOperatorOption {
  value: string;
  label: string;
}

const VALUELESS_OPERATORS = new Set<string>([
  'isEmpty',
  'isNotEmpty',
  'isChecked',
  'isUnchecked',
]);

const MULTI_VALUE_TEXT_OPERATORS = new Set<string>([
  'containsAnyOf',
  'containsAllOf',
]);

/** Classifies a raw field-type string into a filter field category. */
export function getReportFilterFieldCategory(
  fieldType: string
): ReportFilterFieldCategory {
  const normalized = fieldType.trim().toLowerCase();

  if (
    normalized.includes('number') ||
    normalized.includes('decimal') ||
    normalized.includes('percent') ||
    normalized.includes('currency')
  ) {
    return 'number';
  }

  if (normalized.includes('date') && normalized.includes('time')) {
    return 'datetime';
  }

  if (normalized.includes('date')) {
    return 'date';
  }

  if (normalized.includes('time')) {
    return 'time';
  }

  if (normalized.includes('dropdown') || normalized.includes('radio')) {
    return 'singleChoice';
  }

  if (
    normalized.includes('checkbox') ||
    normalized.includes('multi select') ||
    normalized.includes('multiselect')
  ) {
    return 'multiChoice';
  }

  if (normalized.includes('decision box') || normalized.includes('boolean')) {
    return 'boolean';
  }

  if (
    normalized.includes('file upload') ||
    normalized.includes('image') ||
    normalized.includes('audio') ||
    normalized.includes('video') ||
    normalized.includes('signature')
  ) {
    return 'media';
  }

  return 'text';
}

/** Returns the operator options valid for a field type's category. */
export function getReportFilterOperators(
  fieldType: string
): ReportFilterOperatorOption[] {
  switch (getReportFilterFieldCategory(fieldType)) {
    case 'number':
      return [
        { value: 'is', label: REPORTS_LANG.operators.is },
        { value: 'isNot', label: REPORTS_LANG.operators.isNot },
        { value: 'greaterThan', label: REPORTS_LANG.operators.greaterThan },
        { value: 'greaterThanOrEqual', label: REPORTS_LANG.operators.greaterThanOrEqual },
        { value: 'lessThan', label: REPORTS_LANG.operators.lessThan },
        { value: 'lessThanOrEqual', label: REPORTS_LANG.operators.lessThanOrEqual },
        { value: 'between', label: REPORTS_LANG.operators.between },
        { value: 'isEmpty', label: REPORTS_LANG.operators.isEmpty },
        { value: 'isNotEmpty', label: REPORTS_LANG.operators.isNotEmpty },
      ];

    case 'date':
    case 'time':
    case 'datetime':
      return [
        { value: 'is', label: REPORTS_LANG.operators.is },
        { value: 'isNot', label: REPORTS_LANG.operators.isNot },
        { value: 'before', label: REPORTS_LANG.operators.before },
        { value: 'after', label: REPORTS_LANG.operators.after },
        { value: 'onOrBefore', label: REPORTS_LANG.operators.onOrBefore },
        { value: 'onOrAfter', label: REPORTS_LANG.operators.onOrAfter },
        { value: 'between', label: REPORTS_LANG.operators.between },
        { value: 'isEmpty', label: REPORTS_LANG.operators.isEmpty },
        { value: 'isNotEmpty', label: REPORTS_LANG.operators.isNotEmpty },
      ];

    case 'singleChoice':
      return [
        { value: 'is', label: REPORTS_LANG.operators.is },
        { value: 'isNot', label: REPORTS_LANG.operators.isNot },
        { value: 'isEmpty', label: REPORTS_LANG.operators.isEmpty },
        { value: 'isNotEmpty', label: REPORTS_LANG.operators.isNotEmpty },
      ];

    case 'multiChoice':
      return [
        { value: 'contains', label: REPORTS_LANG.operators.contains },
        { value: 'notContains', label: REPORTS_LANG.operators.doesNotContain },
        { value: 'containsAnyOf', label: REPORTS_LANG.operators.containsAnyOf },
        { value: 'containsAllOf', label: REPORTS_LANG.operators.containsAllOf },
        { value: 'isEmpty', label: REPORTS_LANG.operators.isEmpty },
        { value: 'isNotEmpty', label: REPORTS_LANG.operators.isNotEmpty },
      ];

    case 'boolean':
      return [
        { value: 'isChecked', label: REPORTS_LANG.operators.isChecked },
        { value: 'isUnchecked', label: REPORTS_LANG.operators.isUnchecked },
      ];

    case 'media':
      return [
        { value: 'isEmpty', label: REPORTS_LANG.operators.isEmpty },
        { value: 'isNotEmpty', label: REPORTS_LANG.operators.isNotEmpty },
      ];

    default:
      return [
        { value: 'is', label: REPORTS_LANG.operators.is },
        { value: 'isNot', label: REPORTS_LANG.operators.isNot },
        { value: 'contains', label: REPORTS_LANG.operators.contains },
        { value: 'notContains', label: REPORTS_LANG.operators.doesNotContain },
        { value: 'startsWith', label: REPORTS_LANG.operators.startsWith },
        { value: 'endsWith', label: REPORTS_LANG.operators.endsWith },
        { value: 'isEmpty', label: REPORTS_LANG.operators.isEmpty },
        { value: 'isNotEmpty', label: REPORTS_LANG.operators.isNotEmpty },
      ];
  }
}

/** Whether an operator requires a value input (vs. valueless like "is empty"). */
export function filterOperatorNeedsValue(operator: string): boolean {
  return !VALUELESS_OPERATORS.has(operator);
}

/** Whether an operator is the "between" (range) operator. */
export function isBetweenFilterOperator(operator: string): boolean {
  return operator === 'between';
}

/** HTML input `type` appropriate for a field type's category. */
export function getFilterInputTypeByFieldType(fieldType: string): string {
  switch (getReportFilterFieldCategory(fieldType)) {
    case 'number':
      return 'number';

    case 'date':
      return 'date';

    case 'time':
      return 'time';

    case 'datetime':
      return 'datetime-local';

    default:
      return 'text';
  }
}

/** Placeholder text for a single-value filter input given the operator. */
export function getFilterValuePlaceholder(operator: string): string {
  if (MULTI_VALUE_TEXT_OPERATORS.has(operator)) {
    return REPORTS_LANG.filters.valueMulti;
  }

  return REPORTS_LANG.filters.value;
}

/** Placeholder for one side of a range input (From/To for dates, Min/Max else). */
export function getFilterRangePlaceholder(
  fieldType: string,
  side: 'start' | 'end'
): string {
  const category = getReportFilterFieldCategory(fieldType);

  if (category === 'date' || category === 'time' || category === 'datetime') {
    return side === 'start' ? REPORTS_LANG.filters.from : REPORTS_LANG.filters.to;
  }

  return side === 'start' ? REPORTS_LANG.filters.min : REPORTS_LANG.filters.max;
}