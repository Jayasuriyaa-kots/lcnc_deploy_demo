import { BoardWidgetVariant } from '@builder/features/page-builder/components/widget-showcase/board/board-widget.config';
import { ChartType } from '@builder/features/page-builder/components/widget-showcase/chart/ui-chart/ui-chart-picker.component';
import { ButtonVariant } from '@builder/features/page-builder/components/widget-showcase/button/ui-button/ui-button.component';
import { SearchVariant } from '@builder/features/page-builder/components/widget-showcase/search/ui-search/ui-search.component';
import { SnippetVariant } from '@builder/features/page-builder/components/widget-showcase/snippet/snippet-widget.config';
import { TextBlockVariant, getTextBlockWidgetPreset } from '@builder/features/page-builder/components/widget-showcase/text-block/text-block-widget.config';
import {
  cloneDataBindingConfig,
  createDefaultDataBindingConfig,
  DataBindingConfig,
} from '@builder/features/page-builder/models/data-binding.model';
import { SearchCriteriaRow } from '@builder/features/page-builder/components/panel-config/search/search-criteria-modal';

const DEFAULT_SURFACE_COLOR = 'var(--qo-color-neutral-0)';
const DEFAULT_TEXT_COLOR = 'var(--qo-color-neutral-900)';
const DEFAULT_PRIMARY_ACTION_COLOR = 'var(--qo-color-primary-700)';
const DEFAULT_BORDER_COLOR = 'var(--qo-border-color)';
const DEFAULT_BORDER_COLOR_STRONG = 'var(--qo-border-color-strong)';
const DEFAULT_FONT_FAMILY = 'var(--qo-font-family-sans)';
const DEFAULT_FONT_SIZE = 'var(--qo-text-xl)';
const DEFAULT_FONT_SIZE_SM = 'var(--qo-text-sm)';
const DEFAULT_FONT_WEIGHT = 'var(--qo-font-normal)';
const DEFAULT_LINE_HEIGHT = 'var(--qo-leading-normal)';
const DEFAULT_RADIUS_LG = 'var(--qo-radius-lg)';
const DEFAULT_RADIUS_XL = 'var(--qo-radius-xl)';
const DEFAULT_SPACE_MD = 'var(--qo-space-4)';
const DEFAULT_RADIUS = 'var(--qo-radius-sm)';

export type CanvasWidgetType =
  | 'form-embed'
  | 'form-button'
  | 'form-action-card'
  | 'report-embed'
  | 'report-button'
  | 'report-action-card'
  | 'panel-showcase'
  | 'table-showcase'
  | 'select-showcase'
  | 'button-showcase'
  | 'search-showcase'
  | 'chart-showcase'
  | 'board-showcase'
  | 'snippet-showcase'
  | 'text-block-showcase'
  | 'media-showcase';

export type TableSize = 'short' | 'default' | 'tall';

export type TableColumnType = 'number' | 'url' | 'text';

export interface TableColumnConfig {
  key: string;
  label: string;
  visible: boolean;
  order: number;
  width: number;
  align: 'left' | 'center' | 'right';
  type: TableColumnType;
}

export interface TableWidgetConfig {
  visible: boolean;
  rowsPerPage: number;
  tableSize: TableSize;
  backgroundColor: string;
  borderColor: string;
  borderRadius: string;
  showSearch: boolean;
  showDownload: boolean;
  showSorting: boolean;
  showColumnFilters: boolean;
  enableAdd: boolean;
  enableEdit: boolean;
  enableDelete: boolean;
  enableDuplicate: boolean;
  dataSourceKey: string;
  queryId: string;
  queryBinding: string;
  dataColumns: string[];
  columnConfigs: TableColumnConfig[];
  dataRows: Array<Record<string, string | number>>;
}

export interface SelectWidgetOption {
  id: string;
  label: string;
  value: string;
}

export type SelectWidgetVariant = 'select' | 'multiselect' | 'radio';

