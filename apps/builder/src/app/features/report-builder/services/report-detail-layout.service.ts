import { ReportBuilderI18nService } from './report-builder-i18n.service';

import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { ReportBuilderFacade } from '@builder/features/report-builder/facades/report-builder.facade';
import { ReportPreviewService } from '@builder/features/report-builder/services/report-preview.service';
import { REPORTS_LANG } from '@builder/features/report-builder/lang/reports.lang';
import {
  CanvasItemFieldStyle,
  ReportDetailCustomLayout,
} from '@builder/features/report-builder/models/report-builder.models';
import { QoConfirmDialogService, QoToastService } from '@qo/ui-components';

export interface SavedDetailLayoutCard {
  id: string;
  name: string;
  active: boolean;
}

/**
 * Component-scoped service owning the Detail View custom-layout gallery: the
 * saved layouts (kept in sync with the report), the active/editing selection,
 * the create/edit modal flag, and the layout CRUD. Provide it in the host
 * component's `providers` array.
 */
@Injectable()
export class ReportDetailLayoutService {
  private readonly i18n = inject(ReportBuilderI18nService);

  private readonly facade = inject(ReportBuilderFacade);
  private readonly preview = inject(ReportPreviewService);
  private readonly toast = inject(QoToastService);
  private readonly confirmDialog = inject(QoConfirmDialogService);

  readonly savedLayouts = signal<ReportDetailCustomLayout[]>([]);
  readonly activeLayoutId = signal<string | null>(null);
  readonly editingLayoutId = signal<string | null>(null);
  readonly createNewLayoutOpen = signal<boolean>(false);

  /**
   * Computes saved layout cards from the current report state.
   */
  readonly savedLayoutCards = computed<SavedDetailLayoutCard[]>(() =>
    this.savedLayouts().map((item) => ({
      id: item.id,
      name: item.name,
      active: this.activeLayoutId() === item.id,
    }))
  );

  /**
   * Computes editing layout name from the current report state.
   */
  readonly editingLayoutName = computed<string>(() => {
    const editingId = this.editingLayoutId();
    if (!editingId) {
      return REPORTS_LANG.layoutBuilder.defaultLayoutName;
    }
    return this.savedLayouts().find((item) => item.id === editingId)?.name ?? REPORTS_LANG.layoutBuilder.defaultLayoutName;
  });

  /**
   * Computes editing layout field ids from the current report state.
   */
  readonly editingLayoutFieldIds = computed<string[]>(() => {
    const editingId = this.editingLayoutId();
    if (!editingId) {
      return [];
    }
    return this.savedLayouts().find((item) => item.id === editingId)?.fieldIds ?? [];
  });

  /**
   * Computes editing layout field styles from the current report state.
   */
  readonly editingLayoutFieldStyles = computed<Record<string, CanvasItemFieldStyle>>(() => {
    const editingId = this.editingLayoutId();
    if (!editingId) {
      return {};
    }
    return this.savedLayouts().find((item) => item.id === editingId)?.fieldStyles ?? {};
  });

  /**
   * Computes editing layout canvas items from the current report state.
   */
  readonly editingLayoutCanvasItems = computed<NonNullable<ReportDetailCustomLayout['canvasItems']>>(() => {
    const editingId = this.editingLayoutId();
    if (!editingId) {
      return [];
    }
    return this.savedLayouts().find((item) => item.id === editingId)?.canvasItems ?? [];
  });

  /**
   * Computes visible columns from the current report state.
   */
  private readonly visibleColumns = computed(() =>
    (this.facade.selectedReport()?.columns ?? []).filter((column) => column.visible)
  );

  /**
   * Initializes report detail layout service and wires its reactive state.
   */
  constructor() {
    // Mirror the saved detail layouts from the selected report.
    effect(
      () => {
        const report = this.facade.selectedReport();
        if (!report) {
          return;
        }
        this.savedLayouts.set(
          (report.settings.detailCustomLayouts ?? []).map((layout) => this.cloneLayout(layout))
        );
        this.activeLayoutId.set(report.settings.activeDetailCustomLayoutId ?? null);
      },
      { allowSignalWrites: true }
    );
  }

  /**
   * Opens create new modal for the report configuration workflow.
   */
  openCreateNewModal(): void {
    this.facade.setDetailLayout('custom_layout');
    this.editingLayoutId.set(null);
    this.createNewLayoutOpen.set(true);
  }

  /**
   * Closes create new modal for the report configuration workflow.
   */
  closeCreateNewModal(): void {
    this.createNewLayoutOpen.set(false);
    this.editingLayoutId.set(null);
  }

  /**
   * Saves create new for the report configuration workflow.
   */
  saveCreateNew(event: {
    name: string;
    fieldIds: string[];
    fieldStyles: Record<string, CanvasItemFieldStyle>;
    canvasItems: NonNullable<ReportDetailCustomLayout['canvasItems']>;
  }): void {
    const layoutName = event.name.trim() || 'Custom Layout';
    const fieldIds = event.fieldIds.length
      ? [...event.fieldIds]
      : this.visibleColumns().map((column) => column.id);
    const fieldStyles: Record<string, CanvasItemFieldStyle> = event.fieldStyles ?? {};
    const canvasItems = (event.canvasItems ?? []).map((item) => this.cloneCanvasItem(item));
    const editingId = this.editingLayoutId();
    let activeLayoutId: string;
    if (editingId) {
      this.savedLayouts.update((layouts) =>
        layouts.map((item) =>
          item.id === editingId ? { ...item, name: layoutName, fieldIds, fieldStyles, canvasItems } : item
        )
      );
      activeLayoutId = editingId;
    } else {
      const id = `detail-layout-${Date.now()}`;
      this.savedLayouts.update((layouts) => [
        ...layouts,
        { id, name: layoutName, fieldIds, fieldStyles, canvasItems },
      ]);
      activeLayoutId = id;
    }
    this.activeLayoutId.set(activeLayoutId);
    this.facade.updateSelectedReport((report) => ({
      ...report,
      settings: {
        ...report.settings,
        detailLayoutMode: 'custom_layout',
        detailCustomLayouts: this.savedLayouts().map((layout) => this.cloneLayout(layout)),
        activeDetailCustomLayoutId: activeLayoutId,
      },
    }));
    this.facade.setDetailLayout('custom_layout');
    this.createNewLayoutOpen.set(false);
    this.editingLayoutId.set(null);
    this.notifySuccess(this.i18n.t('toast.detailLayoutSaved'));
  }

