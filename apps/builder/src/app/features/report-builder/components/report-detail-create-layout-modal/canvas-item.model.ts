import { CanvasItemFieldStyle } from '@builder/features/report-builder/models/report-builder.models';
import { REPORTS_LANG } from '../../lang/reports.lang';

/** Internal (editor) style for a canvas item — narrow union types. */
export interface CanvasItemStyle {
  styleMode: 'theme' | 'styles';
  fontSize: number;
  fontWeight: 'Regular' | 'Semi bold' | 'Bold';
  textColor: string;
  labelAlign: 'Top' | 'Left' | 'Bottom' | 'Right';
  bgColor: string;
  // Text formatting
  textAlign: 'left' | 'center' | 'right';
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'line-through';
  // Border
  borderEnabled: boolean;
  borderWidth: number;
  borderStyle: 'solid' | 'dashed' | 'dotted' | 'double' | 'none';
  borderColor: string;
  borderSameAllSides: boolean;
  // Shadow
  shadowEnabled: boolean;
  shadowX: number;
  shadowY: number;
  shadowBlur: number;
  shadowSpread: number;
  shadowColor: string;
  // Radius
  radiusEnabled: boolean;
  radiusValue: number;
  radiusSameAllSides: boolean;
  // Padding
  paddingEnabled: boolean;
  paddingValue: number;
  paddingSameAllSides: boolean;
  // Margin
  marginEnabled: boolean;
}

export type CanvasItemType = 'field' | 'section' | 'tab' | 'table' | 'text' | 'icon' | 'line';

export interface CanvasItem {
  id: string;
  type: CanvasItemType;
  fieldId: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  style: CanvasItemStyle;
  parentSectionId?: string | null;
  parentTabItemId?: string | null;
  parentTabKey?: string | null;
  // Tab items carry their tab labels
  tabLabels?: string[];
  // Text items carry editable content
  textContent?: string;
}

/** Returns the default editor style for a new canvas item. */
export function defaultStyle(): CanvasItemStyle {
  return {
    styleMode: 'styles',
    fontSize: 14,
    fontWeight: REPORTS_LANG.options.regular,
    textColor: 'var(--qo-color-neutral-900)',
    labelAlign: REPORTS_LANG.options.left,
    bgColor: 'var(--qo-color-neutral-0)',
    textAlign: 'left',
    textTransform: 'none',
    fontStyle: 'normal',
    textDecoration: 'none',
    borderEnabled: false,
    borderWidth: 0,
    borderStyle: 'solid',
    borderColor: 'var(--qo-color-neutral-300)',
    borderSameAllSides: true,
    shadowEnabled: false,
    shadowX: 0,
    shadowY: 0,
    shadowBlur: 10,
    shadowSpread: 0,
    shadowColor: 'var(--qo-color-neutral-200)',
    radiusEnabled: false,
    radiusValue: 0,
    radiusSameAllSides: true,
    paddingEnabled: false,
    paddingValue: 0,
    paddingSameAllSides: true,
    marginEnabled: false,
  };
}

/** Returns `value` if it is one of `allowed`, otherwise `fallback`. */
function pick<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

/** Returns `value` if it is a number, otherwise `fallback`. */
function num(value: unknown, fallback: number): number {
  return typeof value === 'number' ? value : fallback;
}

/**
 * Maps a persisted CanvasItemFieldStyle (broad string types) back to the
 * internal CanvasItemStyle (narrow union types), validating each field.
 */
export function restoreStyle(saved: CanvasItemFieldStyle): CanvasItemStyle {
  const base = defaultStyle();
  return {
    ...base,
    styleMode:          pick(saved.styleMode, ['theme', 'styles'] as const, base.styleMode),
    fontSize:           num(saved.fontSize, base.fontSize),
    fontWeight:         pick(saved.fontWeight, ['Regular', 'Semi bold', 'Bold'] as const, base.fontWeight),
    textColor:          saved.textColor || base.textColor,
    labelAlign:         pick(saved.labelAlign, ['Top', 'Left', 'Bottom', 'Right'] as const, base.labelAlign),
    bgColor:            saved.bgColor || base.bgColor,
    textAlign:          pick(saved.textAlign, ['left', 'center', 'right'] as const, base.textAlign),
    textTransform:      pick(saved.textTransform, ['none', 'uppercase', 'lowercase', 'capitalize'] as const, base.textTransform),
    fontStyle:          pick(saved.fontStyle, ['normal', 'italic'] as const, base.fontStyle),
    textDecoration:     pick(saved.textDecoration, ['none', 'line-through'] as const, base.textDecoration),
    borderEnabled:      saved.borderEnabled,
    borderWidth:        num(saved.borderWidth, base.borderWidth),
    borderStyle:        pick(saved.borderStyle, ['solid', 'dashed', 'dotted', 'double', 'none'] as const, base.borderStyle),
    borderColor:        saved.borderColor || base.borderColor,
    borderSameAllSides: saved.borderSameAllSides,
    shadowEnabled:      saved.shadowEnabled ?? base.shadowEnabled,
    shadowX:            num(saved.shadowX, base.shadowX),
    shadowY:            num(saved.shadowY, base.shadowY),
    shadowBlur:         num(saved.shadowBlur, base.shadowBlur),
    shadowSpread:       num(saved.shadowSpread, base.shadowSpread),
    shadowColor:        saved.shadowColor || base.shadowColor,
    radiusEnabled:      saved.radiusEnabled,
    radiusValue:        num(saved.radiusValue, base.radiusValue),
    radiusSameAllSides: saved.radiusSameAllSides,
    paddingEnabled:     saved.paddingEnabled,
    paddingValue:       num(saved.paddingValue, base.paddingValue),
    paddingSameAllSides: saved.paddingSameAllSides,
    marginEnabled:      saved.marginEnabled,
  };
}

