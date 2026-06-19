import { CanvasWidget, createDefaultButtonActionConfig, createDefaultButtonStyleConfig, createDefaultSelectWidgetConfig, createDefaultTableWidgetConfig, createDefaultTextBlockWidgetConfig } from '@builder/features/page-builder/models/page-builder-canvas.model';
import { ChartSettingsState, PanelConfigState, PanelDisplaySettingsState, SearchResultState, SearchStyleState } from '@builder/features/page-builder/models/page-builder-panel-state.model';
import { SearchCriteriaRow } from '@builder/features/page-builder/components/panel-config/search/search-criteria-modal';

export function createCriteriaRow(prefix: string): SearchCriteriaRow {
  return {
    id: `${prefix}-${Math.random().toString(36).slice(2, 10)}`,
    field: '',
    operator: '',
    value: '',
    joiner: 'AND',
  };
}

export function createDefaultPanelConfigState(): PanelConfigState {
  return {
    editableLabel: 'Staff In',
    buttonStyleConfig: createDefaultButtonStyleConfig(),
    selectedButtonGroupButtonId: null,
    chartPanelStep: 'select-form',
    selectedChartFormName: '',
    selectedBoardFormName: 'Staff In',
    tableWidgetConfig: createDefaultTableWidgetConfig(),
    selectWidgetConfig: createDefaultSelectWidgetConfig(),
    textBlockWidgetConfig: createDefaultTextBlockWidgetConfig(),
    reportCriteriaRows: [createCriteriaRow('report-criteria')],
    reportFilterConfigured: false,
    selectedAction: 'none',
    buttonActionConfig: createDefaultButtonActionConfig(),
    rightTab: 'display',
    reportTab: 'properties',
    propertiesActiveTab: 'display',
    selectedFormId: null,
    formSubmitActiveTab: 'properties',
  };
}

export function createDefaultChartSettingsState(): ChartSettingsState {
  return {
    valueType: 'aggregate',
    recordScope: 'all',
    selectedRecordCriteriaRows: [createCriteriaRow('chart-criteria')],
  };
}

export function createDefaultPanelDisplaySettingsState(): PanelDisplaySettingsState {
  return {
    criteria: 'all',
    rankingEnabled: true,
    groupedBy: 'Decision box',
    aggregateValue: 'Distinct count',
    fieldValue: 'Decision box',
    orderValue: 'Lowest to highest',
    panelLimit: 8,
    selectedRecordCriteriaRows: [createCriteriaRow('panel-display-criteria')],
  };
}

export function createDefaultSearchResultState(): SearchResultState {
  return {
    selectedResultTarget: null,
    selectedItemId: 'report-1',
    criteriaRows: [createCriteriaRow('search-result-criteria')],
    criteriaConfigured: false,
    openIn: 'New window',
    allowPublicAccess: true,
    defaultValue: '',
    placeholder: '',
  };
}

export function createDefaultSearchStyleState(): SearchStyleState {
  return {
    searchBoxShape: 'rectangular',
    fontFamily: 'Default font',
    searchButtonFontSize: '15 px',
    searchBarFontSize: '15 px',
    imageSource: 'none',
    searchButtonColor: 'var(--qo-color-neutral-800)',
    searchBarColor: 'var(--qo-color-neutral-800)',
    backgroundColor: 'var(--qo-color-neutral-0)',
    isSearchButtonBold: false,
    isSearchButtonItalic: true,
    isSearchBarBold: true,
    isSearchBarItalic: true,
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 0,
    paddingLeft: 0,
  };
}

export function createSearchStyleStateFromWidget(widget: CanvasWidget): SearchStyleState {
  const defaults = createDefaultSearchStyleState();

  return {
    searchBoxShape: widget.searchBoxShape ?? defaults.searchBoxShape,
    fontFamily:
      widget.searchBarFontFamily && widget.searchBarFontFamily !== 'inherit'
        ? widget.searchBarFontFamily
        : defaults.fontFamily,
    searchButtonFontSize: widget.searchButtonFontSize ?? defaults.searchButtonFontSize,
    searchBarFontSize: widget.searchBarFontSize ?? defaults.searchBarFontSize,
    imageSource: widget.searchImageSource ?? defaults.imageSource,
    searchButtonColor: widget.searchButtonColor ?? defaults.searchButtonColor,
    searchBarColor: widget.searchBarColor ?? defaults.searchBarColor,
    backgroundColor: widget.searchBackgroundColor ?? defaults.backgroundColor,
    isSearchButtonBold: widget.searchButtonBold ?? defaults.isSearchButtonBold,
    isSearchButtonItalic: widget.searchButtonItalic ?? defaults.isSearchButtonItalic,
    isSearchBarBold: widget.searchBarBold ?? defaults.isSearchBarBold,
    isSearchBarItalic: widget.searchBarItalic ?? defaults.isSearchBarItalic,
    paddingTop: widget.searchPaddingTop ?? defaults.paddingTop,
    paddingRight: widget.searchPaddingRight ?? defaults.paddingRight,
    paddingBottom: widget.searchPaddingBottom ?? defaults.paddingBottom,
    paddingLeft: widget.searchPaddingLeft ?? defaults.paddingLeft,
  };
}
