import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  QoEmptyStateComponent,
  QoPageSectionComponent,
  QoTableColumnDirective,
  QoTableComponent,
  QoTableEmptyDirective,
  TableRow
} from '@qo/ui-components';
import { AuditFacadeService } from '../../services/audit-facade.service';
import { DeployerI18nService } from '../../../../services/deployer-i18n.service';

@Component({
  selector: 'app-audit-page',
  standalone: true,
  imports: [
    QoEmptyStateComponent,
    QoPageSectionComponent,
    QoTableColumnDirective,
    QoTableComponent,
    QoTableEmptyDirective
  ],
  
  templateUrl: './audit-page.component.html',
  styleUrl: './audit-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuditPageComponent {
  private readonly facade = inject(AuditFacadeService);
  readonly i18n = inject(DeployerI18nService);

  readonly records = this.facade.records;
  readonly recordRows = () => this.records() as unknown as TableRow[];
}
