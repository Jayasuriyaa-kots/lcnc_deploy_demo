export type ReportConfigTab = 'quick' | 'detail';
export type ReportConfigMode = 'actions' | 'layout';
export type QuickLayout = 'list' | 'card' | 'custom';
export type DetailLayout =
  | 'all-fields'
  | 'block-view'
  | 'tab-view'
  | 'all_fields'
  | 'block_layout'
  | 'custom_layout';
export type WizardStep = 1 | 2 | 3;

export type QuickViewCustomSlot =
  | 'image'
  | 'title'
  | 'body'
  | 'meta_left'
  | 'meta_right';

export type QuickViewCustomTab = 'display' | 'style';
export type QuickViewImageShape = 'square' | 'circle' | 'full';
export type QuickViewSlotAlign = 'left' | 'center' | 'right';
export type QuickViewCanvasVisualType = 'text' | 'image' | 'icon' | 'button';

export interface QuickViewBoxPadding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface QuickViewSlotStyles {
  align: QuickViewSlotAlign;
  backgroundColor: string;
  padding: QuickViewBoxPadding;
}

export interface QuickViewCustomStyles {
  cardBackgroundColor: string;
  cardPadding: QuickViewBoxPadding;
  slotStyles: Record<QuickViewCustomSlot, QuickViewSlotStyles>;
  titleColor: string;
  titleFontSize: number;
  titleFontWeight: number;
  bodyColor: string;
  bodyFontSize: number;
  metaColor: string;
  metaFontSize: number;
  imageShape: QuickViewImageShape;
}

export interface QuickViewCanvasElement {
  instanceId: string;
  slotId: QuickViewCustomSlot;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  visualType?: QuickViewCanvasVisualType;
  iconGlyph?: string;
  buttonVariant?: 'filled' | 'outline';
  fontSize?: number;
  fontWeight?: number;
  textAlign?: 'left' | 'center' | 'right';
  textColor?: string;
  backgroundColor?: string;
}

export interface QuickViewCanvasLayout {
  containerWidth: number;
  containerHeight: number;
  elements: QuickViewCanvasElement[];
}

export interface ReportQuickViewCustomLayout {
  templateMode?: boolean;
  templateVariant?: 'block' | 'list';
  selectedSlot: QuickViewCustomSlot;
  activeTab: QuickViewCustomTab;
  slots: {
    image: string;
    title: string;
    body: string;
    meta_left: string;
    meta_right: string;
  };
  styles: QuickViewCustomStyles;
  canvasLayout?: QuickViewCanvasLayout;
}

export interface CanvasItemFieldStyle {
  styleMode: 'theme' | 'styles';
  fontSize: number;
  fontWeight: string;
  textColor: string;
  labelAlign: string;
  bgColor: string;
  // Text formatting (optional for backward-compatibility with older saved layouts)
  textAlign?: string;
  textTransform?: string;
  fontStyle?: string;
  textDecoration?: string;
  borderEnabled: boolean;
  borderWidth: number;
  borderStyle: string;
  borderColor: string;
  borderSameAllSides: boolean;
  shadowEnabled: boolean;
  shadowX: number;
  shadowY: number;
  shadowBlur: number;
  shadowSpread: number;
  shadowColor: string;
  radiusEnabled: boolean;
  radiusValue: number;
  radiusSameAllSides: boolean;
  paddingEnabled: boolean;
  paddingValue: number;
  paddingSameAllSides: boolean;
  marginEnabled: boolean;
}

export interface ReportDetailCanvasItem {
  id: string;
  type: 'field' | 'section' | 'tab' | 'table' | 'text' | 'icon' | 'line';
  fieldId: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  style: CanvasItemFieldStyle;
  parentSectionId?: string | null;
  parentTabItemId?: string | null;
  parentTabKey?: string | null;
  tabLabels?: string[];
  textContent?: string;
}

export interface ReportDetailCustomLayout {
  id: string;
  name: string;
  fieldIds: string[];
  fieldStyles?: Record<string, CanvasItemFieldStyle>;
  canvasItems?: ReportDetailCanvasItem[];
}

export interface ReportDetailTabBlock {
  id: string;
  title: string;
  sourceFormId: string;
  fieldIds: string[];
  columns?: string[][];  // when set, overrides fieldIds; up to 2 columns
}

export interface ReportDetailTab {
  id: string;
  title: string;
  blocks: ReportDetailTabBlock[];
}

export interface ReportAllFieldsLayout {
  fieldIds: string[];
}

export interface ReportBlockLayoutItem {
  id: string;
  title: string;
  sourceFormId: string;
  fieldIds: string[];
  columns?: string[][];  // when set, overrides fieldIds; up to 2 columns
}

export interface ReportTabLayoutItem {
  id: string;
  title: string;
  sourceFormId: string;
  fieldIds: string[];
  blocks?: ReportBlockLayoutItem[];
}

export interface PreviewRecord {
  id: number;
  groupLabel: string;
  fields: Record<string, string>;
}

export interface ReportActionItem {
  label: string;
  enabled: boolean;
}

export interface ReportActionGroup {
  title: string;
  description: string;
  items: ReportActionItem[];
}

export type ReportJoinType = 'inner' | 'left' | 'right' | 'lookup';

export interface ReportJoin {
  sourceFormId: string;
  targetFormId: string;
  joinType: ReportJoinType;
  on: {
    sourceField: string;
    targetField: string;
  };
  alias?: string;
}