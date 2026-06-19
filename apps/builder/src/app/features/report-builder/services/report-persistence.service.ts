import { ReportBuilderI18nService } from './report-builder-i18n.service';

import { Injectable, inject } from '@angular/core';
import { LocalStorageService } from '@builder/core/persistence/local-storage.service';
import { REPORT_BUILDER_DETAIL_ACTION_GROUPS } from '@builder/features/report-builder/config/report-builder.config';
import { ReportTabLayoutItem } from '@builder/features/report-builder/models/report-builder.models';
import { ReportBuilderAsset } from '@builder/features/report-builder/facades/report-builder.facade';
import {
  cloneActionGroups,
  normalizeDetailLayoutMode,
} from '@builder/features/report-builder/utils/report-builder-normalize.util';

/** Versioned shape persisted to local storage. */
export interface PersistedReportBuilderStateV1 {
  version: 1;
  reports: ReportBuilderAsset[];
  selectedReportId?: string;
}

/**
 * Reads, validates/normalises, and writes the report builder's persisted state.
 * Owns the local-storage key and the migration/normalisation of older payloads.
 */
@Injectable({ providedIn: 'root' })
export class ReportPersistenceService {
  private readonly i18n = inject(ReportBuilderI18nService);

  private readonly storage = inject(LocalStorageService);
  private readonly STORAGE_KEY = 'qo.report-builder.v1';

  /** Loads and normalises persisted state, or null if absent/invalid. */
  load(): PersistedReportBuilderStateV1 | null {
    const loaded = this.storage.load<unknown>(this.STORAGE_KEY);
    if (!loaded || typeof loaded !== 'object') {
      return null;
    }
    const candidate = loaded as Partial<PersistedReportBuilderStateV1>;
    if (candidate.version !== 1 || !Array.isArray(candidate.reports)) {
      return null;
    }
    const reports = this.normalizePersistedReports(candidate.reports as ReportBuilderAsset[]);
    return {
      version: 1,
      reports,
      selectedReportId: typeof candidate.selectedReportId === 'string' ? candidate.selectedReportId : undefined,
    };
  }

  /** Persists a state snapshot. */
  save(snapshot: PersistedReportBuilderStateV1): void {
    this.storage.save(this.STORAGE_KEY, snapshot);
  }

  /** De-duplicates report ids and normalises each report's detail settings. */
  private normalizePersistedReports(reports: ReportBuilderAsset[]): ReportBuilderAsset[] {
    const seen = new Set<string>();
    return reports.map((report, index) => {
      let nextId = report.id || `r${index + 1}`;
      if (seen.has(nextId)) {
        let counter = 1;
        while (seen.has(`${nextId}-${counter}`)) {
          counter += 1;
        }
        nextId = `${nextId}-${counter}`;
      }
      seen.add(nextId);
      return { ...report, id: nextId, settings: this.normalizeDetailSettings(report) };
    });
  }

  /** Repairs/back-fills a report's detail-layout settings to the current schema. */
  private normalizeDetailSettings(report: ReportBuilderAsset): ReportBuilderAsset['settings'] {
    const settings = report.settings;
    const visibleFieldIds = report.columns.filter((column) => column.visible).map((column) => column.id);
    const normalizedSortCriteria = (settings.sortCriteria ?? [])
      .filter((criterion) => !!criterion?.columnId)
      .map((criterion) => ({
        columnId: criterion.columnId,
        direction: (criterion.direction === 'desc' ? 'desc' : 'asc') as 'asc' | 'desc',
      }));
    const firstVisibleColumnId = visibleFieldIds[0] ?? '';
    const isLegacyAutoSort =
      normalizedSortCriteria.length === 1 && normalizedSortCriteria[0].columnId === firstVisibleColumnId;
    const effectiveSortCriteria = isLegacyAutoSort ? [] : normalizedSortCriteria;

    const fallbackBlocks =
      (settings.detailBlocks ?? []).length > 0
        ? settings.detailBlocks.map((block) => ({
            id: block.id || `detail-block-${Math.random().toString(36).slice(2, 8)}`,
            title: block.title || this.i18n.t('detailLayout.details'),
            sourceFormId: block.sourceFormId || report.sourceFormId,
            fieldIds: [...block.fieldIds],
            columns: block.columns?.map((column) => [...column]),
          }))
        : [
            {
              id: `detail-${report.sourceFormId}-main`,
              title: report.tableLabel || report.sourceFormLabel || this.i18n.t('detailLayout.details'),
              sourceFormId: report.sourceFormId,
              fieldIds: report.columns.filter((column) => column.visible).map((column) => column.id),
            },
          ];

    const fallbackTabs: ReportTabLayoutItem[] =
      (settings.tabLayout ?? []).length > 0
        ? settings.tabLayout.map((tab) => ({
            ...tab,
            fieldIds: [...tab.fieldIds],
            blocks: tab.blocks?.map((block) => ({
              ...block,
              fieldIds: [...block.fieldIds],
              columns: block.columns?.map((column) => [...column]),
            })),
          }))
        : [
            {
              id: 'overview',
              title: this.i18n.t('detailLayout.overview'),
              sourceFormId: report.sourceFormId,
              fieldIds: visibleFieldIds,
            },
          ];

    return {
      ...settings,
      recordClickAction: settings.recordClickAction === 'Do Nothing' ? 'Do Nothing' : 'View Record',
      detailLayoutMode: normalizeDetailLayoutMode(settings.detailLayoutMode),
      sortBy: effectiveSortCriteria[0]?.columnId ?? '',
      sortOrder: effectiveSortCriteria[0]?.direction ?? 'asc',
      sortCriteria: effectiveSortCriteria,
      allFieldsLayout: settings.allFieldsLayout ?? { fieldIds: visibleFieldIds },
      blockLayout:
        (settings.blockLayout ?? []).length > 0
          ? settings.blockLayout.map((block) => ({
              ...block,
              fieldIds: [...block.fieldIds],
              columns: block.columns?.map((column) => [...column]),
            }))
          : fallbackBlocks.map((block) => ({
              ...block,
              fieldIds: [...block.fieldIds],
              columns: block.columns?.map((column) => [...column]),
            })),
      tabLayout: fallbackTabs,
      detailActionGroups: cloneActionGroups(settings.detailActionGroups, REPORT_BUILDER_DETAIL_ACTION_GROUPS),
      detailTabs: [
        {
          id: 'overview',
          title: this.i18n.t('detailLayout.overview'),
          blocks: fallbackBlocks,
        },
      ],
    };
  }
}