export interface SelectWidgetConfig {
  variant: SelectWidgetVariant;
  visible: boolean;
  label: string;
  placeholder: string;
  options: SelectWidgetOption[];
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  datasourceId: string;
  queryId: string;
  queryBinding: string;
  labelField: string;
  valueField: string;
  defaultValue: string | number | null;
  allowSearch: boolean;
  multiSelect: boolean;
}

export interface TextBlockWidgetConfig {
  label: string;
  widgetName: string;
  labelColor: string;
  labelFontSize: string;
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  letterSpacing: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  lineThrough: boolean;
  textAlign: 'left' | 'center' | 'right';
  inputType: TextBlockVariant;
  allowTypeSelection: boolean;
  visible: boolean;
  backgroundColor: string;
  borderColor: string;
  borderWidth: string;
  borderRadius: string;
  placeholder: string;
  text: string;
  defaultValue: string;
  contentSource: 'static' | 'datasource';
  datasourceId: string;
  queryId: string;
  recordId: string;
  field: string;
  overflowText: 'scroll' | 'truncate' | 'none';
  disableLinks: boolean;
  allowedFileTypes: string;
  dataFormat: string;
  maxFiles: number;
  animateLoading: boolean;
  dateFormat: string;
  minDate: string;
  maxDate: string;
  required: boolean;
  readOnly: boolean;
  disabled: boolean;
  minLength: number | null;
  maxLength: number | null;
  customRegex: string;
}

export interface ChartAggregateValueSelection {
  tab: string | null;
  value: string | null;
}

export interface ChartWidgetConfig {
  datasourceId: string;
  datasourceLabel: string;
  queryId: string;
  queryBinding: string;
  xAxisCategory: string;
  xAxisLabel: string;
  yAxisField: string;
  yAxisStackBy: string;
  aggregateValue: ChartAggregateValueSelection;
  yAxisLabel: string;
  interval: string;
  filterDataBasedOn: Array<string | number>;
  showDataLabel: boolean;
  showUnderlyingData: boolean;
  valueType: 'aggregate' | 'actual';
  recordScope: 'all' | 'selected';
  selectedRecordCriteriaRows: SearchCriteriaRow[];
  chartColor: string;
  chartColorSecondary: string;
}

export interface SnippetWidgetConfig {
  markup: string;
  backgroundColor: string;
  textColor: string;
  padding: string;
  borderRadius: string;
}

export type ButtonActionType =
  | 'none'
  | 'open-url'
  | 'open-form'
  | 'open-report'
  | 'open-page'
  | 'execute-function';

export type ButtonActionOpenIn = 'new-window' | 'same-window' | 'popup';

export interface ButtonActionConfig {
  type: ButtonActionType;
  url: string;
  openIn: ButtonActionOpenIn;
  formId: string;
  reportId: string;
  pageId: string;
  datasourceId: string;
  queryBinding: string;
  queryParams: string;
  functionName: string;
}

export interface ButtonGroupButtonConfig {
  id: string;
  label: string;
  buttonStyleConfig?: ButtonStyleConfig;
  selectedAction?: string;
  buttonActionConfig?: ButtonActionConfig;
}

export interface ButtonGroupConfig {
  buttons: ButtonGroupButtonConfig[];
}

export type MediaWidgetType = 'image' | 'video' | 'pdf';
export type MediaWidgetSourceMode = 'static-url' | 'upload' | 'datasource';

export interface MediaWidgetConfig {
  visible: boolean;
  mediaType: MediaWidgetType;
  sourceMode: MediaWidgetSourceMode;
  title: string;
  caption: string;
  backgroundColor: string;
  sourceUrl: string;
  datasourceId: string;
  queryId: string;
  queryBinding: string;
  recordId: string;
  imageField: string;
  titleField: string;
  captionField: string;
  showTitle: boolean;
  showCaption: boolean;
  uploadedImageDataUrl: string;
  uploadedVideoDataUrl: string;
  uploadedPdfDataUrl: string;
  autoPlay: boolean;
  pdfDefaultPage: number;
  pdfShowToolbar: boolean;
  pdfAllowDownload: boolean;
  pdfAllowPrint: boolean;
  pdfZoomLevel: number;
  pdfFitToWidth: boolean;
  pdfDisabled: boolean;
  pdfLoadingState: boolean;
}

