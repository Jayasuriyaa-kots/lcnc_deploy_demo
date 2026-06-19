import { ChangeDetectionStrategy, Component, effect, input, output, signal, inject } from '@angular/core';
import { ReportActionGroup } from '@builder/report-builder/models';
import { QoCheckboxComponent, QoSelectComponent, SelectOption } from '@qo/ui-components';


/**
 * Quick View → Actions sub-panel. Toggles the per-record quick actions and sets
 * the record-click behaviour. Keeps a local working copy of the action groups
 * and emits it upward on every toggle.
 */
import { ReportBuilderI18nService } from '../../../../services/report-builder-i18n.service';
@Component({
  selector: 'app-report-quick-view-actions',
  standalone: true,
  imports: [QoCheckboxComponent, QoSelectComponent],
  templateUrl: './actions.component.html',
  styleUrl: './actions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportQuickViewActionsComponent {
  private readonly i18n = inject(ReportBuilderI18nService);
  protected readonly t = this.i18n.t.bind(this.i18n);
  protected readonly common = this.i18n.common.bind(this.i18n);
  readonly quickActionGroups = input.required<ReportActionGroup[]>();
  readonly recordClickAction = input<'View Record' | 'Do Nothing'>('View Record');
  readonly quickActionGroupsChange = output<ReportActionGroup[]>();
  readonly recordClickActionChange = output<'View Record' | 'Do Nothing'>();
  readonly actionGroupsState = signal<ReportActionGroup[]>([]);

  get recordClickActionOptions(): SelectOption[] {
    return [
      { label: this.i18n.t('options.viewRecord'), value: 'View Record' },
      { label: this.i18n.t('options.doNothing'), value: 'Do Nothing' },
    ];
  }

  constructor() {
    // Mirror the input action groups into the local working copy.
    effect(() => {
      const groups = this.quickActionGroups();
      this.actionGroupsState.set(
        groups.map((group) => ({
          ...group,
          items: group.items.map((item) => ({ ...item })),
        }))
      );
    });
  }

  /** Toggles an action's enabled state and emits the updated groups. */
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
    this.quickActionGroupsChange.emit(
      this.actionGroupsState().map((group) => ({
        ...group,
        items: group.items.map((item) => ({ ...item })),
      }))
    );
  }

  /** Emits the chosen record-click action (View Record / Do Nothing). */
  updateRecordClickAction(value: unknown): void {
    const next: 'View Record' | 'Do Nothing' = value === 'Do Nothing' ? 'Do Nothing' : 'View Record';
    this.recordClickActionChange.emit(next);
  }
}

