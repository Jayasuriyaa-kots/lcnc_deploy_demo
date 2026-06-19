import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostBinding, computed, effect, inject, input, output } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { TranslocoPipe } from '@jsverse/transloco';
import { ChartThumbnailComponent } from '@builder/features/page-builder/components/widget-showcase/chart/chart-thumbnail.component';
import { ChartType } from '@builder/features/page-builder/components/widget-showcase/chart/ui-chart/ui-chart-picker.component';
import { BoardWidgetVariant } from '@builder/features/page-builder/components/widget-showcase/board/board-widget.config';
import { UiBoardWidgetComponent } from '@builder/features/page-builder/components/widget-showcase/board/ui-board/ui-board-widget.component';
import { UiTableWidgetComponent } from '@builder/features/page-builder/components/widget-showcase/table/ui-table/ui-table-widget.component';
import { UiButtonComponent } from '@builder/features/page-builder/components/widget-showcase/button/ui-button/ui-button.component';
import { UiSelectWidgetComponent } from '@builder/features/page-builder/components/widget-showcase/select/ui-select/ui-select-widget.component';
import { UiSearchComponent } from '@builder/features/page-builder/components/widget-showcase/search/ui-search/ui-search.component';
import { ChartSettingsPanelComponent } from '@builder/features/page-builder/components/panel-config/chart/chart-settings-panel.component';
import { FormSubmitSettingsComponent } from '@builder/features/page-builder/components/panel-config/form/form-submit-settings';
import { PropertiesPanelComponent } from '@builder/features/page-builder/components/panel-config/button/properties-panel';
import { SearchResultComponentPanelComponent } from '@builder/features/page-builder/components/panel-config/search/search-result-component-panel';
import { SearchStylePanelComponent } from '@builder/features/page-builder/components/panel-config/search/search-style-panel';
import { SnippetSettingsPanelComponent } from '@builder/features/page-builder/components/panel-config/snippet';
import {
  BoardWidgetConfigComponent,
  ButtonWidgetConfigComponent,
  MediaWidgetConfigComponent,
  ReportWidgetConfigComponent,
  SelectWidgetConfigComponent,
  TableWidgetConfigComponent,
  TextWidgetConfigComponent,
} from '@builder/features/page-builder/components/panel-config/widget-configs';
import { UiSnippetCardComponent } from '@builder/features/page-builder/components/widget-showcase/snippet/ui-snippet/ui-snippet-card.component';
import { UiTextBlockComponent } from '@builder/features/page-builder/components/widget-showcase/text-block/ui-text-block/ui-text-block.component';
import { UiMediaWidgetComponent } from '@builder/features/page-builder/components/widget-showcase/media/ui-media/ui-media-widget.component';
import { UiPanelWidgetComponent } from '@builder/features/page-builder/components/widget-showcase/panel/ui-panel/ui-panel-widget.component';
import { PanelSettingsPanelComponent } from '@builder/features/page-builder/components/panel-config/panel/panel-settings-panel.component';
import { SearchCriteriaRow } from '@builder/features/page-builder/components/panel-config/search/search-criteria-modal';
import {
  ChartWidgetConfig,
  ButtonStyleConfig,
  CanvasWidget,
  createDefaultMediaWidgetConfig,
  createDefaultPanelWidgetConfig,
  createDefaultSnippetWidgetConfig,
  createDefaultSelectWidgetConfig,
  createDefaultTextBlockWidgetConfig,
  createDefaultTableWidgetConfig,
  createDefaultChartWidgetConfig,
  FormWidgetConfig,
  MediaWidgetConfig,
  PanelWidgetConfig,
  ReportWidgetConfig,
  SnippetWidgetConfig,
  SelectWidgetConfig,
  TableWidgetConfig,
  TextBlockWidgetConfig,
} from '@builder/features/page-builder/models/page-builder-canvas.model';
import {
  ChartSettingsState,
  PanelConfigState,
  PanelDisplaySettingsState,
  PanelRightTab,
  SearchResultState,
  SearchStyleState,
} from '@builder/features/page-builder/models/page-builder-panel-state.model';
import {
  createDefaultChartSettingsState,
  createDefaultPanelConfigState,
  createDefaultPanelDisplaySettingsState,
  createDefaultSearchResultState,
  createDefaultSearchStyleState,
} from '@builder/features/page-builder/models/page-builder-panel-state.factory';
import { QoButtonComponent, SelectOption } from '@qo/ui-components';
import { PanelConfigFacade, PickerType } from '@builder/features/page-builder/facades/panel-config/panel-config.facade';
import { PanelWidgetResolution } from '@builder/features/page-builder/components/widget-showcase/panel/panel-widget-resolution.util';
import { PageBuilderI18nService } from '@builder/features/page-builder/services/page-builder-i18n.service';