// ── Pure canvas geometry / serialization helpers ─────────────────────────────

/** Default label + dimensions for a newly-dropped element of the given type. */
export function elementDefaults(type: CanvasItemType): { label: string; width: number; height: number } {
  const G = REPORTS_LANG.generated;
  switch (type) {
    case 'section': return { label: G.section, width: 400, height: 120 };
    case 'tab':     return { label: G.tab,     width: 400, height: 200 };
    case 'table':   return { label: G.table,   width: 400, height: 160 };
    case 'text':    return { label: G.text,    width: 200, height:  48 };
    case 'icon':    return { label: G.icon,    width:  56, height:  56 };
    case 'line':    return { label: G.line,    width: 200, height:  16 };
    default:        return { label: type,      width: 260, height:  56 };
  }
}

/** Clamps a tab's stored active index to the valid `[0, maxTabs - 1]` range. */
export function activeTabIndex(
  activeIndexByItemId: Record<string, number>,
  tabItemId: string,
  maxTabs = 1,
): number {
  const idx = activeIndexByItemId[tabItemId] ?? 0;
  return Math.max(0, Math.min(idx, Math.max(0, maxTabs - 1)));
}

/** Finds the smallest section whose box contains the given item's center. */
export function resolveParentSectionId(
  items: CanvasItem[],
  x: number,
  y: number,
  width: number,
  height: number,
  excludeItemId: string | null,
): string | null {
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  const sections = items
    .filter((item) => item.type === 'section' && item.id !== excludeItemId)
    .sort((a, b) => (a.width * a.height) - (b.width * b.height));

  for (const section of sections) {
    const withinX = centerX >= section.x && centerX <= section.x + section.width;
    const withinY = centerY >= section.y && centerY <= section.y + section.height;
    if (withinX && withinY) {
      return section.id;
    }
  }
  return null;
}

/** Resolves the tab (and its active tab key) whose body contains the item's center. */
export function resolveParentTabPlacement(
  items: CanvasItem[],
  x: number,
  y: number,
  width: number,
  height: number,
  excludeItemId: string | null,
  activeIndexByItemId: Record<string, number>,
): { tabItemId: string; tabKey: string } | null {
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  const tabs = items
    .filter((item) => item.type === 'tab' && item.id !== excludeItemId)
    .sort((a, b) => (a.width * a.height) - (b.width * b.height));

  for (const tab of tabs) {
    const headerHeight = 40;
    const bodyTop = tab.y + headerHeight;
    const withinX = centerX >= tab.x && centerX <= tab.x + tab.width;
    const withinY = centerY >= bodyTop && centerY <= tab.y + tab.height;
    if (!withinX || !withinY) continue;
    const labels = tab.tabLabels?.length ? tab.tabLabels : [REPORTS_LANG.detailLayout.unnamedTab];
    const idx = activeTabIndex(activeIndexByItemId, tab.id, labels.length);
    return { tabItemId: tab.id, tabKey: labels[idx] ?? labels[0] };
  }
  return null;
}

/** Builds the persisted payload (ordered field ids, per-item styles, canvas items). */
export function buildOrderedFieldData(items: CanvasItem[]): {
  fieldIds: string[];
  fieldStyles: Record<string, CanvasItemFieldStyle>;
  canvasItems: CanvasItem[];
} {
  const sorted = [...items].sort((a, b) => (a.y !== b.y ? a.y - b.y : a.x - b.x));
  const unique = new Set<string>();
  const fieldStyles: Record<string, CanvasItemFieldStyle> = {};
  const canvasItems = sorted.map((item) => ({
    ...item,
    tabLabels: item.tabLabels ? [...item.tabLabels] : undefined,
    style: { ...item.style },
  }));
  sorted.forEach((item) => {
    if (item.type === 'field' && item.fieldId) {
      unique.add(item.fieldId);
    }
    // CanvasItemStyle (narrow unions) is assignable to the broader CanvasItemFieldStyle.
    fieldStyles[item.id] = { ...item.style };
  });
  return { fieldIds: [...unique], fieldStyles, canvasItems };
}