export type PanelWidgetAlignment = 'left' | 'center' | 'right';
export type PanelWidgetIconPlacement = 'before' | 'after';
export type PanelWidgetSourceType =
  | 'text'
  | 'query_field'
  | 'aggregation'
  | 'kpi_percentage'
  | 'page_variable'
  | 'widget_binding'
  | 'preset';
export type PanelWidgetAggregationType =
  | 'sum'
  | 'min'
  | 'max'
  | 'average'
  | 'median'
  | 'count'
  | 'distinct_count';
export type PanelWidgetPresetId = 'revenue_kpi' | 'occupancy_percentage' | 'asset_summary';
export type PanelWidgetLayoutVariant =
  | 'simple-value-top'
  | 'simple-value-bottom'
  | 'icon-center-value-top'
  | 'icon-center-value-bottom'
  | 'icon-left-value-top'
  | 'icon-left-value-bottom'
  | 'icon-right-value-top'
  | 'icon-right-value-bottom'
  | 'icon-inline-center-title-top'
  | 'icon-inline-center-title-bottom'
  | 'icon-inline-split-title-top'
  | 'icon-inline-split-title-bottom';

export interface PanelWidgetConfig {
  visible: boolean;
  title: string;
  value: string;
  subtitle: string;
  caption: string;
  trend: string;
  suffix: string;
  titleColor: string;
  iconSymbol: string;
  iconBackgroundColor: string;
  iconColor: string;
  valueColor: string;
  backgroundColor: string;
  borderColor: string;
  borderRadius: string;
  alignment: PanelWidgetAlignment;
  iconPlacement: PanelWidgetIconPlacement;
  layoutVariant: PanelWidgetLayoutVariant;
  binding?: DataBindingConfig;
  sourceType: PanelWidgetSourceType;
  datasourceId: string;
  queryId: string;
  field: string;
  aggregationType: PanelWidgetAggregationType;
  filters: SearchCriteriaRow[];
  condition: SearchCriteriaRow | null;
  staticText: string;
  bindingExpression: string;
  presetId: PanelWidgetPresetId | '';
}

export interface FormWidgetFieldPreview {
  id: string;
  label: string;
  type: string;
  placeholder: string;
  required: boolean;
  options: string[];
}

export interface FormWidgetSubmitConfig {
  successMessage: string;
  submitButtonText: string;
  resetButtonText: string;
  allowPublicAccess: boolean;
}

export interface FormWidgetConfig {
  formId: string;
  applicationLabel: string;
  formLabel: string;
  fields: FormWidgetFieldPreview[];
  actionLabels: string[];
  submitConfig: FormWidgetSubmitConfig;
}

export interface ReportWidgetColumnPreview {
  id: string;
  label: string;
  sourceFieldId?: string;
}

export interface ReportWidgetRowPreview {
  id: string;
  values: string[];
}

export interface ReportWidgetVisibilityConfig {
  add: boolean;
  edit: boolean;
  delete: boolean;
  duplicate: boolean;
  search: boolean;
  retain: boolean;
  print: boolean;
  export: boolean;
  recordsCount: boolean;
  bulkEdit: boolean;
  bulkDelete: boolean;
  bulkDuplicate: boolean;
}

export interface ReportWidgetConfig {
  reportId: string;
  applicationLabel: string;
  reportLabel: string;
  sourceFormId: string;
  sourceFormLabel: string;
  columns: ReportWidgetColumnPreview[];
  rows: ReportWidgetRowPreview[];
  visibility: ReportWidgetVisibilityConfig;
  allowPublicAccess: boolean;
  filterCriteriaRows: SearchCriteriaRow[];
  filterConfigured: boolean;
}

export interface ButtonStyleConfig {
  cornerRadius: number;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  textCase: 'default' | 'uppercase' | 'lowercase';
  fontFamily: string;
  fontSize: string;
  color: string;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
  marginTop: number;
  marginRight: number;
  marginBottom: number;
  marginLeft: number;
}

