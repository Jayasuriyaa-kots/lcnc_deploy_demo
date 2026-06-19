import { ChangeDetectionStrategy, Component, input, output, inject } from '@angular/core';
import { QoButtonComponent } from '@qo/ui-components';
import { DetailLayout } from '@builder/report-builder/models';


/**
 * Detail View → Layout sub-panel. Lets the user choose the detail layout mode
 * (all-fields / block / tab) and manage saved detail custom layouts.
 */
import { ReportBuilderI18nService } from '../../../../services/report-builder-i18n.service';
@Component({
  selector: 'app-report-detail-view-layout',
  standalone: true,
  imports: [QoButtonComponent],
  templateUrl: './detail-view-layout.component.html',
  styleUrl: './layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportDetailViewLayoutComponent {
  private readonly i18n = inject(ReportBuilderI18nService);
  protected readonly t = this.i18n.t.bind(this.i18n);
  protected readonly common = this.i18n.common.bind(this.i18n);
  readonly detailLayout = input.required<DetailLayout>();
  readonly savedCustomLayouts = input<Array<{ id: string; name: string; active: boolean }>>([]);
  readonly setDetailLayout = output<DetailLayout>();
  readonly openDetailLayoutBuilder = output<void>();
  readonly openCreateNewLayout = output<void>();
  readonly activateSavedLayout = output<string>();
  readonly deactivateSavedLayout = output<string>();
  readonly duplicateSavedLayout = output<string>();
  readonly editSavedLayout = output<string>();
  readonly deleteSavedLayout = output<string>();

  /** Selects a detail layout mode and opens its builder. */
  choose(mode: DetailLayout): void {
    this.setDetailLayout.emit(mode);
    this.openDetailLayoutBuilder.emit();
  }
}