type PanelWidgetType = 'default' | 'panel' | 'label' | 'button' | 'board' | 'table' | 'select' | 'chart' | 'search' | 'snippet' | 'media' | 'text-block' | 'form' | 'form-button' | 'form-action-card' | 'report';
type PanelWidgetSubType = 'none' | 'report-embed' | 'report-button' | 'report-action-card';

@Component({
  selector: 'app-panel-config',
  standalone: true,
  imports: [
    CommonModule, UiBoardWidgetComponent, UiTableWidgetComponent, UiButtonComponent, UiSelectWidgetComponent,
    UiSearchComponent, ChartThumbnailComponent, ChartSettingsPanelComponent, FormSubmitSettingsComponent,
    PropertiesPanelComponent, TableWidgetConfigComponent, SelectWidgetConfigComponent, TextWidgetConfigComponent,
    MediaWidgetConfigComponent, BoardWidgetConfigComponent, ButtonWidgetConfigComponent, ReportWidgetConfigComponent,
    SearchResultComponentPanelComponent, SearchStylePanelComponent, SnippetSettingsPanelComponent, UiSnippetCardComponent,
    UiMediaWidgetComponent, UiPanelWidgetComponent, PanelSettingsPanelComponent, UiTextBlockComponent, QoButtonComponent,
    TranslocoPipe,
  ],
  templateUrl: './panel-config.component.html',
  styleUrl: './panel-config.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PanelConfigFacade],
  animations: [
    trigger('slideInRight', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('320ms cubic-bezier(0.4, 0, 0.2, 1)', style({ transform: 'translateX(0)', opacity: 1 })),
      ]),
      transition(':leave', [
        animate('280ms cubic-bezier(0.4, 0, 0.2, 1)', style({ transform: 'translateX(100%)', opacity: 0 })),
      ]),
    ]),
    trigger('slidePanel', [
      transition(':enter', [
        style({ transform: 'translateX(-100%)', opacity: 0 }),
        animate('260ms cubic-bezier(0.4, 0, 0.2, 1)', style({ transform: 'translateX(0)', opacity: 1 })),
      ]),
      transition(':leave', [
        animate('220ms cubic-bezier(0.4, 0, 0.2, 1)', style({ transform: 'translateX(-100%)', opacity: 0 })),
      ]),
    ]),
  ],
})
export class PanelConfigComponent {
  private readonly i18n = inject(PageBuilderI18nService);
  protected readonly t = this.i18n.t.bind(this.i18n);
  protected readonly facade = inject(PanelConfigFacade);
  readonly widgetType = input<PanelWidgetType>('default');
  readonly panelName = input(this.i18n.scope('propertiesPanel.panel1'));
  readonly selectedLabel = input(this.i18n.scope('facade.staffIn'));
  readonly widgetSubType = input<PanelWidgetSubType>('none');
  readonly boardVariant = input<BoardWidgetVariant>('department-list');
  readonly chartType = input<ChartType>('line');
  readonly tableConfig = input<TableWidgetConfig>(createDefaultTableWidgetConfig());
  readonly selectConfig = input<SelectWidgetConfig>(createDefaultSelectWidgetConfig());
  readonly panelWidgetConfig = input<PanelWidgetConfig>(createDefaultPanelWidgetConfig());
  readonly panelSectionId = input<'card' | 'value' | 'icon' | 'caption'>('card');
  readonly snippetConfig = input<SnippetWidgetConfig>(createDefaultSnippetWidgetConfig());
  readonly textBlockConfig = input<TextBlockWidgetConfig>(createDefaultTextBlockWidgetConfig());
  readonly selectedWidget = input<CanvasWidget | null>(null);
  readonly availableForms = input<SelectOption[]>([]);
  readonly availableReports = input<SelectOption[]>([]);
  readonly availablePageOptions = input<SelectOption[]>([]);
  readonly buttonDatasourceOptions = input<SelectOption[]>([]);
  readonly availableFormConfigs = input<FormWidgetConfig[]>([]);
  readonly chartConfig = input<ChartWidgetConfig>(createDefaultChartWidgetConfig());
  readonly panelState = input<PanelConfigState>({ ...createDefaultPanelConfigState(), reportCriteriaRows: [] });
  readonly chartSettingsState = input<ChartSettingsState>({ ...createDefaultChartSettingsState(), selectedRecordCriteriaRows: [] });
  readonly displaySettingsState = input<PanelDisplaySettingsState>({ ...createDefaultPanelDisplaySettingsState(), selectedRecordCriteriaRows: [] });
  readonly searchResultState = input<SearchResultState>({ ...createDefaultSearchResultState(), criteriaRows: [] });
  readonly searchStyleState = input<SearchStyleState>({ ...createDefaultSearchStyleState(), searchButtonFontSize: 'var(--qo-text-sm)', searchBarFontSize: 'var(--qo-text-sm)' });
  readonly panelResolution = input<PanelWidgetResolution | null>(null);