export interface CanvasWidgetProps {
  label?: string;
  chartConfig?: ChartWidgetConfig;
  panelConfig?: PanelWidgetConfig;
  tableConfig?: TableWidgetConfig;
  selectConfig?: SelectWidgetConfig;
  snippetConfig?: SnippetWidgetConfig;
  buttonGroupConfig?: ButtonGroupConfig;
  buttonActionConfig?: ButtonActionConfig;
  textBlockConfig?: TextBlockWidgetConfig;
  mediaConfig?: MediaWidgetConfig;
  formConfig?: FormWidgetConfig;
  reportConfig?: ReportWidgetConfig;
}

export type SearchBoxShape = 'rectangular' | 'rounded';

export interface CanvasWidget {
  id: string;
  type: CanvasWidgetType;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  widgetProps?: CanvasWidgetProps;
  buttonVariant?: ButtonVariant;
  buttonIcon?: string;
  buttonIconSize?: number;
  buttonIconImageDataUrl?: string;
  searchVariant?: SearchVariant;
  searchBoxShape?: SearchBoxShape;
  searchButtonColor?: string;
  searchButtonFontSize?: string;
  searchButtonBold?: boolean;
  searchButtonItalic?: boolean;
  searchBarColor?: string;
  searchBarFontFamily?: string;
  searchBarFontSize?: string;
  searchBarBold?: boolean;
  searchBarItalic?: boolean;
  searchBackgroundColor?: string;
  searchImageSource?: 'my-library' | 'web-link' | 'none';
  searchPaddingTop?: number;
  searchPaddingRight?: number;
  searchPaddingBottom?: number;
  searchPaddingLeft?: number;
  chartType?: ChartType;
  chartTypeLabel?: string;
  boardVariant?: BoardWidgetVariant;
  boardLayoutType?: 'list' | 'grid';
  boardPanelsPerRow?: number;
  boardBackgroundColor?: string;
  boardImageSource?: 'my-library' | 'web-link' | 'none';
  boardPaddingTop?: number;
  boardPaddingRight?: number;
  boardPaddingBottom?: number;
  boardPaddingLeft?: number;
  snippetVariant?: SnippetVariant;
  textBlockVariant?: TextBlockVariant;
  buttonStyleConfig?: ButtonStyleConfig;
}

export function createDefaultTableWidgetConfig(): TableWidgetConfig {
  return {
    visible: true,
    rowsPerPage: 10,
    tableSize: 'default',
    backgroundColor: DEFAULT_SURFACE_COLOR,
    borderColor: DEFAULT_BORDER_COLOR,
    borderRadius: DEFAULT_RADIUS,
    showSearch: true,
    showDownload: true,
    showSorting: true,
    showColumnFilters: true,
    enableAdd: false,
    enableEdit: false,
    enableDelete: false,
    enableDuplicate: false,
    dataSourceKey: '',
    queryId: '',
    queryBinding: '',
    dataColumns: [],
    columnConfigs: [],
    dataRows: [],
  };
}

export function createDefaultSelectWidgetConfig(): SelectWidgetConfig {
  return {
    variant: 'select',
    visible: true,
    label: '',
    placeholder: 'Choose an option...',
    options: [
      { id: 'opt-1', label: 'Option 1', value: 'option_1' },
      { id: 'opt-2', label: 'Option 2', value: 'option_2' },
      { id: 'opt-3', label: 'Option 3', value: 'option_3' },
    ],
    backgroundColor: DEFAULT_SURFACE_COLOR,
    textColor: DEFAULT_TEXT_COLOR,
    borderColor: DEFAULT_BORDER_COLOR_STRONG,
    datasourceId: '',
    queryId: '',
    queryBinding: '',
    labelField: '',
    valueField: '',
    defaultValue: null,
    allowSearch: false,
    multiSelect: false,
  };
}

