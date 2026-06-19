import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslocoPipe } from '@jsverse/transloco';

import { UiBoardWidgetComponent } from '@builder/features/page-builder/components/widget-showcase/board/ui-board/ui-board-widget.component';
import { UiTableWidgetComponent } from '@builder/features/page-builder/components/widget-showcase/table/ui-table/ui-table-widget.component';
import { UiSelectWidgetComponent } from '@builder/features/page-builder/components/widget-showcase/select/ui-select/ui-select-widget.component';
import { ChartLiveWidgetComponent } from '@builder/features/page-builder/components/widget-showcase/chart/chart-live-widget.component';
import { UiSnippetCardComponent } from '@builder/features/page-builder/components/widget-showcase/snippet/ui-snippet/ui-snippet-card.component';
import { UiButtonComponent } from '@builder/features/page-builder/components/widget-showcase/button/ui-button/ui-button.component';
import { UiSearchComponent } from '@builder/features/page-builder/components/widget-showcase/search/ui-search/ui-search.component';
import { UiTextBlockComponent } from '@builder/features/page-builder/components/widget-showcase/text-block/ui-text-block/ui-text-block.component';
import { UiMediaWidgetComponent } from '@builder/features/page-builder/components/widget-showcase/media/ui-media/ui-media-widget.component';
import { UiPanelWidgetComponent } from '@builder/features/page-builder/components/widget-showcase/panel/ui-panel/ui-panel-widget.component';
import { PageBuilderFormMockService } from '@builder/features/page-builder/services/page-builder-form-mock.service';
import { PageBuilderReportMockService } from '@builder/features/page-builder/services/page-builder-report-mock.service';
import { injectPageBuilderTranslate } from '@builder/features/page-builder/services/page-builder-i18n.service';
import { PageBuilderPageFacade } from '@builder/features/page-builder/facades/page-builder-page.facade';
import { PageBuilderWidgetRuntimeBase } from '@builder/features/page-builder/utils/page-builder-widget-runtime.base';
import { QoButtonComponent, QoInputComponent, QoSelectComponent } from '@qo/ui-components';

@Component({
  selector: 'app-page-builder-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    UiBoardWidgetComponent,
    UiTableWidgetComponent,
    UiSelectWidgetComponent,
    UiSnippetCardComponent,
    UiButtonComponent,
    UiSearchComponent,
    UiTextBlockComponent,
    UiMediaWidgetComponent,
    UiPanelWidgetComponent,
    ChartLiveWidgetComponent,
    QoButtonComponent,
    QoInputComponent,
    QoSelectComponent,
    TranslocoPipe,
  ],
  templateUrl: './page-builder-page.component.html',
  styleUrl: './page-builder-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PageBuilderPageFacade],
})
export class PageBuilderPageComponent extends PageBuilderWidgetRuntimeBase {
  protected readonly t = injectPageBuilderTranslate();
  public readonly pageFacade = inject(PageBuilderPageFacade);
  protected override readonly formMock = inject(PageBuilderFormMockService);
  protected override readonly reportMock = inject(PageBuilderReportMockService);
}