  readonly labelChanged = output<string>();
  readonly buttonStyleConfigChange = output<ButtonStyleConfig>();
  readonly buttonWidgetChanged = output<Partial<CanvasWidget>>();
  readonly searchWidgetChanged = output<Partial<CanvasWidget>>();
  readonly tableConfigChange = output<TableWidgetConfig>();
  readonly selectConfigChange = output<SelectWidgetConfig>();
  readonly panelConfigChange = output<PanelWidgetConfig>();
  readonly panelSectionChange = output<'card' | 'value' | 'icon' | 'caption'>();
  readonly snippetConfigChange = output<SnippetWidgetConfig>();
  readonly textBlockConfigChange = output<TextBlockWidgetConfig>();
  readonly mediaConfigChange = output<MediaWidgetConfig>();
  readonly formConfigChange = output<FormWidgetConfig>();
  readonly reportConfigChange = output<ReportWidgetConfig>();
  readonly chartConfigChange = output<ChartWidgetConfig>();
  readonly panelStateChange = output<Partial<PanelConfigState>>();
  readonly chartSettingsStateChange = output<Partial<ChartSettingsState>>();
  readonly displaySettingsStateChange = output<Partial<PanelDisplaySettingsState>>();
  readonly searchResultStateChange = output<Partial<SearchResultState>>();
  readonly searchStyleStateChange = output<Partial<SearchStyleState>>();
  readonly boardWidgetChanged = output<Partial<CanvasWidget>>();
  readonly closed = output<void>();

  get leftPanelOpen(): boolean { return this.facade.leftPanelOpen(); }
  readonly activePickerType = this.facade.activePickerType;
  readonly rightOnlyTopOffsetPx = input(0);

  @HostBinding('class.panel-config-host--right-only')
  get rightOnlyHostClass(): boolean { return this.isRightSidebarOnly; }

  get isRightSidebarOnly(): boolean { return this.widgetType() !== 'default'; }

  readonly colorPickerPalette = this.facade.colorPickerPalette;
  readonly textPresets = this.facade.textPresets;
  readonly textStyles = this.facade.textStyles;
  readonly chartDraftConfig = this.facade.chartDraftConfig;
  readonly textBlockFontFamilyOptions = this.facade.textBlockFontFamilyOptions;
  readonly textBlockLineHeightOptions = this.facade.textBlockLineHeightOptions;
  readonly textBlockLetterSpacingOptions = this.facade.textBlockLetterSpacingOptions;
  readonly windowTargetOptions = this.facade.windowTargetOptions;
  readonly functionOptions = this.facade.functionOptions;
  readonly boardLayoutOptions = this.facade.boardLayoutOptions;
  readonly boardImageSourceOptions = this.facade.boardImageSourceOptions;

  readonly isDefaultTabbedWidget = computed(() => {
    const widgetType = this.widgetType();
    return widgetType === 'default' || widgetType === 'text-block' || widgetType === 'label';
  });