  /**
   * Coordinates activate saved for the report configuration workflow.
   */
  activateSaved(layoutId: string): void {
    this.activeLayoutId.set(layoutId);
    this.facade.updateSelectedReport((report) => ({
      ...report,
      settings: {
        ...report.settings,
        detailLayoutMode: 'custom_layout',
        activeDetailCustomLayoutId: layoutId,
      },
    }));
    this.facade.setDetailLayout('custom_layout');
  }

  /**
   * Coordinates deactivate saved for the report configuration workflow.
   */
  deactivateSaved(layoutId: string): void {
    if (this.activeLayoutId() !== layoutId) {
      return;
    }
    this.activeLayoutId.set(null);
    this.facade.updateSelectedReport((report) => ({
      ...report,
      settings: {
        ...report.settings,
        activeDetailCustomLayoutId: null,
      },
    }));
    this.facade.setDetailLayout('all_fields');
    this.preview.clearSelection();
  }

  /**
   * Coordinates edit saved for the report configuration workflow.
   */
  editSaved(layoutId: string): void {
    const layout = this.savedLayouts().find((item) => item.id === layoutId);
    if (!layout) {
      return;
    }
    this.activeLayoutId.set(layoutId);
    this.editingLayoutId.set(layoutId);
    this.facade.setDetailLayout('custom_layout');
    this.createNewLayoutOpen.set(true);
  }

  /**
   * Duplicates saved for the report configuration workflow.
   */
  duplicateSaved(layoutId: string): void {
    const layout = this.savedLayouts().find((item) => item.id === layoutId);
    if (!layout) {
      return;
    }
    const id = `detail-layout-${Date.now()}`;
    const copy: ReportDetailCustomLayout = {
      id,
      name: `${layout.name} Copy`,
      fieldIds: [...layout.fieldIds],
      fieldStyles: layout.fieldStyles ? { ...layout.fieldStyles } : {},
      canvasItems: (layout.canvasItems ?? []).map((item) => this.cloneCanvasItem(item)),
    };
    this.savedLayouts.update((layouts) => [...layouts, copy]);
    this.activeLayoutId.set(id);
    this.facade.updateSelectedReport((report) => ({
      ...report,
      settings: {
        ...report.settings,
        detailCustomLayouts: [
          ...(report.settings.detailCustomLayouts ?? []),
          this.cloneLayout(copy),
        ],
        activeDetailCustomLayoutId: id,
      },
    }));
    this.notifySuccess(this.i18n.t('toast.detailLayoutDuplicated'));
  }

  /**
   * Deletes saved for the report configuration workflow.
   */
  async deleteSaved(layoutId: string): Promise<void> {
    const confirmed = await this.confirmDialog.confirm(
      this.i18n.t('confirmations.deleteDetailLayoutTitle'),
      this.i18n.t('confirmations.deleteDetailLayoutMessage')
    );
    if (!confirmed) {
      return;
    }
    this.savedLayouts.update((layouts) => layouts.filter((item) => item.id !== layoutId));
    if (this.activeLayoutId() === layoutId) {
      this.activeLayoutId.set(null);
    }
    if (this.editingLayoutId() === layoutId) {
      this.editingLayoutId.set(null);
    }
    const nextActive = this.activeLayoutId();
    this.facade.updateSelectedReport((report) => ({
      ...report,
      settings: {
        ...report.settings,
        detailCustomLayouts: (report.settings.detailCustomLayouts ?? []).filter(
          (layout) => layout.id !== layoutId
        ),
        activeDetailCustomLayoutId: nextActive,
      },
    }));
    this.notifySuccess(this.i18n.t('toast.detailLayoutDeleted'));
  }

  /**
   * Coordinates clone layout for the report configuration workflow.
   */
  private cloneLayout(layout: ReportDetailCustomLayout): ReportDetailCustomLayout {
    return {
      id: layout.id,
      name: layout.name,
      fieldIds: [...layout.fieldIds],
      fieldStyles: layout.fieldStyles ?? {},
      canvasItems: (layout.canvasItems ?? []).map((item) => this.cloneCanvasItem(item)),
    };
  }

  /**
   * Coordinates clone canvas item for the report configuration workflow.
   */
  private cloneCanvasItem(
    item: NonNullable<ReportDetailCustomLayout['canvasItems']>[number]
  ): NonNullable<ReportDetailCustomLayout['canvasItems']>[number] {
    return {
      ...item,
      style: { ...item.style },
      tabLabels: item.tabLabels ? [...item.tabLabels] : undefined,
    };
  }

  /** Surfaces a success toast (keeps toast usage centralized + swappable). */
  private notifySuccess(message: string): void {
    this.toast.success(message);
  }
}
