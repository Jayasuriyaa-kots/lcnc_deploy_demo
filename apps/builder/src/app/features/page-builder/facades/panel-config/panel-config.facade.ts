import { inject, Injectable, signal } from '@angular/core';
import { SelectOption } from '@qo/ui-components';
import { VisibilitySection } from '@builder/features/page-builder/components/panel-config/report/visibility-panel';
import { SearchCriteriaRow } from '@builder/features/page-builder/components/panel-config/search/search-criteria-modal';
import {
  ButtonActionConfig,
  ButtonActionType,
  ButtonGroupButtonConfig,
  ButtonStyleConfig,
  CanvasWidget,
  ChartWidgetConfig,
  MediaWidgetConfig,
  ReportWidgetConfig,
  SelectWidgetConfig,
  TableWidgetConfig,
  TextBlockWidgetConfig,
  createDefaultChartWidgetConfig,
} from '@builder/features/page-builder/models/page-builder-canvas.model';
import {
  PANEL_CONFIG_ACTION_OPTIONS,
  PANEL_CONFIG_BOARD_IMAGE_SOURCE_OPTIONS,
  PANEL_CONFIG_BOARD_LAYOUT_OPTIONS,
  PANEL_CONFIG_COLOR_PICKER_PALETTE,
  PANEL_CONFIG_FUNCTION_OPTIONS,
  PANEL_CONFIG_REPORT_OPERATOR_OPTIONS,
  PANEL_CONFIG_ROW_CLICK_ACTION_OPTIONS,
  PANEL_CONFIG_TEXT_BLOCK_FONT_FAMILY_OPTIONS,
  PANEL_CONFIG_TEXT_BLOCK_LETTER_SPACING_OPTIONS,
  PANEL_CONFIG_TEXT_BLOCK_LINE_HEIGHT_OPTIONS,
  PANEL_CONFIG_TEXT_PRESETS,
  PANEL_CONFIG_TEXT_STYLES,
  PANEL_CONFIG_WINDOW_TARGET_OPTIONS,
} from '@builder/features/page-builder/components/panel-config/core/panel-config.options';
import { PanelConfigButtonConfigService } from '@builder/features/page-builder/components/panel-config/core/panel-config-button-config.service';
import { PanelConfigChartReportService } from '@builder/features/page-builder/components/panel-config/core/panel-config-chart-report.service';
import { ButtonDisplayType, PickerType } from '@builder/features/page-builder/components/panel-config/core/panel-config.types';
import { PanelConfigWidgetConfigService } from '@builder/features/page-builder/components/panel-config/core/panel-config-widget-config.service';

export { ButtonDisplayType, PickerType } from '@builder/features/page-builder/components/panel-config/core/panel-config.types';

@Injectable()
export class PanelConfigFacade {
  private readonly widgetConfig = inject(PanelConfigWidgetConfigService);
  private readonly buttonConfig = inject(PanelConfigButtonConfigService);
  private readonly chartReport = inject(PanelConfigChartReportService);

  readonly leftPanelOpen = signal(false);
  readonly activePickerType = signal<PickerType>('button');
  readonly reportCriteriaModalOpen = signal(false);
  readonly selectedBoardSectionId = signal('header');
  readonly reportVisibilitySections = signal<VisibilitySection[]>(this.chartReport.createDefaultVisibilitySections());
  readonly reportAllowPublicAccess = signal(false);
  readonly chartDraftConfig = signal<ChartWidgetConfig>(createDefaultChartWidgetConfig());

  readonly colorPickerPalette = PANEL_CONFIG_COLOR_PICKER_PALETTE;
  readonly textPresets = PANEL_CONFIG_TEXT_PRESETS;
  readonly textStyles = PANEL_CONFIG_TEXT_STYLES;
  readonly reportOperatorOptions = PANEL_CONFIG_REPORT_OPERATOR_OPTIONS;
  readonly rowClickActionOptions = PANEL_CONFIG_ROW_CLICK_ACTION_OPTIONS;
  readonly textBlockFontFamilyOptions = PANEL_CONFIG_TEXT_BLOCK_FONT_FAMILY_OPTIONS;
  readonly textBlockLineHeightOptions = PANEL_CONFIG_TEXT_BLOCK_LINE_HEIGHT_OPTIONS;
  readonly textBlockLetterSpacingOptions = PANEL_CONFIG_TEXT_BLOCK_LETTER_SPACING_OPTIONS;
  readonly windowTargetOptions = PANEL_CONFIG_WINDOW_TARGET_OPTIONS;
  readonly functionOptions = PANEL_CONFIG_FUNCTION_OPTIONS;
  readonly boardLayoutOptions = PANEL_CONFIG_BOARD_LAYOUT_OPTIONS;
  readonly boardImageSourceOptions = PANEL_CONFIG_BOARD_IMAGE_SOURCE_OPTIONS;
  readonly actionOptions = PANEL_CONFIG_ACTION_OPTIONS;