  readonly isActionlessTextBlock = computed(() =>
    (this.widgetType() === 'text-block' || this.widgetType() === 'label') &&
    (this.panelState().textBlockWidgetConfig.inputType === 'file' ||
      this.panelState().textBlockWidgetConfig.inputType === 'date' ||
      this.panelState().textBlockWidgetConfig.inputType === 'labeltext')
  );

  constructor() {
    effect(() => {
      this.facade.syncChartDraftConfig(this.chartConfig());
    }, { allowSignalWrites: true });

    effect(() => {
      this.facade.syncReportConfig(this.selectedWidget()?.widgetProps?.reportConfig);
    }, { allowSignalWrites: true });
  }

  hide(): void { this.closed.emit(); }
  rightTab(): PanelRightTab { return this.isActionlessTextBlock() && this.panelState().rightTab === 'action' ? 'display' : this.panelState().rightTab; }
  editableLabel(): string { return this.panelState().editableLabel; }
  chartPanelStep(): 'select-form' | 'settings' { return this.panelState().chartPanelStep; }
  selectedChartFormName(): string { return this.panelState().selectedChartFormName; }
  tableWidgetConfig(): TableWidgetConfig { return this.panelState().tableWidgetConfig; }
  selectWidgetConfig(): SelectWidgetConfig { return this.panelState().selectWidgetConfig; }
  textBlockWidgetConfig(): TextBlockWidgetConfig { return this.panelState().textBlockWidgetConfig; }
  mediaWidgetConfig(): MediaWidgetConfig { return { ...createDefaultMediaWidgetConfig(), ...(this.selectedWidget()?.widgetProps?.mediaConfig ?? {}) }; }
  buttonStyleConfig(): ButtonStyleConfig { return this.panelState().buttonStyleConfig; }
  buttonGroupButtons() { return this.facade.getButtonGroupButtons(this.selectedWidget()); }
  isButtonGroupWidget(): boolean { return this.buttonGroupButtons().length > 0; }
  selectedBoardSectionId(): 'header' | 'body' | 'footer' | string { return this.facade.selectedBoardSectionId(); }
  boardBackgroundColor(): string { return this.selectedWidget()?.boardBackgroundColor ?? 'var(--qo-color-neutral-0)'; }
  reportFieldOptions(): SelectOption[] { return []; }
  buttonPreviewStyles(): Partial<CSSStyleDeclaration> {
    const config = this.buttonStyleConfig();
    return {
      borderRadius: `${config.cornerRadius}px`,
      color: config.color,
      backgroundColor: config.fillColor,
      borderColor: config.strokeColor,
      borderWidth: `${config.strokeWidth}px`,
      borderStyle: config.strokeWidth > 0 ? 'solid' : 'none',
      paddingTop: `${config.paddingTop}px`,
      paddingRight: `${config.paddingRight}px`,
      paddingBottom: `${config.paddingBottom}px`,
      paddingLeft: `${config.paddingLeft}px`,
      fontFamily: config.fontFamily,
      fontSize: config.fontSize,
      fontWeight: config.bold ? '700' : '400',
      fontStyle: config.italic ? 'italic' : 'normal',
      textDecoration: config.underline ? 'underline' : 'none',
      textTransform:
        config.textCase === 'uppercase'
          ? 'uppercase'
          : config.textCase === 'lowercase'
            ? 'lowercase'
            : 'none',
    };
  }
  cancelChanges(): void {
    this.panelStateChange.emit({ editableLabel: this.selectedLabel() || this.i18n.scope('facade.staffIn') });
    this.hide();
  }
  
  applyChanges(): void {
    this.labelChanged.emit(this.panelState().editableLabel);
    if (this.widgetType() === 'chart') {
      this.chartConfigChange.emit(this.chartDraftConfig());
    }
    this.hide();
  }

  toggleLeftPanel(): void { this.facade.toggleLeftPanel(); }
  setPickerType(type: PickerType): void { this.facade.setPickerType(type); }
  setRightTab(tab: PanelRightTab): void { this.panelStateChange.emit({ rightTab: this.isActionlessTextBlock() && tab === 'action' ? 'display' : tab }); }
  updateLabel(event: Event): void { this.onLabelEdited((event.target as HTMLInputElement).value); }