export function createDefaultButtonStyleConfig(): ButtonStyleConfig {
  return {
    cornerRadius: 3,
    bold: false,
    italic: true,
    underline: false,
    textCase: 'default',
    fontFamily: DEFAULT_FONT_FAMILY,
    fontSize: DEFAULT_FONT_SIZE,
    color: DEFAULT_SURFACE_COLOR,
    fillColor: DEFAULT_PRIMARY_ACTION_COLOR,
    strokeColor: DEFAULT_PRIMARY_ACTION_COLOR,
    strokeWidth: 0,
    paddingTop: 12,
    paddingRight: 15,
    paddingBottom: 12,
    paddingLeft: 15,
    marginTop: 0,
    marginRight: 0,
    marginBottom: 0,
    marginLeft: 0,
  };
}

export function createDefaultTextBlockWidgetConfig(variant: TextBlockVariant = 'text'): TextBlockWidgetConfig {
  const preset = getTextBlockWidgetPreset(variant);

  return {
    label: preset.label,
    widgetName: '',
    labelColor: DEFAULT_TEXT_COLOR,
    labelFontSize: DEFAULT_FONT_SIZE_SM,
    fontFamily: DEFAULT_FONT_FAMILY,
    fontSize: DEFAULT_FONT_SIZE_SM,
    lineHeight: DEFAULT_LINE_HEIGHT,
    letterSpacing: 'normal',
    fontWeight: DEFAULT_FONT_WEIGHT,
    bold: false,
    italic: false,
    underline: false,
    lineThrough: false,
    textAlign: 'left',
    inputType: variant,
    allowTypeSelection: variant === 'text',
    visible: true,
    backgroundColor: variant === 'labeltext' ? 'transparent' : DEFAULT_SURFACE_COLOR,
    borderColor: variant === 'labeltext' ? 'transparent' : DEFAULT_BORDER_COLOR,
    borderWidth: variant === 'labeltext' ? '0' : '1',
    borderRadius: variant === 'labeltext' ? '0' : DEFAULT_RADIUS,
    placeholder: preset.placeholder,
    text: variant === 'labeltext' ? preset.placeholder : '',
    defaultValue: variant === 'labeltext' ? preset.placeholder : '',
    contentSource: 'static',
    datasourceId: '',
    queryId: '',
    recordId: '',
    field: '',
    overflowText: 'none',
    disableLinks: false,
    allowedFileTypes: 'all',
    dataFormat: 'file',
    maxFiles: 1,
    animateLoading: true,
    dateFormat: variant === 'date' ? 'dd/mm/yyyy hh:mm' : '',
    minDate: '',
    maxDate: '',
    required: false,
    readOnly: false,
    disabled: false,
    minLength: null,
    maxLength: null,
    customRegex: '',
  };
}

export function createDefaultMediaWidgetConfig(mediaType: MediaWidgetType = 'image'): MediaWidgetConfig {
  const isPdf = mediaType === 'pdf';

  return {
    visible: true,
    mediaType,
    sourceMode: 'static-url',
    title: mediaType === 'video' ? 'Video Content' : mediaType === 'pdf' ? 'PDF Viewer' : 'Image Content',
    caption:
      mediaType === 'video'
        ? 'Embedded video preview'
        : mediaType === 'pdf'
          ? 'Scrollable document preview'
          : 'Responsive media preview',
    backgroundColor: varMediaBackground(mediaType),
    sourceUrl: '',
    datasourceId: '',
    queryId: '',
    queryBinding: '',
    recordId: '',
    imageField: '',
    titleField: '',
    captionField: '',
    showTitle: true,
    showCaption: true,
    uploadedImageDataUrl: '',
    uploadedVideoDataUrl: '',
    uploadedPdfDataUrl: '',
    autoPlay: false,
    pdfDefaultPage: 1,
    pdfShowToolbar: isPdf,
    pdfAllowDownload: isPdf,
    pdfAllowPrint: isPdf,
    pdfZoomLevel: 100,
    pdfFitToWidth: isPdf,
    pdfDisabled: false,
    pdfLoadingState: false,
  };
}

