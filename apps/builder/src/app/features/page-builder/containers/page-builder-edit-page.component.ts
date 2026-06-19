import { ReactiveFormsModule } from '@angular/forms';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  HostListener,
  OnDestroy,
  ViewChild,
  inject,
} from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { TranslocoPipe } from '@jsverse/transloco';
import { QoButtonComponent, QoCanvasFrameComponent, QoSelectComponent, QoWidgetActionBarComponent, QoConfirmDialogComponent, QoEmptyStateComponent, QoInputComponent } from '@qo/ui-components';
import { PageBuilderFormMockService } from '@builder/features/page-builder/services/page-builder-form-mock.service';
import { PageBuilderReportMockService } from '@builder/features/page-builder/services/page-builder-report-mock.service';
import { PanelConfigComponent } from '@builder/features/page-builder/components/panel-config/core/panel-config.component';
import { BoardShowcaseComponent } from '@builder/features/page-builder/components/widget-showcase/board/board-showcase.component';
import { TableShowcaseComponent } from '@builder/features/page-builder/components/widget-showcase/table/table-showcase.component';
import { SelectShowcaseComponent } from '@builder/features/page-builder/components/widget-showcase/select/select-showcase.component';
import { ButtonShowcaseComponent } from '@builder/features/page-builder/components/widget-showcase/button/button-showcase.component';
import { SearchShowcaseComponent } from '@builder/features/page-builder/components/widget-showcase/search/search-showcase.component';
import { SnippetShowcaseComponent } from '@builder/features/page-builder/components/widget-showcase/snippet/snippet-showcase.component';
import { TextBlockShowcaseComponent } from '@builder/features/page-builder/components/widget-showcase/text-block/text-block-showcase.component';
import { LabelShowcaseComponent } from '@builder/features/page-builder/components/widget-showcase/label/label-showcase.component';
import { MediaShowcaseComponent } from '@builder/features/page-builder/components/widget-showcase/media/media-showcase.component';
import { PanelShowcaseComponent } from '@builder/features/page-builder/components/widget-showcase/panel/panel-showcase.component';
import { UiChartPickerComponent } from '@builder/features/page-builder/components/widget-showcase/chart/ui-chart/ui-chart-picker.component';
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
import { PageBuilderEditPageFacade } from '@builder/features/page-builder/facades/page-builder-edit-page.facade';
import { PageBuilderFacade } from '@builder/features/page-builder/facades/page-builder.facade';
import { injectPageBuilderTranslate } from '@builder/features/page-builder/services/page-builder-i18n.service';
import { PageBuilderWidgetRuntimeBase } from '@builder/features/page-builder/utils/page-builder-widget-runtime.base';

@Component({
  selector: 'app-page-builder-edit-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    QoCanvasFrameComponent,
    QoButtonComponent,
    QoConfirmDialogComponent,
    QoEmptyStateComponent,
    PanelConfigComponent,
    QoWidgetActionBarComponent,
    BoardShowcaseComponent,
    TableShowcaseComponent,
    SelectShowcaseComponent,
    ButtonShowcaseComponent,
    SearchShowcaseComponent,
    SnippetShowcaseComponent,
    TextBlockShowcaseComponent,
    LabelShowcaseComponent,
    MediaShowcaseComponent,
    PanelShowcaseComponent,
    UiChartPickerComponent,
    QoSelectComponent,
    UiBoardWidgetComponent,
    UiTableWidgetComponent,
    UiSelectWidgetComponent,
    ChartLiveWidgetComponent,
    UiSnippetCardComponent,
    UiButtonComponent,
    UiSearchComponent,
    UiTextBlockComponent,
    UiMediaWidgetComponent,
    UiPanelWidgetComponent,
    QoInputComponent,
    TranslocoPipe,
  ],
  animations: [
    trigger('slideDependentSidebar', [
      transition(':enter', [
        style({ transform: 'translateX(-100%)', opacity: 0.4 }),
        animate('220ms cubic-bezier(0.4, 0, 0.2, 1)', style({ transform: 'translateX(0)', opacity: 1 })),
      ]),
      transition(':leave', [
        animate('180ms cubic-bezier(0.4, 0, 0.2, 1)', style({ transform: 'translateX(-100%)', opacity: 0.2 })),
      ]),
    ]),
  ],
  templateUrl: './page-builder-edit-page.component.html',
  styleUrl: './page-builder-edit-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PageBuilderEditPageFacade],
})
export class PageBuilderEditPageComponent extends PageBuilderWidgetRuntimeBase implements OnDestroy {
  protected readonly t = injectPageBuilderTranslate();
  public readonly pageFacade = inject(PageBuilderEditPageFacade);
  public readonly store = inject(PageBuilderFacade);
  protected override readonly formMock = inject(PageBuilderFormMockService);
  protected override readonly reportMock = inject(PageBuilderReportMockService);

  @ViewChild('canvasDropzone')
  set canvasDropzoneRef(ref: ElementRef<HTMLElement> | undefined) {
    this.store.setCanvasDropzone(ref?.nativeElement);
  }

  @ViewChild('canvasWidgetLayer')
  set canvasWidgetLayerRef(ref: ElementRef<HTMLElement> | undefined) {
    this.store.setCanvasWidgetLayer(ref?.nativeElement);
  }

  @ViewChild('selectionBarHost')
  set selectionBarHostRef(ref: ElementRef<HTMLElement> | undefined) {
    this.pageFacade.setSelectionBarHost(ref?.nativeElement ?? null);
  }

  @ViewChild('workspaceHost')
  set workspaceHostRef(ref: ElementRef<HTMLElement> | undefined) {
    this.pageFacade.setWorkspaceHost(ref?.nativeElement ?? null);
  }

  constructor() {
    super();
    this.store.startEditingSession();
    effect(() => {
      this.pageFacade.selectedCanvasWidget();
      this.pageFacade.panelConfigLabel();
      this.pageFacade.queuePanelOffsetRefresh();
    }, { allowSignalWrites: true });
  }

  @HostListener('window:mousemove', ['$event'])
  protected onWindowMouseMove(event: MouseEvent): void {
    this.store.onWindowMouseMove(event);
  }

  @HostListener('window:mouseup')
  protected onWindowMouseUp(): void {
    this.store.onWindowMouseUp();
  }

  @HostListener('window:mousedown', ['$event'])
  protected onWindowMouseDown(event: MouseEvent): void {
    if (!this.pageFacade.panelConfigWidget()) {
      return;
    }

    const target = event.target as HTMLElement | null;
    if (target?.closest('.pc-right-panel') || target?.closest('.page-builder-edit__canvas-widget') || target?.closest('.widget-selection-bar')) {
      return;
    }

    this.store.closePanelConfig();
  }

  @HostListener('window:resize')
  protected onWindowResize(): void {
    this.pageFacade.updatePanelConfigTopOffset();
  }

  ngOnDestroy(): void {
    this.store.destroyEditSession();
  }
}