  onLabelEdited(value: string): void {
    const nextLabel = this.facade.getEditedLabel(value, this.widgetType(), this.widgetSubType());
    this.panelStateChange.emit({ editableLabel: nextLabel });
    this.labelChanged.emit(nextLabel);
  }

  onTableConfigChanged(config: TableWidgetConfig): void {
    const normalizedConfig = this.facade.normalizeTableConfig(config);
    this.panelStateChange.emit({ tableWidgetConfig: normalizedConfig });
    this.tableConfigChange.emit(normalizedConfig);
  }

  onSelectConfigChanged(config: SelectWidgetConfig): void {
    const normalizedConfig = this.facade.normalizeSelectConfig(config);
    this.panelStateChange.emit({ selectWidgetConfig: normalizedConfig });
    this.selectConfigChange.emit(normalizedConfig);
  }

  onSnippetConfigChanged(config: SnippetWidgetConfig): void { this.snippetConfigChange.emit({ ...config }); }

  onTextBlockConfigChanged(config: TextBlockWidgetConfig): void {
    const normalizedConfig = this.facade.normalizeTextBlockConfig(config);
    this.panelStateChange.emit({ textBlockWidgetConfig: normalizedConfig });
    this.textBlockConfigChange.emit(normalizedConfig);
  }

  onMediaConfigChanged(config: MediaWidgetConfig): void { this.mediaConfigChange.emit(this.facade.normalizeMediaConfig(config)); }
  onButtonStyleChanged(config: ButtonStyleConfig): void {
    const patch = this.facade.createButtonStylePatch(
      config,
      this.selectedWidget(),
      this.panelState().selectedButtonGroupButtonId,
      this.buttonGroupButtons(),
    );
    this.panelStateChange.emit(patch.panelStatePatch);
    if (patch.widgetChange) {
      this.buttonWidgetChanged.emit(patch.widgetChange);
    }
    this.buttonStyleConfigChange.emit(config);
  }
  onBoardSectionSelected(sectionId: string): void {
    if (this.facade.isPanelSectionId(sectionId)) {
      this.panelSectionChange.emit(sectionId);
    } else {
      this.facade.setSelectedBoardSection(sectionId);
    }
  }
  onPanelSectionSelected(sectionId: string): void {
    if (this.facade.isPanelSectionId(sectionId)) {
      this.panelSectionChange.emit(sectionId);
    }
  }
  onSearchWidgetChanged(change: Partial<CanvasWidget>): void { this.searchWidgetChanged.emit(change); }
  onSelectTextColorChanged(value: string | null): void { this.onSelectConfigChanged(this.facade.createSelectTextColorConfig(this.panelState().selectWidgetConfig, value)); }
  onSelectBorderColorChanged(value: string | null): void { this.onSelectConfigChanged(this.facade.createSelectBorderColorConfig(this.panelState().selectWidgetConfig, value)); }
  isDeletableFromFooter(): boolean { return this.isDefaultTabbedWidget() || ['snippet', 'table', 'select', 'media'].includes(this.widgetType()); }
  deleteSelected(): void { this.closed.emit(); }

  onChartFormSelected(form: { id: string; name: string }): void {
    const state = this.facade.createChartFormSelectionState(this.chartDraftConfig(), form);
    this.panelStateChange.emit(state.panelStatePatch);
    this.chartDraftConfig.set(state.nextConfig);
    this.chartConfigChange.emit(state.nextConfig);
  }

  onChartSourceFormChanged(formId: string): void {
    const state = this.facade.createChartSourceSelectionState(this.chartDraftConfig(), formId, this.panelState().selectedChartFormName);
    if (state) {
      this.panelStateChange.emit(state.panelStatePatch);
      this.chartDraftConfig.set(state.nextConfig);
      this.chartConfigChange.emit(state.nextConfig);
    }
  }

  onChartConfigChanged(config: ChartWidgetConfig): void {
    const nextConfig = this.facade.getNextChartConfig(this.chartDraftConfig(), config);
    if (nextConfig) {
      this.chartDraftConfig.set(nextConfig);
      this.chartConfigChange.emit(nextConfig);
    }
  }

  selectedElement() { return { id: 'selected-widget', type: 'widget', label: this.panelState().editableLabel, x: 0, y: 0, selected: true }; }
}
