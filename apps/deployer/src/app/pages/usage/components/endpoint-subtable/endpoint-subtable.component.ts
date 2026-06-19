import { ChangeDetectionStrategy, Component, computed, input, inject } from '@angular/core';
import { DeployerI18nService } from '../../../../services/deployer-i18n.service';
import {
  BadgeColor,
  QoBadgeComponent,
  QoButtonComponent,
  QoEmptyStateComponent,
  QoTableColumnDirective,
  QoTableComponent,
  QoTableEmptyDirective,
  TableRow
} from '@qo/ui-components';

export interface UsageEndpointRow {
  id: string;
  endpoint: string;
  method: string;
  requests: string;
  latency: string;
  p95: string;
  errorRate: string;
  duplicates: string;
  retryCount: string;
  auth: string;
  access: string;
}

@Component({
  selector: 'app-endpoint-subtable',
  standalone: true,
  imports: [QoBadgeComponent, QoButtonComponent, QoEmptyStateComponent, QoTableColumnDirective, QoTableComponent, QoTableEmptyDirective],
  
  templateUrl: './endpoint-subtable.component.html',
  styleUrl: './endpoint-subtable.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EndpointSubtableComponent {
  readonly i18n = inject(DeployerI18nService);
  readonly endpoints = input.required<readonly UsageEndpointRow[]>();
  readonly endpointRows = computed<TableRow[]>(() => [...this.endpoints()] as unknown as TableRow[]);

  methodColor(method: string): BadgeColor {
    switch (method.trim().toUpperCase()) {
      case 'GET':
        return 'success';
      case 'POST':
      case 'PUT':
      case 'PATCH':
        return 'warning';
      case 'DELETE':
        return 'danger';
      default:
        return 'default';
    }
  }

  methodToneClass(method: string): string {
    return `method-badge--${this.methodColor(method)}`;
  }
}
