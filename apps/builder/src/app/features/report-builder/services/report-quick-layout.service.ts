import { ReportBuilderI18nService } from './report-builder-i18n.service';
import { computed, inject, Injectable, signal } from '@angular/core';
import { ReportBuilderFacade } from '@builder/features/report-builder/facades/report-builder.facade';
import { ReportQuickViewCustomLayout } from '@builder/features/report-builder/models/report-builder.models';
import { QoConfirmDialogService, QoToastService } from '@qo/ui-components';


interface SavedQuickLayout {
  id: string;
  name: string;
  config: ReportQuickViewCustomLayout;
}

export interface SavedQuickLayoutCard extends SavedQuickLayout {
  elementsCount: number;
  active: boolean;
}

/**
 * Component-scoped service owning the Quick View custom-layout gallery: saved
 * layouts, the create/edit modal flags, and the layout CRUD. Provide it in the
 * host component's `providers` array. Persists the active layout through the
 * root facade; surfaces user feedback via the shared toast service.
 */
@Injectable()
export class ReportQuickLayoutService {
  private readonly i18n = inject(ReportBuilderI18nService);

  private readonly facade = inject(ReportBuilderFacade);
  private readonly toast = inject(QoToastService);
  private readonly confirmDialog = inject(QoConfirmDialogService);

  readonly templateMode = signal<boolean>(false);
  readonly templateVariant = signal<'block' | 'list'>('block');
  readonly createNewLayoutOpen = signal<boolean>(false);
  readonly editingLayoutId = signal<string | null>(null);
  readonly savedLayouts = signal<SavedQuickLayout[]>([]);

  /**
   * Computes saved layout cards from the current report state.
   */
  readonly savedLayoutCards = computed<SavedQuickLayoutCard[]>(() => {
    const active = this.facade.selectedReport()?.settings.quickViewCustomLayout;
    const activeKey = active ? JSON.stringify(active.canvasLayout ?? active.slots) : '';
    return this.savedLayouts().map((item) => ({
      id: item.id,
      name: item.name,
      config: item.config,
      elementsCount: item.config.canvasLayout?.elements?.length ?? 0,
      active:
        activeKey.length > 0 &&
        JSON.stringify(item.config.canvasLayout ?? item.config.slots) === activeKey,
    }));
  });

  /**
   * Opens modal for the report configuration workflow.
   */
  openModal(): void {
    this.applyTemplate(false, 'block');
    this.facade.openCustomLayoutModal();
  }

  /**
   * Opens template modal for the report configuration workflow.
   */
  openTemplateModal(): void {
    this.applyTemplate(true, 'block');
    this.facade.openCustomLayoutModal();
  }

  /**
   * Opens list template modal for the report configuration workflow.
   */
  openListTemplateModal(): void {
    this.applyTemplate(true, 'list');
    this.facade.openCustomLayoutModal();
  }