  toggleLeftPanel(): void {
    this.leftPanelOpen.update((isOpen) => !isOpen);
  }

  setPickerType(type: PickerType): void {
    this.activePickerType.set(type);
  }

  setSelectedBoardSection(sectionId: string): void {
    this.selectedBoardSectionId.set(sectionId);
  }

  resetBoardSection(): void {
    this.selectedBoardSectionId.set('header');
  }

  openReportFilterModal(): void {
    this.reportCriteriaModalOpen.set(true);
  }

  closeReportFilterModal(): void {
    this.reportCriteriaModalOpen.set(false);
  }

  syncChartDraftConfig(config: ChartWidgetConfig): void {
    this.chartDraftConfig.set(this.chartReport.cloneChartDraftConfig(config));
  }

  syncReportConfig(reportConfig: ReportWidgetConfig | undefined): void {
    const uiState = this.chartReport.createReportUiState(reportConfig);
    this.reportVisibilitySections.set(uiState.sections);
    this.reportAllowPublicAccess.set(uiState.allowPublicAccess);
  }

  updateReportVisibilityItem(change: { key: string; value: boolean }): void {
    this.reportVisibilitySections.update((sections) => this.chartReport.updateReportVisibilitySections(sections, change));
  }

  setReportAllowPublicAccess(value: boolean): void {
    this.reportAllowPublicAccess.set(value);
  }

  getEditedLabel(value: string, widgetType: string, widgetSubType: string): string {
    return this.widgetConfig.getEditedLabel(value, widgetType, widgetSubType);
  }

  normalizeTableConfig(config: TableWidgetConfig): TableWidgetConfig {
    return this.widgetConfig.normalizeTableConfig(config);
  }

  createTableBackgroundColorConfig(currentConfig: TableWidgetConfig, value: string | null): TableWidgetConfig {
    return this.widgetConfig.createTableBackgroundColorConfig(currentConfig, value);
  }

  createTableBorderColorConfig(currentConfig: TableWidgetConfig, value: string | null): TableWidgetConfig {
    return this.widgetConfig.createTableBorderColorConfig(currentConfig, value);
  }

  createTableStyleFieldConfig(currentConfig: TableWidgetConfig, field: 'borderRadius', value: string): TableWidgetConfig {
    return this.widgetConfig.createTableStyleFieldConfig(currentConfig, field, value);
  }

  normalizeSelectConfig(config: SelectWidgetConfig): SelectWidgetConfig {
    return this.widgetConfig.normalizeSelectConfig(config);
  }

  createSelectBackgroundColorConfig(currentConfig: SelectWidgetConfig, value: string | null): SelectWidgetConfig {
    return this.widgetConfig.createSelectBackgroundColorConfig(currentConfig, value);
  }

  createSelectTextColorConfig(currentConfig: SelectWidgetConfig, value: string | null): SelectWidgetConfig {
    return this.widgetConfig.createSelectTextColorConfig(currentConfig, value);
  }

  createSelectBorderColorConfig(currentConfig: SelectWidgetConfig, value: string | null): SelectWidgetConfig {
    return this.widgetConfig.createSelectBorderColorConfig(currentConfig, value);
  }

  normalizeTextBlockConfig(config: TextBlockWidgetConfig): TextBlockWidgetConfig {
    return this.widgetConfig.normalizeTextBlockConfig(config);
  }

  createTextBlockBackgroundColorConfig(currentConfig: TextBlockWidgetConfig, value: string | null): TextBlockWidgetConfig {
    return this.widgetConfig.createTextBlockBackgroundColorConfig(currentConfig, value);
  }

  createTextBlockBorderColorConfig(currentConfig: TextBlockWidgetConfig, value: string | null): TextBlockWidgetConfig {
    return this.widgetConfig.createTextBlockBorderColorConfig(currentConfig, value);
  }