export function createDefaultPanelWidgetConfig(): PanelWidgetConfig {
  return {
    visible: true,
    title: 'Summary Card',
    value: '0',
    subtitle: 'Configure a static value or connect a datasource',
    caption: '',
    trend: '',
    suffix: '',
    titleColor: DEFAULT_TEXT_COLOR,
    iconSymbol: 'trending_up',
    iconBackgroundColor: DEFAULT_PRIMARY_ACTION_COLOR,
    iconColor: DEFAULT_SURFACE_COLOR,
    valueColor: DEFAULT_PRIMARY_ACTION_COLOR,
    backgroundColor: DEFAULT_SURFACE_COLOR,
    borderColor: DEFAULT_BORDER_COLOR,
    borderRadius: DEFAULT_RADIUS_XL,
    alignment: 'right',
    iconPlacement: 'before',
    layoutVariant: 'icon-left-value-top',
    binding: {
      ...createDefaultDataBindingConfig(),
      mode: 'static',
      staticValue: '80%',
    },
    sourceType: 'text',
    datasourceId: '',
    queryId: '',
    field: '',
    aggregationType: 'sum',
    filters: [],
    condition: null,
    staticText: '80%',
    bindingExpression: '',
    presetId: '',
  };
}

export function createDefaultButtonActionConfig(): ButtonActionConfig {
  return {
    type: 'none',
    url: '',
    openIn: 'same-window',
    formId: '',
    reportId: '',
    pageId: '',
    datasourceId: '',
    queryBinding: '',
    queryParams: '',
    functionName: '',
  };
}

export function createDefaultFormWidgetSubmitConfig(): FormWidgetSubmitConfig {
  return {
    successMessage: 'Form submitted successfully.',
    submitButtonText: 'Submit',
    resetButtonText: 'Reset',
    allowPublicAccess: false,
  };
}

export function createDefaultReportWidgetVisibilityConfig(): ReportWidgetVisibilityConfig {
  return {
    add: true,
    edit: true,
    delete: true,
    duplicate: true,
    search: true,
    retain: false,
    print: true,
    export: true,
    recordsCount: true,
    bulkEdit: true,
    bulkDelete: true,
    bulkDuplicate: true,
  };
}

export function createDefaultSnippetWidgetConfig(variant: SnippetVariant = 'html'): SnippetWidgetConfig {
  if (variant === 'embed') {
    return {
      markup: '<iframe src="https://example.com" title="Embedded content"></iframe>',
      backgroundColor: DEFAULT_SURFACE_COLOR,
      textColor: DEFAULT_TEXT_COLOR,
      padding: DEFAULT_SPACE_MD,
      borderRadius: DEFAULT_RADIUS,
    };
  }

  return {
    markup: '<section>\n  <h2>Custom HTML block</h2>\n  <p>Add your HTML snippet content here.</p>\n</section>',
    backgroundColor: DEFAULT_SURFACE_COLOR,
    textColor: DEFAULT_TEXT_COLOR,
    padding: DEFAULT_SPACE_MD,
    borderRadius: DEFAULT_RADIUS,
  };
}

export function createDefaultChartWidgetConfig(datasourceId = '', datasourceLabel = ''): ChartWidgetConfig {
  return {
    datasourceId,
    datasourceLabel,
    queryId: '',
    queryBinding: '',
    xAxisCategory: '',
    xAxisLabel: '',
    yAxisField: '',
    yAxisStackBy: '',
    aggregateValue: { tab: null, value: null },
    yAxisLabel: '',
    interval: '',
    filterDataBasedOn: [],
    showDataLabel: false,
    showUnderlyingData: false,
    valueType: 'aggregate',
    recordScope: 'all',
    selectedRecordCriteriaRows: [],
    chartColor: '',
    chartColorSecondary: '',
  };
}

export function cloneButtonActionConfig(config: ButtonActionConfig): ButtonActionConfig {
  return {
    ...createDefaultButtonActionConfig(),
    ...config,
  };
}

export function cloneButtonStyleConfig(config?: ButtonStyleConfig | null): ButtonStyleConfig {
  return {
    ...createDefaultButtonStyleConfig(),
    ...(config ?? {}),
  };
}

export function cloneTableWidgetConfig(config?: TableWidgetConfig | null): TableWidgetConfig {
  return {
    ...createDefaultTableWidgetConfig(),
    ...(config ?? {}),
    dataColumns: [...(config?.dataColumns ?? [])],
    dataRows: (config?.dataRows ?? []).map((row) => ({ ...row })),
  };
}

