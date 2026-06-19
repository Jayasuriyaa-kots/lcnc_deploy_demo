import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import {
  BadgeColor,
  QoAvatarBadgeComponent,
  QoBadgeComponent,
  QoButtonComponent,
  QoEmptyStateComponent,
  QoTableColumnDirective,
  QoTableComponent,
  QoTableEmptyDirective,
  TableRow
} from '@qo/ui-components';
import { UserModel } from '../../models';
import { DeployerI18nService } from '../../../../services/deployer-i18n.service';

export interface UserTableMeta {
  department: string;
  lastLoginDetail: string;
}

@Component({
  selector: 'app-user-table',
  standalone: true,
  imports: [
    QoAvatarBadgeComponent,
    QoBadgeComponent,
    QoButtonComponent,
    QoEmptyStateComponent,
    QoTableColumnDirective,
    QoTableComponent,
    QoTableEmptyDirective
  ],
  templateUrl: './user-table.component.html',
  styleUrl: './user-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserTableComponent {
  readonly i18n = inject(DeployerI18nService);
  readonly users = input.required<readonly UserModel[]>();
  readonly userMeta = input.required<Record<string, UserTableMeta>>();
  readonly userRows = computed<TableRow[]>(() => [...this.users()] as unknown as TableRow[]);
  readonly edit = output<string>();
  readonly resetPassword = output<string>();
  readonly toggleStatus = output<string>();

  metaFor(user: UserModel): UserTableMeta {
    return this.userMeta()[user.id] ?? { department: this.i18n.translate('users.teamMember'), lastLoginDetail: '' };
  }

  badgeColor(status: UserModel['status']): BadgeColor {
    return status === 'active' ? 'success' : 'default';
  }
}
