import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';
import {
  QoButtonComponent,
  QoConfirmDialogComponent,
  QoIconComponent,
  QoConfirmDialogConfig,
  QoSearchBarComponent,
  QoSidebarItemComponent,
  QoToastService
} from '@qo/ui-components';
import { BuilderAssetItem, BuilderModuleConfig } from '@builder/core/models/builder-shell.model';
import { getBuilderStatusPresentation } from '@builder/shared/utils/builder-status.util';
import { FormBuilderFacadeService } from '@builder/features/form-builder/services/form-builder-facade.service';
import { PageBuilderFacade } from '@builder/features/page-builder/facades/page-builder.facade';
import { ReportBuilderFacade } from '@builder/features/report-builder/facades/report-builder.facade';
import { RuntimeEngineService } from '@builder/runtime/services/runtime-engine.service';
import {
  CreatePagePayload,
  PageCreateModalComponent,
} from '@builder/layout/sidebar/page-create-modal.component';

const DEFAULT_MODULE_CONFIG: BuilderModuleConfig = {
  id: 'datasources',
  label: '',
  route: '',
  sidebarTitle: '',
  actionLabel: '',
  searchPlaceholder: '',
  items: [],
  sidebarMode: 'list',
};

@Component({
  selector: 'app-builder-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    QoSidebarItemComponent,
    QoButtonComponent,
    QoConfirmDialogComponent,
    QoIconComponent,
    QoSearchBarComponent,
    PageCreateModalComponent
  ],
  templateUrl: './builder-sidebar.component.html',
  styleUrl: './builder-sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BuilderSidebarComponent {
  private readonly formBuilderState = inject(FormBuilderFacadeService);
  private readonly pageBuilderState = inject(PageBuilderFacade);
  private readonly reportBuilderState = inject(ReportBuilderFacade);
  private readonly runtimeEngine = inject(RuntimeEngineService);
  private readonly router = inject(Router);
  private readonly toast = inject(QoToastService);

  readonly moduleConfig = input<BuilderModuleConfig>(DEFAULT_MODULE_CONFIG);
  readonly activeRoute = input('');
  readonly showPageCreateModal = signal(false);
  readonly editingPageId = signal<string | null>(null);

  selectedIndex = signal(0);
  selectedTabIndex = signal(0);
  searchQuery = signal('');

  confirmConfig = signal<QoConfirmDialogConfig | null>(null);
  private pendingConfirmAction: (() => void) | null = null;

  // Items derived directly from the JSON config — always in sync with hexaware.config.json.
  private readonly runtimeFormItems = computed<BuilderAssetItem[]>(() =>
    this.runtimeEngine.forms().map((f) => ({
      id: f.id,
      shortCode: f.name.replace(/[^A-Z]/g, '').substring(0, 2) || f.name.substring(0, 2).toUpperCase(),
      name: f.name,
      typeLabel: 'Form',
      status: 'live' as const,
    }))
  );

  private readonly runtimeDataframeItems = computed<BuilderAssetItem[]>(() =>
    this.runtimeEngine.dataframes().map((d) => ({
      id: d.id,
      shortCode: d.name.replace(/[^A-Z]/g, '').substring(0, 2) || d.name.substring(0, 2).toUpperCase(),
      name: d.name,
      typeLabel: 'Dataframe',
      status: 'live' as const,
    }))
  );

  private readonly runtimePageItems = computed<BuilderAssetItem[]>(() =>
    this.runtimeEngine.pages().map((p) => ({
      id: p.id,
      shortCode: p.name.replace(/[^A-Z]/g, '').substring(0, 2) || p.name.substring(0, 2).toUpperCase(),
      name: p.name,
      typeLabel: 'Page',
      status: 'live' as const,
    }))
  );

  readonly visibleItems = computed<BuilderAssetItem[]>(() => {
    const config = this.moduleConfig();
    const query = this.searchQuery().toLowerCase().trim();
    let items: BuilderAssetItem[] = [];

    if (config.id === 'form-builder') {
      // Prefer runtime items from JSON; fall back to builder state if JSON has none.
      const runtime = this.runtimeFormItems();
      items = runtime.length ? runtime : this.formBuilderState.formItems();
    } else if (config.id === 'report-builder') {
      const runtime = this.runtimeDataframeItems();
      items = runtime.length ? runtime : this.reportBuilderState.reportItems();
    } else if (config.id === 'page-builder') {
      const runtime = this.runtimePageItems();
      items = runtime.length ? runtime : this.pageBuilderState.pages();
    } else {
      items = config.items;
    }

    if (!query) {
      return items;
    }

    return items.filter((item) => item.name.toLowerCase().includes(query));
  });

  readonly selectedFormId = computed(() => this.formBuilderState.selectedForm()?.id ?? '');
  readonly selectedReportId = computed(() => this.reportBuilderState.selectedReport()?.id ?? '');
  readonly selectedPageId = computed(() => this.pageBuilderState.selectedPageId() ?? '');

  constructor() {
    effect(() => {
      this.moduleConfig();
      this.syncSelectedTabFromRoute();
    });

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed()
      )
      .subscribe(() => this.syncSelectedTabFromRoute());
  }

  selectItem(index: number): void {
    const config = this.moduleConfig();
    const item = this.visibleItems()[index];

    if (!item) {
      return;
    }

    if (config.id === 'form-builder') {
      this.formBuilderState.selectForm(item.id);
      return;
    }

    if (config.id === 'report-builder') {
      this.reportBuilderState.selectReport(item.id);
      return;
    }

    if (config.id === 'page-builder') {
      this.pageBuilderState.selectPage(item.id);
      return;
    }

    this.selectedIndex.set(index);
  }

  selectTab(index: number): void {
    const config = this.moduleConfig();
    this.selectedTabIndex.set(index);


    const tab = config.tabs?.[index];
    if (tab?.route) {
      void this.router.navigateByUrl(tab.route);
      return;
    }

    if (config.sidebarMode === 'palette') {
      const item = config.paletteItems?.[index];
      if (item) {
        this.pageBuilderState.selectPaletteItem(item.id);
      }
    }
  }

  isTabActive(tabId: string, tabRoute?: string, index?: number): boolean {
    if (tabRoute) {
      return this.activeRoute().startsWith(tabRoute);
    }

    return this.selectedTabIndex() === (index ?? 0);
  }

  triggerPrimaryAction(): void {
    const config = this.moduleConfig();

    if (config.id === 'form-builder') {
      this.formBuilderState.openCreateWizard();
      return;
    }

    if (config.id === 'report-builder') {
      this.reportBuilderState.openCreateWizard();
      return;
    }

    if (config.id === 'page-builder') {
      this.showPageCreateModal.set(true);
    }
  }

  closePageCreateModal(): void {
    this.showPageCreateModal.set(false);
    this.editingPageId.set(null);
  }

  createPage(payload: CreatePagePayload): void {
    const editingPageId = this.editingPageId();

    if (editingPageId) {
      this.pageBuilderState.updatePageDetails(editingPageId, {
        name: payload.name,
        description: payload.description,
      });
      this.toast.success('Page updated');
    } else {
      this.pageBuilderState.createPage({
        name: payload.name,
        description: payload.description,
      });
      this.selectedIndex.set(0);
      this.toast.success('Page created');
    }

    this.showPageCreateModal.set(false);
    this.editingPageId.set(null);
  }

  openFormSettings(itemId: string, event: Event): void {
    event.stopPropagation();
    if (this.moduleConfig().id === 'form-builder') {
      this.formBuilderState.openFormSettings(itemId);
    }
  }

  openReportSettings(itemId: string, event: Event): void {
    event.stopPropagation();
    if (this.moduleConfig().id === 'report-builder') {
      this.reportBuilderState.openReportSettings(itemId);
    }
  }

  openPageSettings(itemId: string, event: Event): void {
    event.stopPropagation();
    if (this.moduleConfig().id !== 'page-builder') {
      return;
    }

    this.editingPageId.set(itemId);
    this.showPageCreateModal.set(true);
  }

  duplicateItem(itemId: string, event: Event): void {
    event.stopPropagation();
    const config = this.moduleConfig();
    const name = this.visibleItems().find((item) => item.id === itemId)?.name ?? 'this item';

    this.pendingConfirmAction = () => {
      if (config.id === 'form-builder') {
        this.formBuilderState.duplicateForm(itemId);
        this.toast.success('Form duplicated');
      } else if (config.id === 'report-builder') {
        this.reportBuilderState.duplicateReport(itemId);
        this.toast.success('Dataframe duplicated');
      } else if (config.id === 'page-builder') {
        this.pageBuilderState.duplicatePage(itemId);
        this.toast.success('Page duplicated');
      }
    };

    this.confirmConfig.set({
      title:
        config.id === 'form-builder'
          ? 'Duplicate Form'
          : config.id === 'report-builder'
            ? 'Duplicate Dataframe'
            : 'Duplicate Page',
      message: `Create a copy of "${name}"? The duplicate will be saved as a Draft.`,
      confirmLabel: 'Duplicate',
      cancelLabel: 'Cancel',
      danger: false,
    });
  }

  deleteItem(itemId: string, event: Event): void {
    event.stopPropagation();
    const config = this.moduleConfig();
    const name = this.visibleItems().find((item) => item.id === itemId)?.name ?? 'this item';

    this.pendingConfirmAction = () => {
      if (config.id === 'form-builder') {
        this.formBuilderState.deleteForm(itemId);
        this.toast.success('Form deleted');
      } else if (config.id === 'report-builder') {
        this.reportBuilderState.deleteReport(itemId);
        this.toast.success('Dataframe deleted');
      } else if (config.id === 'page-builder') {
        this.pageBuilderState.deletePage(itemId);
        this.toast.success('Page deleted');
      }
    };

    this.confirmConfig.set({
      title:
        config.id === 'form-builder' ? 'Delete Form' : config.id === 'report-builder' ? 'Delete Dataframe' : 'Delete Page',
      message: `Are you sure you want to permanently delete "${name}"? This action cannot be undone.`,
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      danger: true,
    });
  }

  onDialogConfirmed(): void {
    this.pendingConfirmAction?.();
    this.pendingConfirmAction = null;
    this.confirmConfig.set(null);
  }

  onDialogCancelled(): void {
    this.pendingConfirmAction = null;
    this.confirmConfig.set(null);
  }

  onSearchInput(query: string): void {
    this.searchQuery.set(query);
  }

  togglePageStatus(item: BuilderAssetItem, event?: Event): void {
    if (this.moduleConfig().id !== 'page-builder') {
      return;
    }

    event?.stopPropagation();
    const nextStatus = getBuilderStatusPresentation(item.status).nextStatus;

    this.pageBuilderState.setPageStatus(item.id, nextStatus);
    this.toast.success(nextStatus === 'live' ? 'Page published' : 'Page moved to draft');
  }

  toggleItemStatus(item: BuilderAssetItem, event?: Event): void {
    event?.stopPropagation();

    const config = this.moduleConfig();
    const nextStatus = getBuilderStatusPresentation(item.status).nextStatus;

    if (config.id === 'form-builder') {
      this.formBuilderState.setFormStatus(item.id, nextStatus);
      this.toast.success(nextStatus === 'live' ? 'Form activated' : 'Form deactivated');
      return;
    }

    if (config.id === 'report-builder') {
      this.reportBuilderState.selectReport(item.id);
      if (nextStatus === 'live') {
        this.reportBuilderState.publishReport(item.id);
      } else {
        this.reportBuilderState.updateSelectedReport((report) => ({ ...report, status: 'draft' }));
      }
      this.toast.success(nextStatus === 'live' ? 'Dataframe activated' : 'Dataframe deactivated');
      return;
    }

    if (config.id === 'page-builder') {
      this.pageBuilderState.setPageStatus(item.id, nextStatus);
      this.toast.success(nextStatus === 'live' ? 'Page activated' : 'Page deactivated');
    }
  }

  getStatusToggleLabel(item: BuilderAssetItem): string {
    const config = this.moduleConfig();
    const assetLabel = config.id === 'form-builder' ? 'form' : config.id === 'report-builder' ? 'report' : 'page';
    const status = getBuilderStatusPresentation(item.status);
    return `${status.activationLabel} ${item.name} ${assetLabel}`;
  }

  getStatusLabel(status: BuilderAssetItem['status']): string {
    return getBuilderStatusPresentation(status).toggleLabel;
  }

  pageModalInitialName(): string {
    const pageId = this.editingPageId();
    return pageId ? this.pageBuilderState.pages().find((page) => page.id === pageId)?.name ?? '' : '';
  }

  pageModalInitialDescription(): string {
    const pageId = this.editingPageId();
    return pageId ? this.pageBuilderState.pages().find((page) => page.id === pageId)?.description ?? '' : '';
  }

  private syncSelectedTabFromRoute(): void {
    const tabs = this.moduleConfig().tabs ?? [];
    const activeRoute = this.activeRoute();

    if (!tabs.length || !activeRoute) {
      this.selectedTabIndex.set(0);
      return;
    }

    const matchingIndex = tabs.findIndex((tab) => !!tab.route && activeRoute.startsWith(tab.route));
    this.selectedTabIndex.set(matchingIndex >= 0 ? matchingIndex : 0);
  }
}
