import { ChangeDetectionStrategy, Component, effect, input, output, signal, inject } from '@angular/core';
import { ReportActionGroup } from '@builder/report-builder/models';
import { QoButtonComponent, QoCheckboxComponent } from '@qo/ui-components';


/**
 * Detail View → Actions sub-panel. Toggles the per-record detail actions, keeping
 * a local working copy and emitting it upward on every change.
 */
import { ReportBuilderI18nService } from '../../../../services/report-builder-i18n.service';
@Component({
  selector: 'app-report-detail-view-actions',
  standalone: true,
  imports: [QoButtonComponent, QoCheckboxComponent],
  templateUrl: './actions.component.html',
  styleUrl: './actions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportDetailViewActionsComponent {
  private readonly i18n = inject(ReportBuilderI18nService);
  protected readonly t = this.i18n.t.bind(this.i18n);
  protected readonly common = this.i18n.common.bind(this.i18n);
  readonly detailActionGroups = input.required<ReportActionGroup[]>();
  readonly detailActionGroupsChange = output<ReportActionGroup[]>();
  readonly actionGroupsState = signal<ReportActionGroup[]>([]);
  readonly openActionConfig = output<void>();

  constructor() {
    // Mirror the input action groups into the local working copy.
    effect(() => {
      const groups = this.detailActionGroups();
      this.actionGroupsState.set(
        groups.map((group) => ({
          ...group,
          items: group.items.map((item) => ({ ...item })),
        }))
      );
    });
  }

  /** Toggles a detail action's enabled state and emits the updated groups. */
  toggleAction(groupIndex: number, actionIndex: number, checked: boolean): void {
    this.actionGroupsState.update((groups) =>
      groups.map((group, gIdx) => {
        if (gIdx !== groupIndex) {
          return group;
        }

        return {
          ...group,
          items: group.items.map((item, aIdx) =>
            aIdx === actionIndex ? { ...item, enabled: checked } : item
          ),
        };
      })
    );
    this.detailActionGroupsChange.emit(
      this.actionGroupsState().map((group) => ({
        ...group,
        items: group.items.map((item) => ({ ...item })),
      }))
    );
  }

  /** Opens the action-config drawer to add a new action item. */
  openActionConfigDrawer(): void {
    this.openActionConfig.emit();
  }
}