  createTextBlockLabelColorConfig(currentConfig: TextBlockWidgetConfig, value: string | null): TextBlockWidgetConfig {
    return this.widgetConfig.createTextBlockLabelColorConfig(currentConfig, value);
  }

  updateTextBlockStyleFieldConfig(
    currentConfig: TextBlockWidgetConfig,
    field: 'borderWidth' | 'borderRadius' | 'labelColor' | 'labelFontSize' | 'fontFamily' | 'fontSize' | 'lineHeight' | 'letterSpacing',
    value: string,
  ): TextBlockWidgetConfig {
    return this.widgetConfig.updateTextBlockStyleFieldConfig(currentConfig, field, value);
  }

  toggleTextBlockStyleFlagConfig(
    currentConfig: TextBlockWidgetConfig,
    field: 'bold' | 'italic' | 'underline' | 'lineThrough',
  ): TextBlockWidgetConfig {
    return this.widgetConfig.toggleTextBlockStyleFlagConfig(currentConfig, field);
  }

  createTextBlockTextAlignConfig(currentConfig: TextBlockWidgetConfig, value: 'left' | 'center' | 'right'): TextBlockWidgetConfig {
    return this.widgetConfig.createTextBlockTextAlignConfig(currentConfig, value);
  }

  createTextBlockFontSizeInputConfig(currentConfig: TextBlockWidgetConfig, value: string): TextBlockWidgetConfig {
    return this.widgetConfig.createTextBlockFontSizeInputConfig(currentConfig, value);
  }

  normalizeMediaConfig(config: MediaWidgetConfig): MediaWidgetConfig {
    return this.widgetConfig.normalizeMediaConfig(config);
  }

  createMediaBackgroundColorConfig(currentConfig: MediaWidgetConfig, value: string | null): MediaWidgetConfig {
    return this.widgetConfig.createMediaBackgroundColorConfig(currentConfig, value);
  }

  createAvailableChartForms(options: SelectOption[]): Array<{ id: string; name: string }> {
    return this.widgetConfig.createAvailableChartForms(options);
  }

  isPanelSectionId(sectionId: string): sectionId is 'card' | 'value' | 'icon' | 'caption' {
    return this.widgetConfig.isPanelSectionId(sectionId);
  }

  createBoardBackgroundChange(value: string | null): Partial<CanvasWidget> {
    return this.widgetConfig.createBoardBackgroundChange(value);
  }

  createBoardLayoutTypeChange(value: string | number): Partial<CanvasWidget> {
    return this.widgetConfig.createBoardLayoutTypeChange(value);
  }

  createBoardImageSourceChange(value: string | number): Partial<CanvasWidget> {
    return this.widgetConfig.createBoardImageSourceChange(value);
  }

  createBoardPanelsPerRowChange(value: string): Partial<CanvasWidget> {
    return this.widgetConfig.createBoardPanelsPerRowChange(value);
  }

  createBoardPaddingChange(
    field: 'boardPaddingTop' | 'boardPaddingRight' | 'boardPaddingBottom' | 'boardPaddingLeft',
    value: string,
  ): Partial<CanvasWidget> {
    return this.widgetConfig.createBoardPaddingChange(field, value);
  }

  createReportFilterRowsPatch(rows: SearchCriteriaRow[]): { reportCriteriaRows: SearchCriteriaRow[] } {
    return this.chartReport.createReportFilterRowsPatch(rows);
  }

  createReportFilterDonePatch(rows: SearchCriteriaRow[]): { reportCriteriaRows: SearchCriteriaRow[]; reportFilterConfigured: boolean } {
    return this.chartReport.createReportFilterDonePatch(rows);
  }

  createClearedReportFilterPatch(): { reportCriteriaRows: SearchCriteriaRow[]; reportFilterConfigured: false } {
    return this.chartReport.createClearedReportFilterPatch();
  }

  getButtonGroupButtons(selectedWidget: CanvasWidget | null): ButtonGroupButtonConfig[] {
    return this.buttonConfig.getButtonGroupButtons(selectedWidget);
  }

  createButtonActionConfigPatch(
    currentConfig: ButtonActionConfig,
    action: string,
    selectedWidget: CanvasWidget | null,
    selectedButtonId: string | null,
    buttons: ButtonGroupButtonConfig[],
  ): { panelStatePatch: { selectedAction: string; buttonActionConfig: ButtonActionConfig }; widgetChange?: Partial<CanvasWidget> } {
    return this.buttonConfig.createButtonActionConfigPatch(currentConfig, action, selectedWidget, selectedButtonId, buttons);
  }

