import { REPORT_BUILDER_QUICK_ACTION_GROUPS } from '@builder/features/report-builder/config/report-builder.config';
import {
  DetailLayout,
  ReportActionGroup,
} from '@builder/features/report-builder/models/report-builder.models';
import { ReportBuilderFilterRule } from '@builder/features/report-builder/facades/report-builder.facade';

/**
 * Maps legacy/persisted detail-layout-mode aliases (e.g. `all_fields`,
 * `block_layout`, `custom_layout`) to the canonical kebab-case values used
 * throughout the report builder. Unknown values fall back to `all-fields`.
 */
export function normalizeDetailLayoutMode(mode: DetailLayout | undefined): DetailLayout {
  if (mode === 'all_fields') {
    return 'all-fields';
  }
  if (mode === 'block_layout') {
    return 'block-view';
  }
  if (mode === 'custom_layout') {
    return 'tab-view';
  }
  if (mode === 'all-fields' || mode === 'block-view' || mode === 'tab-view') {
    return mode;
  }
  return 'all-fields';
}

/**
 * Deep-clones action groups (and their items) so mutations to a report's copy
 * never leak into the shared defaults. Falls back to `fallback` (default: the
 * quick-action defaults) when `groups` is empty/undefined.
 */
export function cloneActionGroups(
  groups?: ReportActionGroup[],
  fallback: ReportActionGroup[] = REPORT_BUILDER_QUICK_ACTION_GROUPS
): ReportActionGroup[] {
  const source = groups?.length ? groups : fallback;
  return source.map((group) => ({
    ...group,
    items: group.items.map((item) => ({ ...item })),
  }));
}

/**
 * Deep-clones filter rules, normalising range values to string `{ start, end }`
 * so a duplicated/updated rule set shares no references with the original.
 */
export function cloneFilterRules(filterRules: ReportBuilderFilterRule[]): ReportBuilderFilterRule[] {
  return filterRules.map((rule) =>
    typeof rule.value === 'string'
      ? { ...rule, value: rule.value }
      : {
          ...rule,
          value: {
            start: String(rule.value.start ?? ''),
            end: String(rule.value.end ?? ''),
          },
        }
  );
}
