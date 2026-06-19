import { Injectable } from '@angular/core';
import { ReportBuilderColumn } from '@builder/features/report-builder/facades/report-builder.facade';
import { CanvasItemFieldStyle, QuickViewCanvasElement, QuickViewCustomSlot, ReportDetailCanvasItem } from '../models/report-builder.models';
import { PreviewRecord } from '../models/report-builder.models';

type Padding = { top?: number; right?: number; bottom?: number; left?: number };

/**
 * Pure style-resolution helpers for the report preview: converts saved
 * style/layout config (slot styles, canvas item styles, column widths/pinning)
 * into concrete inline CSS style objects. Stateless.
 */
@Injectable({ providedIn: 'root' })
export class ReportPreviewStyleService {

  private readonly columnWidthMap: Record<ReportBuilderColumn['width'], number> = {
    Small: 140,
    Medium: 220,
    Large: 320,
  };

  /** Maps a weight label/number ("bold", "semibold", "400") to a numeric weight. */
  resolveFontWeight(weight: string): number {
    const n = (weight || '').trim().toLowerCase();
    if (n === 'bold') return 700;
    if (n === 'semi bold' || n === 'semibold') return 600;
    if (n === 'regular') return 400;
    const asNum = Number(weight);
    return Number.isFinite(asNum) ? asNum : 400;
  }

  /** Coerces a partial padding object to a full, non-negative padding (default 12). */
  normalizePadding(padding?: Padding): { top: number; right: number; bottom: number; left: number } {
    return {
      top:    Math.max(0, Number(padding?.top    ?? 12)),
      right:  Math.max(0, Number(padding?.right  ?? 12)),
      bottom: Math.max(0, Number(padding?.bottom ?? 12)),
      left:   Math.max(0, Number(padding?.left   ?? 12)),
    };
  }

  /** Inline style for a top-level canvas item (field/section/line). */
  resolveCanvasItemStyle(item: ReportDetailCanvasItem): Record<string, string | number> {
    const style = item.style as CanvasItemFieldStyle | undefined;
    if (!style) return {};
    return {
      background:   item.type !== 'line' ? (style.bgColor || 'transparent') : 'transparent',
      color:        style.textColor || 'var(--qo-color-neutral-900)',
      fontSize:     `${Math.max(8, Number(style.fontSize) || 14)}px`,
      fontWeight:   this.resolveFontWeight(style.fontWeight),
      textAlign:      style.textAlign || 'left',
      textTransform:  style.textTransform || 'none',
      fontStyle:      style.fontStyle || 'normal',
      textDecoration: style.textDecoration || 'none',
      borderWidth:  style.borderEnabled ? `${Math.max(0, Number(style.borderWidth) || 0)}px`  : '0',
      borderStyle:  style.borderEnabled ? (style.borderStyle || 'solid')                       : 'none',
      borderColor:  style.borderEnabled ? (style.borderColor || 'transparent')                 : 'transparent',
      borderRadius: style.radiusEnabled ? `${Math.max(0, Number(style.radiusValue) || 0)}px`  : '0',
      padding:      style.paddingEnabled ? `${Math.max(0, Number(style.paddingValue) || 0)}px` : '0',
    };
  }

  /** Inline style for a canvas tab widget container. */
  resolveCanvasTabStyle(item: ReportDetailCanvasItem): Record<string, string | number> {
    const style = item.style as CanvasItemFieldStyle | undefined;
    return {
      background:   style?.bgColor || 'var(--qo-color-neutral-0)',
      borderWidth:  style?.borderEnabled ? `${Math.max(0, Number(style.borderWidth)  || 0)}px` : '0',
      borderStyle:  style?.borderEnabled ? (style.borderStyle || 'solid')                       : 'none',
      borderColor:  style?.borderEnabled ? (style.borderColor || 'transparent')                 : 'transparent',
      borderRadius: style?.radiusEnabled ? `${Math.max(0, Number(style.radiusValue)  || 0)}px` : '0',
    };
  }

