import { Injectable } from '@angular/core';
import { PageBuilderExpressionResolverService } from '@builder/features/page-builder/services/page-builder-expression-resolver.service';
import { DataBindingConfig } from '@builder/features/page-builder/models/data-binding.model';
import { SearchCriteriaRow } from '@builder/features/page-builder/components/panel-config/search/search-criteria-modal';

@Injectable({ providedIn: 'root' })
export class PageBuilderDataBindingService {
  inferMode(input: string): DataBindingConfig['mode'] {
    const trimmed = input.trim();
    if (!trimmed) {
      return 'static';
    }

    const exactToken = this.extractExactToken(trimmed);
    if (!exactToken) {
      return 'static';
    }

    if (this.isFunctionExpression(exactToken)) {
      return 'formula';
    }

    if (exactToken.startsWith('page.') || exactToken.startsWith('globals.')) {
      return 'page';
    }

    if (exactToken.startsWith('widgets.')) {
      return 'widget';
    }

    if (exactToken.startsWith('datasources.')) {
      return 'query-field';
    }

    return 'expression';
  }

  wrapExpression(expression: string): string {
    const trimmed = expression.trim();
    if (!trimmed) {
      return '';
    }

    return trimmed.startsWith('{{') ? trimmed : `{{${trimmed}}}`;
  }

