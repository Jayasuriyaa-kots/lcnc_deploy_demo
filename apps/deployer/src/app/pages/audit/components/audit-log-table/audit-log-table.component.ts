import { ChangeDetectionStrategy, Component, input, inject } from '@angular/core';
import { DeployerI18nService } from '../../../../services/deployer-i18n.service';
import {
  QoEmptyStateComponent,
  QoTableColumnDirective,
  QoTableComponent,
  QoTableEmptyDirective,
  TableRow
} from '@qo/ui-components';
import { AuditRecord } from '../../models';

@Component({
  selector: 'app-audit-log-table',
  standalone: true,
  imports: [QoEmptyStateComponent, QoTableColumnDirective, QoTableComponent, QoTableEmptyDirective],
  
  templateUrl: './audit-log-table.component.html',
  styleUrl: './audit-log-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuditLogTableComponent {
  readonly i18n = inject(DeployerI18nService);
  readonly records = input.required<AuditRecord[]>();
  readonly recordRows = () => this.records() as unknown as TableRow[];
}