  /** Inline style for a field nested inside a canvas tab. */
  resolveCanvasChildFieldStyle(item: ReportDetailCanvasItem): Record<string, string | number> {
    const style = item.style as CanvasItemFieldStyle | undefined;
    if (!style) return {};
    return {
      background:   style.bgColor || 'transparent',
      color:        style.textColor || 'var(--qo-color-neutral-900)',
      fontSize:     `${Math.max(8, Number(style.fontSize) || 14)}px`,
      fontWeight:   this.resolveFontWeight(style.fontWeight),
      textAlign:      style.textAlign || 'left',
      textTransform:  style.textTransform || 'none',
      fontStyle:      style.fontStyle || 'normal',
      textDecoration: style.textDecoration || 'none',
      borderWidth:  style.borderEnabled ? `${Math.max(0, Number(style.borderWidth)  || 0)}px` : '0',
      borderStyle:  style.borderEnabled ? (style.borderStyle || 'solid')                       : 'none',
      borderColor:  style.borderEnabled ? (style.borderColor || 'transparent')                 : 'transparent',
      borderRadius: style.radiusEnabled ? `${Math.max(0, Number(style.radiusValue)  || 0)}px` : '0',
      padding:      style.paddingEnabled ? `${Math.max(0, Number(style.paddingValue) || 0)}px` : '4px 8px',
    };
  }

  /** Finds the saved style for a field in the active custom detail layout. */
  resolveCustomDetailFieldStyle(
    fieldId: string,
    activeLayoutId: string | null,
    layouts: Array<{ id: string; fieldStyles?: Record<string, CanvasItemFieldStyle> }>
  ): CanvasItemFieldStyle | null {
    const layout = layouts.find(l => l.id === activeLayoutId);
    const styles = layout?.fieldStyles ?? {};
    if (!layout || !Object.keys(styles).length) return null;
    if (styles[fieldId]) return styles[fieldId];
    const match = Object.entries(styles).find(([k]) => k.startsWith(`${fieldId}-`));
    return match ? match[1] : null;
  }

  /** Builds a full inline style object from a saved detail field style. */
  buildDetailFieldStyleObject(
    style: CanvasItemFieldStyle
  ): Record<string, string | number> {
    const resolved: Record<string, string | number> = {
      background:  style.bgColor || 'transparent',
      color:       style.textColor || 'inherit',
      fontSize:    `${Math.max(8, Number(style.fontSize) || 14)}px`,
      fontWeight:  this.resolveFontWeight(style.fontWeight),
      textAlign:      style.textAlign || 'left',
      textTransform:  style.textTransform || 'none',
      fontStyle:      style.fontStyle || 'normal',
      textDecoration: style.textDecoration || 'none',
    };
    if (style.borderEnabled) {
      resolved['borderWidth']  = `${Math.max(0, Number(style.borderWidth) || 0)}px`;
      resolved['borderStyle']  = style.borderStyle || 'solid';
      resolved['borderColor']  = style.borderColor || 'transparent';
    }
    if (style.radiusEnabled)  resolved['borderRadius'] = `${Math.max(0, Number(style.radiusValue) || 0)}px`;
    if (style.paddingEnabled) resolved['padding']      = `${Math.max(0, Number(style.paddingValue) || 0)}px`;
    if (style.shadowEnabled) {
      const sx = Number(style.shadowX) || 0, sy = Number(style.shadowY) || 0;
      const blur = Math.max(0, Number(style.shadowBlur) || 0);
      const spread = Number(style.shadowSpread) || 0;
      resolved['boxShadow'] = `${sx}px ${sy}px ${blur}px ${spread}px ${style.shadowColor || 'rgba(0,0,0,0.2)'}`;
    }
    return resolved;
  }

  /** Inline style (background + padding) for a custom card container. */
  resolveCustomCardStyle(styles: Record<string, unknown>): Record<string, string> {
    const p = this.normalizePadding(styles['cardPadding'] as Padding);
    return {
      background: String(styles['cardBackgroundColor'] ?? ''),
      padding: `${p.top}px ${p.right}px ${p.bottom}px ${p.left}px`,
    };
  }

