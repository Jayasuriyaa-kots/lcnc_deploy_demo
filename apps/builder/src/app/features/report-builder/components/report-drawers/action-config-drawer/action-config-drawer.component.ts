import { ChangeDetectionStrategy, Component, output, inject } from '@angular/core';
import { QoButtonComponent, QoIconComponent, QoInputComponent } from '@qo/ui-components';


/**
 * Action-config drawer. Static scaffold for creating a new report action item
 * (name, trigger, execution timing, workflow). Presentational only.
 */
import { ReportBuilderI18nService } from '../../../services/report-builder-i18n.service';
@Component({
  selector: 'app-action-config-drawer',
  standalone: true,
  imports: [QoButtonComponent, QoIconComponent, QoInputComponent],
  templateUrl: './action-config-drawer.component.html',
  styleUrl: '../report-drawers.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionConfigDrawerComponent {
  private readonly i18n = inject(ReportBuilderI18nService);
  protected readonly t = this.i18n.t.bind(this.i18n);
  protected readonly common = this.i18n.common.bind(this.i18n);
  /** Request to close all drawers. */
  readonly closeAll = output<void>();
}