  /**
   * Opens create new modal for the report configuration workflow.
   */
  openCreateNewModal(): void {
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
  saveCreateNew(config: ReportQuickViewCustomLayout): void {
    this.facade.setQuickLayout('custom');
    const editingId = this.editingLayoutId();
    if (editingId) {
      this.savedLayouts.update((layouts) =>
        layouts.map((item) =>
          item.id === editingId ? { ...item, config: this.cloneConfig(config) } : item
        )
      );
    } else {
      this.savedLayouts.update((layouts) => [
        ...layouts,
        {
          id: `layout-${Date.now()}`,
          name: `Custom Layout ${layouts.length + 1}`,
          config: this.cloneConfig(config),
        },
      ]);
    }
    this.persistActiveLayout(config);
    this.createNewLayoutOpen.set(false);
    this.editingLayoutId.set(null);
    this.notifySuccess(this.i18n.t('toast.layoutSaved'));
  }

  /**
   * Coordinates activate saved for the report configuration workflow.
   */
  activateSaved(layoutId: string): void {
    const layout = this.savedLayouts().find((item) => item.id === layoutId);
    if (!layout) {
      return;
    }
    this.facade.setQuickLayout('custom');
    this.persistActiveLayout(layout.config);
  }

  /**
   * Coordinates edit saved for the report configuration workflow.
   */
  editSaved(layoutId: string): void {
    const layout = this.savedLayouts().find((item) => item.id === layoutId);
    if (!layout) {
      return;
    }
    this.editingLayoutId.set(layoutId);
    this.facade.setQuickLayout('custom');
    this.persistActiveLayout(layout.config);
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
    this.savedLayouts.update((layouts) => [
      ...layouts,
      {
        id: `layout-${Date.now()}`,
        name: `${layout.name} Copy`,
        config: this.cloneConfig(layout.config),
      },
    ]);
    this.notifySuccess(this.i18n.t('toast.layoutDuplicated'));
  }

  /**
   * Deletes saved for the report configuration workflow.
   */
  async deleteSaved(layoutId: string): Promise<void> {
    const confirmed = await this.confirmDialog.confirm(
      this.i18n.t('confirmations.deleteLayoutTitle'),
      this.i18n.t('confirmations.deleteLayoutMessage')
    );
    if (!confirmed) {
      return;
    }
    this.savedLayouts.update((layouts) => layouts.filter((item) => item.id !== layoutId));
    if (this.editingLayoutId() === layoutId) {
      this.editingLayoutId.set(null);
    }
    this.notifySuccess(this.i18n.t('toast.layoutDeleted'));
  }

  /**
   * Closes modal for the report configuration workflow.
   */
  closeModal(): void {
    this.templateMode.set(false);
    this.templateVariant.set('block');
    this.facade.closeCustomLayoutModal();
  }

  /**
   * Saves save back into the report configuration.
   */
  save(config: ReportQuickViewCustomLayout): void {
    this.facade.updateSelectedReport((report) => ({
      ...report,
      settings: {
        ...report.settings,
        quickViewCustomLayout: config,
      },
    }));
    this.facade.closeCustomLayoutModal();
    this.notifySuccess(this.i18n.t('toast.customLayoutSaved'));
  }

  /**
   * Applies template for the report configuration workflow.
   */
  private applyTemplate(templateMode: boolean, templateVariant: 'block' | 'list'): void {
    this.templateMode.set(templateMode);
    this.templateVariant.set(templateVariant);
    this.facade.updateSelectedReport((report) => ({
      ...report,
      settings: {
        ...report.settings,
        quickViewCustomLayout: {
          ...report.settings.quickViewCustomLayout,
          templateMode,
          templateVariant,
        },
      },
    }));
  }

  /**
   * Coordinates persist active layout for the report configuration workflow.
   */
  private persistActiveLayout(config: ReportQuickViewCustomLayout): void {
    this.facade.updateSelectedReport((report) => ({
      ...report,
      settings: {
        ...report.settings,
        quickViewCustomLayout: this.cloneConfig(config),
      },
    }));
  }

  /**
   * Coordinates clone config for the report configuration workflow.
   */
  private cloneConfig(config: ReportQuickViewCustomLayout): ReportQuickViewCustomLayout {
    return {
      ...config,
      slots: { ...config.slots },
      styles: {
        ...config.styles,
        cardPadding: { ...config.styles.cardPadding },
        slotStyles: {
          image: { ...config.styles.slotStyles.image, padding: { ...config.styles.slotStyles.image.padding } },
          title: { ...config.styles.slotStyles.title, padding: { ...config.styles.slotStyles.title.padding } },
          body: { ...config.styles.slotStyles.body, padding: { ...config.styles.slotStyles.body.padding } },
          meta_left: { ...config.styles.slotStyles.meta_left, padding: { ...config.styles.slotStyles.meta_left.padding } },
          meta_right: { ...config.styles.slotStyles.meta_right, padding: { ...config.styles.slotStyles.meta_right.padding } },
        },
      },
      canvasLayout: config.canvasLayout
        ? {
            containerWidth: config.canvasLayout.containerWidth,
            containerHeight: config.canvasLayout.containerHeight,
            elements: config.canvasLayout.elements.map((item) => ({ ...item })),
          }
        : undefined,
    };
  }

  /** Surfaces a success toast (keeps toast usage centralized + swappable). */
  private notifySuccess(message: string): void {
    this.toast.success(message);
  }
}