  unwrapExpression(expression: string): string {
    const trimmed = expression.trim();
    const exactMatch = trimmed.match(/^\{\{\s*([^}]+?)\s*\}\}$/);
    return exactMatch?.[1]?.trim() ?? trimmed;
  }

  extractBindingPath(expression: string): string {
    return this.unwrapExpression(expression);
  }

  extractDatasourceId(expression: string): string {
    const path = this.extractBindingPath(expression);
    const match = path.match(/^datasources\.([^.]+)\.queries\./);
    return match?.[1] ?? '';
  }

  extractQueryId(expression: string, datasourceId = ''): string {
    const path = this.extractBindingPath(expression);
    const match = path.match(/^datasources\.([^.]+)\.queries\.([^.[]+)/);
    if (!match) {
      return '';
    }

    if (datasourceId && match[1] !== datasourceId) {
      return '';
    }

    return match[2] ?? '';
  }

  extractFirstDatasourceQueryRef(expression: string): { datasourceId: string; queryId: string } | null {
    const match = expression.match(/datasources\.([^.]+)\.queries\.([^.()[\s]+)/);
    if (!match) {
      return null;
    }

    return {
      datasourceId: match[1] ?? '',
      queryId: match[2] ?? '',
    };
  }

  buildDatasourceQueryExpression(datasourceId: string, queryId: string): string {
    if (!datasourceId.trim() || !queryId.trim()) {
      return '';
    }

    return `{{datasources.${datasourceId.trim()}.queries.${queryId.trim()}}}`;
  }

  buildDatasourceFieldExpression(datasourceId: string, queryId: string, field: string, recordIndex = 0): string {
    if (!datasourceId.trim() || !queryId.trim() || !field.trim()) {
      return '';
    }

    return `{{datasources.${datasourceId.trim()}.queries.${queryId.trim()}.data[${Math.max(0, recordIndex)}].${field.trim()}}}`;
  }

  resolveRowsFromExpression(
    expression: string,
    expressionResolver: PageBuilderExpressionResolverService,
  ): Array<Record<string, unknown>> {
    const trimmed = expression.trim();
    if (!trimmed) {
      return [];
    }

    const inlineRows = this.tryParseJsonRows(trimmed);
    if (inlineRows.length) {
      return inlineRows;
    }

    return this.coerceRows(expressionResolver.resolve(this.wrapExpression(trimmed)));
  }

  resolveRowsFromValue(value: unknown): Array<Record<string, unknown>> {
    return this.coerceRows(value);
  }

  resolveBindingValue(binding: Pick<DataBindingConfig, 'expression' | 'fallbackValue'>, resolver: (expression: string) => unknown): unknown {
    const rawInput = binding.expression.trim();
    if (!rawInput) {
      return binding.fallbackValue;
    }

    const resolved = this.resolveInput(rawInput, resolver);
    return resolved == null || resolved === '' ? binding.fallbackValue : resolved;
  }

  resolveInput(input: string, resolver: (expression: string) => unknown): unknown {
    const trimmed = input.trim();
    if (!trimmed) {
      return '';
    }

    const exactToken = this.extractExactToken(trimmed);
    if (exactToken) {
      return this.evaluateToken(exactToken, resolver);
    }

    if (!trimmed.includes('{{')) {
      return trimmed;
    }

    return trimmed.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_match, token) =>
      this.stringifyValue(this.evaluateToken(String(token).trim(), resolver)),
    );
  }

  applyFormat(value: unknown, format: string): string {
    if (value == null || value === '') {
      return '';
    }

    const trimmedFormat = format.trim();
    if (!trimmedFormat) {
      return this.stringifyValue(value);
    }

    if (trimmedFormat.toLowerCase() === 'currency' && typeof value === 'number') {
      return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(value);
    }

    return `${this.stringifyValue(value)}${trimmedFormat.startsWith(' ') ? trimmedFormat : ` ${trimmedFormat}`}`.trim();
  }

  buildLegacyCriteriaRule(expression: string): SearchCriteriaRow | null {
    const parsed = this.parseFilterComparison(expression);
    if (!parsed) {
      return null;
    }

    return {
      id: `binding-rule-${parsed.field}-${parsed.operator}`,
      field: parsed.field,
      operator: parsed.operator,
      value: parsed.value,
      joiner: 'AND',
    };
  }

  private evaluateToken(token: string, resolver: (expression: string) => unknown): unknown {
    if (this.isFunctionExpression(token)) {
      return this.evaluateFunction(token, resolver);
    }

    return resolver(this.wrapExpression(token));
  }

  private evaluateFunction(token: string, resolver: (expression: string) => unknown): unknown {
    const match = token.match(/^([a-zA-Z_][\w]*)\((.*)\)$/s);
    if (!match) {
      return '';
    }

    const functionName = (match[1] ?? '').trim().toLowerCase();
    const args = this.splitArguments(match[2] ?? '').map((arg) => arg.trim());
    const firstArg = args[0] ? this.resolveArgument(args[0], resolver) : '';

    switch (functionName) {
      case 'count':
        return Array.isArray(firstArg) ? firstArg.length : firstArg == null || firstArg === '' ? 0 : 1;
      case 'sum':
        return this.aggregateValues(firstArg, args[1], 'sum');
      case 'average':
      case 'avg':
        return this.aggregateValues(firstArg, args[1], 'average');
      case 'min':
        return this.aggregateValues(firstArg, args[1], 'min');
      case 'max':
        return this.aggregateValues(firstArg, args[1], 'max');
      case 'median':
        return this.aggregateValues(firstArg, args[1], 'median');
      case 'distinct_count':
      case 'distinctcount':
        return this.aggregateValues(firstArg, args[1], 'distinct_count');
      case 'filter': {
        const rows = this.coerceRows(firstArg);
        const comparison = args[1] ? this.parseFilterComparison(this.stripQuotes(args[1])) : null;
        if (!comparison) {
          return rows;
        }

        return rows.filter((row) => this.matchesComparison(row, comparison.field, comparison.operator, comparison.value));
      }
      default:
        return resolver(this.wrapExpression(token));
    }
  }

  private resolveArgument(argument: string, resolver: (expression: string) => unknown): unknown {
    const trimmed = argument.trim();
    if (!trimmed) {
      return '';
    }

    if (this.isQuoted(trimmed)) {
      return this.stripQuotes(trimmed);
    }

    if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
      return Number(trimmed);
    }

    if (this.isFunctionExpression(trimmed)) {
      return this.evaluateFunction(trimmed, resolver);
    }

    return resolver(this.wrapExpression(trimmed));
  }

  private aggregateValues(
    source: unknown,
    fieldArgument: string | undefined,
    type: 'sum' | 'average' | 'min' | 'max' | 'median' | 'distinct_count',
  ): number {
    const field = fieldArgument ? this.stripQuotes(fieldArgument.trim()) : '';
    const values = this.resolveAggregateNumbers(source, field);

    if (type === 'distinct_count') {
      const distinctValues = this.resolveAggregateRawValues(source, field);
      return new Set(distinctValues.map((value) => this.stringifyValue(value)).filter(Boolean)).size;
    }

    if (!values.length) {
      return 0;
    }

    switch (type) {
      case 'sum':
        return values.reduce((sum, value) => sum + value, 0);
      case 'average':
        return values.reduce((sum, value) => sum + value, 0) / values.length;
      case 'min':
        return Math.min(...values);
      case 'max':
        return Math.max(...values);
      case 'median': {
        const sorted = [...values].sort((left, right) => left - right);
        const midpoint = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0 ? (sorted[midpoint - 1] + sorted[midpoint]) / 2 : sorted[midpoint];
      }
      default:
        return 0;
    }
  }

  private resolveAggregateNumbers(source: unknown, field: string): number[] {
    return this.resolveAggregateRawValues(source, field)
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value));
  }

  private resolveAggregateRawValues(source: unknown, field: string): unknown[] {
    if (Array.isArray(source)) {
      return source
        .map((item) => (field && item && typeof item === 'object' ? (item as Record<string, unknown>)[field] : item))
        .filter((value) => value != null && value !== '');
    }

    if (source && typeof source === 'object' && field) {
      const value = (source as Record<string, unknown>)[field];
      return value == null || value === '' ? [] : [value];
    }

    return source == null || source === '' ? [] : [source];
  }

  private splitArguments(argumentText: string): string[] {
    const args: string[] = [];
    let current = '';
    let depth = 0;
    let quote: '"' | "'" | null = null;

    for (const char of argumentText) {
      if (quote) {
        current += char;
        if (char === quote) {
          quote = null;
        }
        continue;
      }

      if (char === '"' || char === "'") {
        quote = char;
        current += char;
        continue;
      }

      if (char === '(') {
        depth += 1;
        current += char;
        continue;
      }

      if (char === ')') {
        depth = Math.max(0, depth - 1);
        current += char;
        continue;
      }

      if (char === ',' && depth === 0) {
        args.push(current.trim());
        current = '';
        continue;
      }

      current += char;
    }

    if (current.trim()) {
      args.push(current.trim());
    }

    return args;
  }

  private extractExactToken(input: string): string | null {
    const exactMatch = input.match(/^\{\{\s*([^}]+?)\s*\}\}$/s);
    return exactMatch?.[1]?.trim() ?? null;
  }

  private isFunctionExpression(token: string): boolean {
    return /^[a-zA-Z_][\w]*\(.+\)$/s.test(token.trim());
  }

  private isQuoted(value: string): boolean {
    return (value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"));
  }

  private stripQuotes(value: string): string {
    return this.isQuoted(value) ? value.slice(1, -1) : value;
  }

  private parseFilterComparison(value: string): { field: string; operator: string; value: string } | null {
    const match = value.trim().match(/^([A-Za-z0-9_.$[\]]+)\s*(equals|notEquals|contains|startsWith|endsWith|greaterThan|lessThan)\s*(.+)$/);
    if (!match) {
      return null;
    }

    return {
      field: match[1] ?? '',
      operator: match[2] ?? '',
      value: this.stripQuotes((match[3] ?? '').trim()),
    };
  }

  private matchesComparison(row: Record<string, unknown>, field: string, operator: string, expectedValue: string): boolean {
    const left = String(row[field] ?? '').toLowerCase();
    const right = expectedValue.toLowerCase();
    const leftNumber = Number(row[field]);
    const rightNumber = Number(expectedValue);

    switch (operator) {
      case 'equals':
        return left === right;
      case 'notEquals':
        return left !== right;
      case 'contains':
        return left.includes(right);
      case 'startsWith':
        return left.startsWith(right);
      case 'endsWith':
        return left.endsWith(right);
      case 'greaterThan':
        return Number.isFinite(leftNumber) && Number.isFinite(rightNumber) && leftNumber > rightNumber;
      case 'lessThan':
        return Number.isFinite(leftNumber) && Number.isFinite(rightNumber) && leftNumber < rightNumber;
      default:
        return false;
    }
  }

  private stringifyValue(value: unknown): string {
    if (value == null) {
      return '';
    }

    if (typeof value === 'string') {
      return value;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }

    return JSON.stringify(value);
  }

  private coerceRows(value: unknown): Array<Record<string, unknown>> {
    if (Array.isArray(value)) {
      return value.filter((row): row is Record<string, unknown> => !!row && typeof row === 'object');
    }

    if (value && typeof value === 'object') {
      const candidate = value as Record<string, unknown>;
      if (Array.isArray(candidate['data'])) {
        return candidate['data'].filter((row): row is Record<string, unknown> => !!row && typeof row === 'object');
      }

      return [candidate];
    }

    return [];
  }

  private tryParseJsonRows(binding: string): Array<Record<string, unknown>> {
    const trimmed = binding.trim();
    if (!trimmed || (!trimmed.startsWith('{') && !trimmed.startsWith('['))) {
      return [];
    }

    try {
      return this.coerceRows(JSON.parse(trimmed) as unknown);
    } catch {
      return [];
    }
  }
}