export function cloneSelectWidgetConfig(config?: SelectWidgetConfig | null): SelectWidgetConfig {
  const source = config ?? createDefaultSelectWidgetConfig();
  return {
    ...createDefaultSelectWidgetConfig(),
    ...source,
    options: (source.options ?? []).map((option) => ({ ...option })),
  };
}

export function cloneSnippetWidgetConfig(config?: SnippetWidgetConfig | null): SnippetWidgetConfig {
  return {
    ...createDefaultSnippetWidgetConfig(),
    ...(config ?? {}),
  };
}

export function cloneTextBlockWidgetConfig(config?: TextBlockWidgetConfig | null): TextBlockWidgetConfig {
  return {
    ...createDefaultTextBlockWidgetConfig(config?.inputType ?? 'text'),
    ...(config ?? {}),
  };
}

export function cloneMediaWidgetConfig(config?: MediaWidgetConfig | null): MediaWidgetConfig {
  return {
    ...createDefaultMediaWidgetConfig(config?.mediaType ?? 'image'),
    ...(config ?? {}),
  };
}

export function clonePanelWidgetConfig(config?: PanelWidgetConfig | null): PanelWidgetConfig {
  return {
    ...createDefaultPanelWidgetConfig(),
    ...(config ?? {}),
    binding: cloneDataBindingConfig(config?.binding),
    filters: (config?.filters ?? []).map((item) => ({ ...item })),
    condition: config?.condition ? { ...config.condition } : null,
  };
}

export function cloneFormWidgetConfig(config: FormWidgetConfig): FormWidgetConfig {
  return {
    ...config,
    fields: config.fields.map((field) => ({
      ...field,
      options: [...field.options],
    })),
    actionLabels: [...config.actionLabels],
    submitConfig: {
      ...createDefaultFormWidgetSubmitConfig(),
      ...(config.submitConfig ?? {}),
    },
  };
}

export function cloneReportWidgetConfig(config: ReportWidgetConfig): ReportWidgetConfig {
  return {
    reportId: config.reportId,
    applicationLabel: config.applicationLabel,
    reportLabel: config.reportLabel,
    sourceFormId: config.sourceFormId,
    sourceFormLabel: config.sourceFormLabel,
    columns: config.columns.map((column) => ({ ...column })),
    rows: config.rows.map((row) => ({
      id: row.id,
      values: [...row.values],
    })),
    visibility: {
      ...createDefaultReportWidgetVisibilityConfig(),
      ...(config.visibility ?? {}),
    },
    allowPublicAccess: config.allowPublicAccess ?? false,
    filterCriteriaRows: (config.filterCriteriaRows ?? []).map((row) => ({ ...row })),
    filterConfigured: config.filterConfigured ?? false,
  };
}

export function cloneChartWidgetConfig(config?: ChartWidgetConfig | null): ChartWidgetConfig {
  return {
    ...createDefaultChartWidgetConfig(config?.datasourceId ?? '', config?.datasourceLabel ?? ''),
    ...(config ?? {}),
    aggregateValue: {
      tab: config?.aggregateValue?.tab ?? null,
      value: config?.aggregateValue?.value ?? null,
    },
    filterDataBasedOn: [...(config?.filterDataBasedOn ?? [])],
    selectedRecordCriteriaRows: (config?.selectedRecordCriteriaRows ?? []).map((row) => ({ ...row })),
  };
}