  createButtonActionFieldPatch<K extends keyof ButtonActionConfig>(
    currentConfig: ButtonActionConfig,
    field: K,
    value: ButtonActionConfig[K],
    selectedWidget: CanvasWidget | null,
    selectedButtonId: string | null,
    buttons: ButtonGroupButtonConfig[],
  ): { panelStatePatch: { selectedAction: ButtonActionType; buttonActionConfig: ButtonActionConfig }; widgetChange?: Partial<CanvasWidget> } {
    return this.buttonConfig.createButtonActionFieldPatch(currentConfig, field, value, selectedWidget, selectedButtonId, buttons);
  }

  createButtonStylePatch(
    config: ButtonStyleConfig,
    selectedWidget: CanvasWidget | null,
    selectedButtonId: string | null,
    buttons: ButtonGroupButtonConfig[],
  ): { panelStatePatch: { buttonStyleConfig: ButtonStyleConfig }; widgetChange?: Partial<CanvasWidget> } {
    return this.buttonConfig.createButtonStylePatch(config, selectedWidget, selectedButtonId, buttons);
  }

  createButtonDisplayTypePatch(type: ButtonDisplayType, widget: CanvasWidget | null): Partial<CanvasWidget> | null {
    return this.buttonConfig.createButtonDisplayTypePatch(type, widget);
  }

  createButtonGroupLabelPatch(
    index: number,
    value: string,
    selectedWidget: CanvasWidget | null,
    buttons: ButtonGroupButtonConfig[],
  ): Partial<CanvasWidget> {
    return this.buttonConfig.createButtonGroupLabelPatch(index, value, selectedWidget, buttons);
  }

  createAddButtonGroupButtonPatch(
    selectedWidget: CanvasWidget | null,
    buttons: ButtonGroupButtonConfig[],
  ): { widgetChange: Partial<CanvasWidget>; selectedButtonGroupButtonId: string } {
    return this.buttonConfig.createAddButtonGroupButtonPatch(selectedWidget, buttons);
  }

  createRemoveButtonGroupButtonPatch(
    index: number,
    selectedWidget: CanvasWidget | null,
    buttons: ButtonGroupButtonConfig[],
  ): { widgetChange: Partial<CanvasWidget>; selectedButtonGroupButtonId: string } {
    return this.buttonConfig.createRemoveButtonGroupButtonPatch(index, selectedWidget, buttons);
  }

  createSelectedButtonGroupState(
    buttonId: string,
    buttons: ButtonGroupButtonConfig[],
  ): { selectedButtonGroupButtonId: string; buttonStyleConfig: ButtonStyleConfig; selectedAction: ButtonActionType; buttonActionConfig: ButtonActionConfig } | null {
    return this.buttonConfig.createSelectedButtonGroupState(buttonId, buttons);
  }

  createChartFormSelectionState(currentDraft: ChartWidgetConfig, form: { id: string; name: string }) {
    return this.chartReport.createChartFormSelectionState(currentDraft, form);
  }

  createChartSourceSelectionState(currentDraft: ChartWidgetConfig, formId: string, selectedFormName?: string) {
    return this.chartReport.createChartSourceSelectionState(currentDraft, formId, selectedFormName);
  }

  getNextChartConfig(currentConfig: ChartWidgetConfig, incomingConfig: ChartWidgetConfig): ChartWidgetConfig | null {
    return this.chartReport.getNextChartConfig(currentConfig, incomingConfig);
  }

  hasConfiguredCriteria(rows: SearchCriteriaRow[]): boolean {
    return this.chartReport.hasConfiguredCriteria(rows);
  }

  createCriteriaRow(prefix?: string): SearchCriteriaRow {
    return this.chartReport.createCriteriaRow(prefix);
  }

  formatCriteriaOperator(operator: string): string {
    return this.chartReport.formatCriteriaOperator(operator);
  }

  buildReportConfig(
    currentConfig: ReportWidgetConfig | null | undefined,
    sections: VisibilitySection[],
    allowPublicAccess: boolean,
    filterCriteriaRows: SearchCriteriaRow[],
    filterConfigured: boolean,
  ): ReportWidgetConfig | null {
    return this.chartReport.buildReportConfig(currentConfig, sections, allowPublicAccess, filterCriteriaRows, filterConfigured);
  }
}
