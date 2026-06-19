import { QuickViewCanvasElement } from '../../models/report-builder.models';
import { REPORTS_LANG } from '../../lang/reports.lang';

// ─── Types ────────────────────────────────────────────────────────────────────

export type BuilderElementId = 'image' | 'title' | 'body' | 'meta_left' | 'meta_right';
export type BuilderTab = 'display' | 'style';
export type BuilderTool = 'card' | 'text' | 'image' | 'icon' | 'button';

export type TextPresetStyle = 'title' | 'subtitle' | 'normal' | 'italic' | 'secondary' | 'bold' | 'subtext';

export interface ImagePreset {
  shape: 'square' | 'rounded' | 'circle';
  size: 'small' | 'medium' | 'large';
  width: number;
  height: number;
}

export interface IconItem {
  glyph: string;
  label: string;
}

export interface ButtonPreset {
  variant: 'filled' | 'outline';
  shape: 'rectangular' | 'rounded';
  label: string;
}

export interface BuilderElement extends QuickViewCanvasElement {
  instanceId: string;
  slotId: BuilderElementId;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  visualType?: 'text' | 'image' | 'icon' | 'button';
  iconGlyph?: string;
  buttonVariant?: 'filled' | 'outline';
  buttonShape?: 'rectangular' | 'rounded';
  imageShape?: 'square' | 'rounded' | 'circle';
  textStyle?: TextPresetStyle;
  fontSize?: number;
  fontWeight?: number;
  textAlign?: 'left' | 'center' | 'right';
  textColor?: string;
  backgroundColor?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const REPORT_TEXT_COLOR = 'var(--qo-color-neutral-900)';
export const REPORT_SURFACE_COLOR = 'var(--qo-color-neutral-0)';

export const TEXT_STYLE_DEFAULTS: Record<TextPresetStyle, { fontSize: number; fontWeight: number; fontStyle?: string }> = {
  title:     { fontSize: 18, fontWeight: 700 },
  subtitle:  { fontSize: 15, fontWeight: 500 },
  normal:    { fontSize: 14, fontWeight: 400 },
  italic:    { fontSize: 14, fontWeight: 400, fontStyle: 'italic' },
  secondary: { fontSize: 13, fontWeight: 400 },
  bold:      { fontSize: 14, fontWeight: 700 },
  subtext:   { fontSize: 12, fontWeight: 400 },
};

export const IMAGE_SIZES: Record<'small' | 'medium' | 'large', { width: number; height: number }> = {
  small:  { width: 60,  height: 60  },
  medium: { width: 88,  height: 88  },
  large:  { width: 120, height: 120 },
};

const ICON_GLYPHS_OUTLINE = [
  'bookmark', 'copy', 'database', 'download', 'external-link', 'filter', 'settings', 'settings-2',
  'arrow-up', 'arrow-down', 'plus', 'minus', 'check', 'eye', 'eye-off', 'printer', 'rotate-cw',
  'pencil', 'pin', 'pin-off', 'search', 'palette', 'folder', 'layout-list', 'columns', 'monitor',
  'tablet', 'smartphone', 'image',
] as const;

const ICON_GLYPHS_SOLID = [
  'bookmark', 'copy', 'database', 'settings', 'settings-2', 'check', 'eye', 'printer', 'rotate-cw',
  'pencil', 'pin', 'search', 'palette', 'folder', 'layout-list', 'columns', 'monitor', 'image',
] as const;

function buildIconPool(glyphs: readonly string[]): IconItem[] {
  const labels = REPORTS_LANG.layoutBuilder.icons as Record<string, string>;
  return glyphs.map((glyph) => ({ glyph, label: labels[glyph] ?? glyph }));
}

export const ICON_POOL_OUTLINE = buildIconPool(ICON_GLYPHS_OUTLINE);
export const ICON_POOL_SOLID = buildIconPool(ICON_GLYPHS_SOLID);