export function cloneCanvasWidget(widget: CanvasWidget): CanvasWidget {
  const formConfig = widget.widgetProps?.formConfig ? cloneFormWidgetConfig(widget.widgetProps.formConfig) : undefined;
  const reportConfig = widget.widgetProps?.reportConfig ? cloneReportWidgetConfig(widget.widgetProps.reportConfig) : undefined;

  return {
    ...widget,
    buttonStyleConfig: widget.buttonStyleConfig ? cloneButtonStyleConfig(widget.buttonStyleConfig) : undefined,
    widgetProps: widget.widgetProps
      ? {
          ...widget.widgetProps,
          chartConfig: widget.widgetProps.chartConfig ? cloneChartWidgetConfig(widget.widgetProps.chartConfig) : undefined,
          panelConfig: widget.widgetProps.panelConfig ? clonePanelWidgetConfig(widget.widgetProps.panelConfig) : undefined,
          tableConfig: widget.widgetProps.tableConfig ? cloneTableWidgetConfig(widget.widgetProps.tableConfig) : undefined,
          selectConfig: widget.widgetProps.selectConfig ? cloneSelectWidgetConfig(widget.widgetProps.selectConfig) : undefined,
          snippetConfig: widget.widgetProps.snippetConfig ? cloneSnippetWidgetConfig(widget.widgetProps.snippetConfig) : undefined,
          buttonActionConfig: widget.widgetProps.buttonActionConfig
            ? cloneButtonActionConfig(widget.widgetProps.buttonActionConfig)
            : undefined,
          buttonGroupConfig: widget.widgetProps.buttonGroupConfig
            ? {
                buttons: widget.widgetProps.buttonGroupConfig.buttons.map((button) => ({
                  ...button,
                  buttonStyleConfig: button.buttonStyleConfig ? cloneButtonStyleConfig(button.buttonStyleConfig) : undefined,
                  buttonActionConfig: button.buttonActionConfig ? cloneButtonActionConfig(button.buttonActionConfig) : undefined,
                })),
              }
            : undefined,
          textBlockConfig: widget.widgetProps.textBlockConfig ? cloneTextBlockWidgetConfig(widget.widgetProps.textBlockConfig) : undefined,
          mediaConfig: widget.widgetProps.mediaConfig ? cloneMediaWidgetConfig(widget.widgetProps.mediaConfig) : undefined,
          formConfig,
          reportConfig,
        }
      : formConfig || reportConfig
        ? {
            formConfig,
            reportConfig,
          }
        : undefined,
  };
}

export function cloneCanvasWidgets(widgets: CanvasWidget[]): CanvasWidget[] {
  return widgets.map((widget) => cloneCanvasWidget(widget));
}

export function getFormInputType(field: FormWidgetFieldPreview): string {
  switch (field.type) {
    case 'email':
      return 'email';
    case 'date':
      return 'date';
    case 'number':
    case 'currency':
      return 'number';
    case 'password':
      return 'password';
    case 'url':
      return 'url';
    default:
      return 'text';
  }
}

export function isSelectLikeField(field: FormWidgetFieldPreview): boolean {
  return field.type === 'dropdown' || field.options.length > 0;
}

export function buildPrintableReportMarkup(reportConfig: ReportWidgetConfig, rows: ReportWidgetRowPreview[]): string {
  const headCells = reportConfig.columns.map((column) => `<th>${escapeHtml(column.label)}</th>`).join('');
  const bodyRows = rows
    .map((row) => `<tr>${row.values.map((value) => `<td>${escapeHtml(value)}</td>`).join('')}</tr>`)
    .join('');

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(reportConfig.reportLabel)}</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 24px; color: #111827; }
      h1 { font-size: 22px; margin: 0 0 8px; }
      p { margin: 0 0 18px; color: #6b7280; }
      table { width: 100%; border-collapse: collapse; }
      th, td { border: 1px solid #d1d5db; padding: 10px 12px; text-align: left; font-size: 14px; }
      th { background: #f3f4f6; font-weight: 700; }
    </style>
  </head>
  <body>
    <h1>${escapeHtml(reportConfig.reportLabel)}</h1>
    <p>${rows.length} rows</p>
    <table>
      <thead><tr>${headCells}</tr></thead>
      <tbody>${bodyRows}</tbody>
    </table>
  </body>
</html>`;
}

export function escapeCsvValue(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
}

export function slugifyReportLabel(label: string): string {
  return label.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'report';
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function varMediaBackground(mediaType: MediaWidgetType): string {
  if (mediaType === 'video') {
    return 'var(--qo-color-neutral-900)';
  }

  if (mediaType === 'pdf') {
    return 'var(--qo-color-neutral-50)';
  }

  return 'var(--qo-color-neutral-100)';
}
