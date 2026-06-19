import { SearchCriteriaRow } from '@builder/features/page-builder/components/panel-config/search/search-criteria-modal';
import {
  ButtonActionConfig,
  ButtonStyleConfig,
  SearchBoxShape,
  SelectWidgetConfig,
  TableWidgetConfig,
  TextBlockWidgetConfig,
} from '@builder/features/page-builder/models/page-builder-canvas.model';

export type { SearchBoxShape } from '@builder/features/page-builder/models/page-builder-canvas.model';

export type PanelRightTab = 'display' | 'content' | 'action' | 'style';
export type PanelReportTab = 'properties' | 'filter';
export type PanelChartStep = 'select-form' | 'settings';
export type ChartValueType = 'aggregate' | 'actual';
export type ChartRecordScope = 'all' | 'selected';
export type ReportCriteriaType = 'all' | 'selected';
export type SearchResultTarget = 'report' | 'page';
export type SearchOpenIn = 'New window' | 'Same window';
export type SearchImageSource = 'my-library' | 'web-link' | 'none';
export type BoardLayoutType = 'list' | 'grid';
export type BoardImageSource = 'my-library' | 'web-link' | 'none';
export type PropertiesTab = 'display' | 'action' | 'style';
export type FormSubmitTab = 'properties' | 'fieldValues';

export interface PanelConfigState {
  editableLabel: string;
  buttonStyleConfig: ButtonStyleConfig;
  selectedButtonGroupButtonId: string | null;
  chartPanelStep: PanelChartStep;
  selectedChartFormName: string;
  selectedBoardFormName: string;
  tableWidgetConfig: TableWidgetConfig;
  selectWidgetConfig: SelectWidgetConfig;
  textBlockWidgetConfig: TextBlockWidgetConfig;
  reportCriteriaRows: SearchCriteriaRow[];
  reportFilterConfigured: boolean;
  selectedAction: string;
  buttonActionConfig: ButtonActionConfig;
  rightTab: PanelRightTab;
  reportTab: PanelReportTab;
  propertiesActiveTab: PropertiesTab;
  selectedFormId: string | null;
  formSubmitActiveTab: FormSubmitTab;
}

export interface ChartSettingsState {
  valueType: ChartValueType;
  recordScope: ChartRecordScope;
  selectedRecordCriteriaRows: SearchCriteriaRow[];
}

export interface PanelDisplaySettingsState {
  criteria: ReportCriteriaType;
  rankingEnabled: boolean;
  groupedBy: string;
  aggregateValue: string;
  fieldValue: string;
  orderValue: string;
  panelLimit: number;
  selectedRecordCriteriaRows: SearchCriteriaRow[];
}

export interface SearchResultState {
  selectedResultTarget: SearchResultTarget | null;
  selectedItemId: string;
  criteriaRows: SearchCriteriaRow[];
  criteriaConfigured: boolean;
  openIn: SearchOpenIn;
  allowPublicAccess: boolean;
  defaultValue: string;
  placeholder: string;
}

export interface SearchStyleState {
  searchBoxShape: SearchBoxShape;
  fontFamily: string;
  searchButtonFontSize: string;
  searchBarFontSize: string;
  imageSource: SearchImageSource;
  searchButtonColor: string;
  searchBarColor: string;
  backgroundColor: string;
  isSearchButtonBold: boolean;
  isSearchButtonItalic: boolean;
  isSearchBarBold: boolean;
  isSearchBarItalic: boolean;
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
}

export interface BoardStyleState {
  layoutType: BoardLayoutType;
  panelsPerRow: number;
  backgroundColor: string;
  imageSource: BoardImageSource;
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
}