  /** Inline style (align/background/padding/color/font) for a custom card slot. */
  resolveSlotStyle(styles: Record<string, unknown>, slot: QuickViewCustomSlot): Record<string, string> {
    const slotStyles = (styles['slotStyles'] as Record<string, unknown> | undefined)?.[slot] as Record<string, unknown> | undefined;
    const padding = this.normalizePadding(slotStyles?.['padding'] as Padding);
    return {
      textAlign:  String(slotStyles?.['align'] ?? 'left'),
      background: String(slotStyles?.['backgroundColor'] ?? 'var(--qo-color-neutral-0)'),
      padding:    `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`,
      color:      this.resolveSlotTextColor(styles, slot),
      fontSize:   `${this.resolveSlotFontSize(styles, slot)}px`,
      fontWeight: String(slot === 'title' ? (styles['titleFontWeight'] ?? 700) : 500),
    };
  }

  /** Inline sizing style for the custom-layout canvas container. */
  resolveDesignerContainerStyle(layout: { containerWidth?: number; containerHeight?: number } | null | undefined): Record<string, string> {
    const w = Math.max(260, Math.round(layout?.containerWidth  ?? 420));
    const h = Math.max(160, Math.round(layout?.containerHeight ?? 220));
    return { width: '100%', maxWidth: `${w}px`, minHeight: `${h}px`, height: `${h}px` };
  }

  /** Resolves a canvas element's display text from its bound field (or label). */
  resolveDesignerElementText(
    row: PreviewRecord,
    element: QuickViewCanvasElement,
    slots: Record<string, string>
  ): string {
    const columnId = slots[element.slotId];
    if (columnId) return String(row.fields[columnId] ?? element.label ?? '');
    return element.label ?? '';
  }

  /** Inline style for a table column: width, alignment, and sticky offset if pinned. */
  resolveColumnStyle(
    column: ReportBuilderColumn,
    pinnedIds: string[],
    displayColumns: ReportBuilderColumn[]
  ): Record<string, string> {
    const width = this.columnWidthMap[column.width] ?? this.columnWidthMap.Medium;
    const pinIndex = pinnedIds.indexOf(column.id);
    const style: Record<string, string> = {
      'text-align': column.alignment.toLowerCase(),
      width: `${width}px`,
      'min-width': `${width}px`,
      // Cap the cell's max-content contribution to its own width. The header and
      // every row are independent CSS grids using `minmax(_, max-content)`, so
      // without this a long value would grow only its row's track and desync the
      // columns (borders zig-zag, text overflows into the next column). Bounding
      // max-width keeps every grid's track identical and lets the cell's
      // overflow/ellipsis truncate instead of overflowing.
      'max-width': `${width}px`,
    };
    if (pinIndex !== -1) {
      const PREFIX_WIDTH = 76;
      const leftOffset = PREFIX_WIDTH + pinnedIds.slice(0, pinIndex).reduce((acc, id) => {
        const col = displayColumns.find(c => c.id === id);
        return acc + (col ? (this.columnWidthMap[col.width] ?? this.columnWidthMap.Medium) : 220);
      }, 0);
      style['position'] = 'sticky';
      style['left'] = `${leftOffset}px`;
      style['z-index'] = '6';
      style['background'] = 'var(--qo-color-neutral-50)';
    }
    return style;
  }

  /** Text colour for a slot based on its role (title/body/meta). */
  private resolveSlotTextColor(styles: Record<string, unknown>, slot: QuickViewCustomSlot): string {
    if (slot === 'title') return String(styles['titleColor'] ?? '');
    if (slot === 'body')  return String(styles['bodyColor']  ?? '');
    return String(styles['metaColor'] ?? '');
  }

  /** Font size for a slot based on its role (title/body/meta). */
  private resolveSlotFontSize(styles: Record<string, unknown>, slot: QuickViewCustomSlot): number {
    if (slot === 'title') return Number(styles['titleFontSize']) || 14;
    if (slot === 'body')  return Number(styles['bodyFontSize'])  || 13;
    return Number(styles['metaFontSize']) || 12;
  }
}
