import { ChangeDetectionStrategy, Component, input, output, inject } from '@angular/core';
import { QoButtonComponent } from '@qo/ui-components';
import { QuickLayout } from '@builder/report-builder/models';


interface SavedCustomLayoutItem {
  id: string;
  name: string;
  elementsCount: number;
  active: boolean;
}

/**
 * Quick View ? Layout sub-panel. Lets the user choose the quick layout (list /
 * card / custom / templates) and open/manage saved custom layouts. Each choice
 * is emitted upward for the parent panel to act on.
 */
import { ReportBuilderI18nService } from '../../../../services/report-builder-i18n.service';
@Component({
  selector: 'app-report-quick-view-layout',
  standalone: true,
  imports: [QoButtonComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportQuickViewLayoutComponent {
  private readonly i18n = inject(ReportBuilderI18nService);
  protected readonly t = this.i18n.t.bind(this.i18n);
  protected readonly common = this.i18n.common.bind(this.i18n);
  readonly quickLayout = input.required<QuickLayout>();
  readonly visibleCount = input<number>(0);
  readonly customTemplateMode = input<boolean>(false);
  readonly customTemplateVariant = input<'block' | 'list'>('block');
  readonly createNewLayoutOpen = input<boolean>(false);
  readonly savedCustomLayouts = input<SavedCustomLayoutItem[]>([]);

  readonly setQuickLayout = output<QuickLayout>();
  readonly openFieldConfig = output<void>();
  readonly openCustomLayout = output<void>();
  readonly openCustomLayoutTemplate = output<void>();
  readonly openCustomLayoutListTemplate = output<void>();
  readonly openCreateNewLayout = output<void>();
  readonly editSavedLayout = output<string>();
  readonly duplicateSavedLayout = output<string>();
  readonly deleteSavedLayout = output<string>();
  readonly activateSavedLayout = output<string>();

  /** Selects the list layout and opens the field config drawer. */
  openListLayoutBuilder(): void {
    this.setQuickLayout.emit('list');
    this.openFieldConfig.emit();
  }

  /** Selects the card layout and opens the field config drawer. */
  openCardLayoutBuilder(): void {
    this.setQuickLayout.emit('card');
    this.openFieldConfig.emit();
  }

  /** Selects the custom layout and opens the custom layout editor. */
  openCustomLayoutBuilder(): void {
    this.setQuickLayout.emit('custom');
    this.openCustomLayout.emit();
  }

  /** Selects the custom layout and opens its block-template editor. */
  openCustomLayoutTemplateBuilder(): void {
    this.setQuickLayout.emit('custom');
    this.openCustomLayoutTemplate.emit();
  }

  /** Selects the custom layout and opens its list-template editor. */
  openCustomLayoutListTemplateBuilder(): void {
    this.setQuickLayout.emit('custom');
    this.openCustomLayoutListTemplate.emit();
  }

  /** Opens the "create new layout" modal. */
  openCreateNewLayoutBuilder(): void {
    this.openCreateNewLayout.emit();
  }

  /** Activates a saved custom layout. */
  openSavedLayout(layoutId: string): void {
    this.setQuickLayout.emit('custom');
    this.activateSavedLayout.emit(layoutId);
  }
}
