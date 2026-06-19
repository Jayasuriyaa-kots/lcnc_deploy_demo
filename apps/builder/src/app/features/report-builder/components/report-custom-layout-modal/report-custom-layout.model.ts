import {
  QuickViewCustomSlot,
  QuickViewSlotStyles,
} from '@builder/features/report-builder/models/report-builder.models';
import { REPORTS_LANG } from '../../lang/reports.lang';

export const REPORT_COLOR_SURFACE = 'var(--qo-color-neutral-0)';
export const REPORT_COLOR_TEXT_PRIMARY = 'var(--qo-color-neutral-900)';
export const REPORT_COLOR_TEXT_BODY = 'var(--qo-color-neutral-700)';
export const REPORT_COLOR_TEXT_META = 'var(--qo-color-neutral-500)';

/** Returns `value` coerced to a finite number, otherwise `fallback`. */
export function normalizeNumber(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/** Returns a non-empty trimmed color string, otherwise `fallback`. */
export function normalizeColor(value: unknown, fallback: string): string {
  const text = String(value ?? '').trim();
  return text ? text : fallback;
}

/** Default style for a single quick-view slot. */
export function createDefaultSingleSlotStyle(): QuickViewSlotStyles {
  return {
    align: 'left',
    backgroundColor: REPORT_COLOR_SURFACE,
    padding: { top: 12, right: 12, bottom: 12, left: 12 },
  };
}

/** Default styles for every quick-view slot. */
export function createDefaultSlotStyles(): Record<QuickViewCustomSlot, QuickViewSlotStyles> {
  return {
    image: createDefaultSingleSlotStyle(),
    title: createDefaultSingleSlotStyle(),
    body: createDefaultSingleSlotStyle(),
    meta_left: createDefaultSingleSlotStyle(),
    meta_right: createDefaultSingleSlotStyle(),
  };
}

/** Merges a saved slot style over defaults, validating each field. */
export function mergeSlotStyle(
  defaults: QuickViewSlotStyles,
  style: QuickViewSlotStyles | undefined,
): QuickViewSlotStyles {
  return {
    align: style?.align ?? defaults.align,
    backgroundColor: normalizeColor(style?.backgroundColor, defaults.backgroundColor),
    padding: {
      top: normalizeNumber(style?.padding?.top, defaults.padding.top),
      right: normalizeNumber(style?.padding?.right, defaults.padding.right),
      bottom: normalizeNumber(style?.padding?.bottom, defaults.padding.bottom),
      left: normalizeNumber(style?.padding?.left, defaults.padding.left),
    },
  };
}

/** Normalizes a saved slot-styles map against defaults (back-compat safe). */
export function normalizeSlotStyles(
  slotStyles: Record<QuickViewCustomSlot, QuickViewSlotStyles> | undefined,
): Record<QuickViewCustomSlot, QuickViewSlotStyles> {
  const defaults = createDefaultSlotStyles();
  if (!slotStyles) {
    return defaults;
  }
  return {
    image: mergeSlotStyle(defaults.image, slotStyles.image),
    title: mergeSlotStyle(defaults.title, slotStyles.title),
    body: mergeSlotStyle(defaults.body, slotStyles.body),
    meta_left: mergeSlotStyle(defaults.meta_left, slotStyles.meta_left),
    meta_right: mergeSlotStyle(defaults.meta_right, slotStyles.meta_right),
  };
}

/** Human-readable fallback label for a slot when no field is mapped. */
export function getDefaultSlotLabel(slot: QuickViewCustomSlot): string {
  const slots = REPORTS_LANG.layoutBuilder.slots;
  switch (slot) {
    case 'image':      return slots.image;
    case 'title':      return slots.title;
    case 'body':       return slots.body;
    case 'meta_left':  return slots.metaLeft;
    case 'meta_right': return slots.metaRight;
    default:           return slots.field;
  }
}
