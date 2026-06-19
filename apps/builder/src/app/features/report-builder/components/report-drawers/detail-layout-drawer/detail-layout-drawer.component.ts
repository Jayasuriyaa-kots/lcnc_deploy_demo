import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { ReportBuilderColumn } from '@builder/features/report-builder/facades/report-builder.facade';
import {
  DetailLayout,
  ReportAllFieldsLayout,
  ReportBlockLayoutItem,
  ReportTabLayoutItem,
} from '@builder/features/report-builder/models/report-builder.models';
import { DetailAllFieldsLayoutComponent } from '@builder/features/report-builder/components/detail-all-fields-layout/detail-all-fields-layout.component';
import { DetailBlockLayoutComponent } from '@builder/features/report-builder/components/detail-block-layout/detail-block-layout.component';
import { DetailTabLayoutComponent } from '@builder/features/report-builder/components/detail-tab-layout';
import { QoButtonComponent, QoConfirmDialogService, QoIconComponent } from '@qo/ui-components';


/**
 * Detail Layout Builder drawer. A unified editor with three sections — All Fields
 * (default), Blocks, and Tabs — selected via the top action bar. Edits are kept in
 * local draft signals and only pushed upward (as layout + mode) on Apply.
 *
 * Mounted fresh whenever the drawer opens, so drafts are seeded once in ngOnInit.
 */
import { ReportBuilderI18nService } from '../../../services/report-builder-i18n.service';
@Component({
  selector: 'app-detail-layout-drawer',
  standalone: true,
  imports: [QoButtonComponent, QoIconComponent, DetailAllFieldsLayoutComponent, DetailBlockLayoutComponent, DetailTabLayoutComponent],
  templateUrl: './detail-layout-drawer.component.html',
  styleUrl: '../report-drawers.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailLayoutDrawerComponent implements OnInit {
  private readonly i18n = inject(ReportBuilderI18nService);
  protected readonly t = this.i18n.t.bind(this.i18n);
  protected readonly common = this.i18n.common.bind(this.i18n);
  private readonly confirmDialog = inject(QoConfirmDialogService);
  private tabPromptOpenTimer: ReturnType<typeof setTimeout> | null = null;

  // ── Inputs ─────────────────────────────────────────────────────────────────
  readonly allColumns = input<ReportBuilderColumn[]>([]);
  readonly visibleColumns = input<ReportBuilderColumn[]>([]);
  readonly currentSourceFormId = input<string>('');
  readonly detailLayoutMode = input<DetailLayout>('all-fields');
  readonly initialAllFieldsLayout = input<ReportAllFieldsLayout>({ fieldIds: [] });
  readonly initialBlockLayout = input<ReportBlockLayoutItem[]>([]);
  readonly initialTabLayout = input<ReportTabLayoutItem[]>([]);

  // ── Outputs ──────────────────────────────────────────────────────────────
  readonly closeAll = output<void>();
  readonly detailLayoutModeChange = output<DetailLayout>();
  readonly allFieldsLayoutChange = output<ReportAllFieldsLayout>();
  readonly blockLayoutChange = output<ReportBlockLayoutItem[]>();
  readonly tabLayoutChange = output<ReportTabLayoutItem[]>();

  // ── Draft state ──────────────────────────────────────────────────────────────
  readonly detailModeDraft = signal<DetailLayout>('all-fields');
  readonly allFieldsDraft = signal<string[]>([]);
  readonly blockLayoutDraft = signal<ReportBlockLayoutItem[]>([]);
  readonly tabLayoutDraft = signal<ReportTabLayoutItem[]>([]);

  /** Section visibility — only one of Block/Tab is shown; neither = All Fields. */
  readonly showBlockSection = signal<boolean>(false);
  readonly showTabSection = signal<boolean>(false);

  /** Reference to the tab layout child — used to open/cancel its name prompt. */
  readonly tabLayoutRef = viewChild<DetailTabLayoutComponent>('tabLayoutRef');

  /** Seeds the draft signals from the inputs when the drawer opens. */
  ngOnInit(): void {
    this.detailModeDraft.set(this.normalizeDetailMode(this.detailLayoutMode()));
    this.showBlockSection.set(false);
    this.showTabSection.set(false);

    this.allFieldsDraft.set(
      this.initialAllFieldsLayout().fieldIds.length
        ? [...this.initialAllFieldsLayout().fieldIds]
        : this.visibleColumns().map((column) => column.id)
    );

    this.blockLayoutDraft.set(
      this.initialBlockLayout().length
        ? this.initialBlockLayout().map((block) => ({
            ...block,
            fieldIds: [...block.fieldIds],
            columns: block.columns?.map((column) => [...column]),
          }))
        : [
            {
              id: `block-${Date.now()}`,
              title: this.i18n.t('detailLayout.overview'),
              sourceFormId: this.currentSourceFormId(),
              fieldIds: this.visibleColumns().map((column) => column.id),
            },
          ]
    );

    this.tabLayoutDraft.set(
      this.initialTabLayout()
        .filter((tab) => !this.isDefaultOverviewTab(tab))
        .map((tab) => ({
          ...tab,
          fieldIds: [...tab.fieldIds],
          blocks: tab.blocks?.map((block) => ({
            ...block,
            fieldIds: [...block.fieldIds],
            columns: block.columns?.map((column) => [...column]),
          })),
        }))
    );
  }

  /** Sets the (normalised) draft layout mode. */
  setDetailLayoutMode(mode: DetailLayout): void {
    this.detailModeDraft.set(this.normalizeDetailMode(mode));
  }

  /** "Add Block": reveals the block section, then adds a block on each later click. */
  switchToBlockAndAdd(): void {
    this.clearTabPromptTimer();
    this.tabLayoutRef()?.cancelPrompt();
    const wasVisible = this.showBlockSection();
    this.showBlockSection.set(true);
    this.showTabSection.set(false);
    if (wasVisible || this.blockLayoutDraft().length === 0) {
      this.addBlockLayoutBlock();
    }
  }

  /** "Add Tab": reveals the tab section, then opens the tab name prompt. */
  switchToTabAndAdd(): void {
    this.clearTabPromptTimer();
    this.showBlockSection.set(false);
    this.showTabSection.set(true);
    this.tabLayoutDraft.update((tabs) => tabs.filter((tab) => !this.isDefaultOverviewTab(tab)));
    // Defer so @if(showTabSection()) mounts the component before we call into it.
    this.tabPromptOpenTimer = setTimeout(() => {
      this.tabLayoutRef()?.openPrompt();
      this.tabPromptOpenTimer = null;
    }, 0);
  }

  /** Returns to the All Fields section. */
  switchToAllFields(): void {
    this.clearTabPromptTimer();
    this.tabLayoutRef()?.cancelPrompt();
    this.showBlockSection.set(false);
    this.showTabSection.set(false);
  }

  /** Creates a tab with the user-confirmed title (from the tab child's prompt). */
  addTabLayoutTabWithTitle(title: string): void {
    const nextId = 'tab-' + Date.now();
    const safeTitle = title.trim() || this.i18n.t('detailLayout.newTab');
    this.tabLayoutDraft.update((tabs) => [
      ...tabs,
      { id: nextId, title: safeTitle, sourceFormId: this.currentSourceFormId(), fieldIds: [], blocks: [] },
    ]);
  }

  /** Apply: emits the active mode + all three layout drafts upward. */
  applyDetailLayoutBuilderUnified(): void {
    const mode: DetailLayout = this.showTabSection()
      ? 'tab-view'
      : this.showBlockSection()
      ? 'block-view'
      : 'all-fields';
    this.detailLayoutModeChange.emit(mode);
    this.allFieldsLayoutChange.emit({ fieldIds: [...this.allFieldsDraft()] });
    this.blockLayoutChange.emit(
      this.blockLayoutDraft().map((block) => ({
        ...block,
        fieldIds: [...block.fieldIds],
        columns: block.columns?.map((column) => [...column]),
      }))
    );
    this.tabLayoutChange.emit(
      this.tabLayoutDraft().map((tab) => ({
        ...tab,
        fieldIds: [...tab.fieldIds],
        blocks: tab.blocks?.map((block) => ({
          ...block,
          fieldIds: [...block.fieldIds],
          columns: block.columns?.map((column) => [...column]),
        })),
      }))
    );
  }

  // ── All Fields section ─────────────────────────────────────────────────────
  /** Replaces the all-fields ordering. */
  updateAllFieldsOrder(fieldIds: string[]): void {
    this.allFieldsDraft.set([...fieldIds]);
  }

  /** Appends a field to the all-fields list (no duplicates). */
  addAllField(fieldId: string): void {
    if (!fieldId || this.allFieldsDraft().includes(fieldId)) {
      return;
    }
    this.allFieldsDraft.set([...this.allFieldsDraft(), fieldId]);
  }

  /** Removes a field from the all-fields list. */
  removeAllField(fieldId: string): void {
    this.allFieldsDraft.set(this.allFieldsDraft().filter((id) => id !== fieldId));
  }

  // ── Block section ───────────────────────────────────────────────────────────
  /** Replaces the block layout draft (deep-cloned). */
  updateBlockLayout(layout: ReportBlockLayoutItem[]): void {
    this.blockLayoutDraft.set(
      layout.map((block) => ({
        ...block,
        fieldIds: [...block.fieldIds],
        columns: block.columns?.map((column) => [...column]),
      }))
    );
  }

  /** Adds a block seeded from the first block's fields (or all visible columns). */
  addBlockLayoutBlock(): void {
    this.blockLayoutDraft.update((blocks) => {
      const defaultFields = blocks[0]?.fieldIds.length
        ? [...blocks[0].fieldIds]
        : this.allFieldsDraft().length
        ? [...this.allFieldsDraft()]
        : this.visibleColumns().map((column) => column.id);

      return [
        ...blocks,
        { id: `block-${Date.now()}`, title: this.i18n.t('detailLayout.title'), sourceFormId: this.currentSourceFormId(), fieldIds: defaultFields },
      ];
    });
  }

  /** Renames a block. */
  renameBlockLayoutBlock(event: { id: string; title: string }): void {
    this.blockLayoutDraft.update((blocks) =>
      blocks.map((block) => (block.id === event.id ? { ...block, title: event.title || this.i18n.t('detailLayout.untitledBlock') } : block))
    );
  }

  /** Deletes a block after confirmation; hides the section when empty. */
  async deleteBlockLayoutBlock(blockId: string): Promise<void> {
    const confirmed = await this.confirmDialog.confirm(
      this.i18n.t('confirmations.deleteBlockTitle'),
      this.i18n.t('confirmations.deleteBlockMessage')
    );
    if (!confirmed) {
      return;
    }
    this.blockLayoutDraft.update((blocks) => blocks.filter((block) => block.id !== blockId));
    if (this.blockLayoutDraft().length === 0) {
      this.showBlockSection.set(false);
    }
  }

  // ── Tab section ─────────────────────────────────────────────────────────────
  /** Replaces the tab layout draft (deep-cloned). */
  updateTabLayout(layout: ReportTabLayoutItem[]): void {
    this.tabLayoutDraft.set(
      layout.map((tab) => ({
        ...tab,
        fieldIds: [...tab.fieldIds],
        blocks: tab.blocks?.map((block) => ({
          ...block,
          fieldIds: [...block.fieldIds],
          columns: block.columns?.map((column) => [...column]),
        })),
      }))
    );
  }

  /** Adds a numbered empty tab. */
  addTabLayoutTab(): void {
    this.tabLayoutDraft.update((tabs) => [
      ...tabs,
      { id: `tab-${Date.now()}`, title: `Tab ${tabs.length + 1}`, sourceFormId: this.currentSourceFormId(), fieldIds: [], blocks: [] },
    ]);
  }

  /** Renames a tab. */
  renameTabLayoutTab(event: { id: string; title: string }): void {
    this.tabLayoutDraft.update((tabs) =>
      tabs.map((tab) => (tab.id === event.id ? { ...tab, title: event.title || this.i18n.t('detailLayout.untitledTab') } : tab))
    );
  }

  /** Deletes a tab after confirmation; hides the section when empty. */
  async deleteTabLayoutTab(tabId: string): Promise<void> {
    const confirmed = await this.confirmDialog.confirm(
      this.i18n.t('confirmations.deleteTabTitle'),
      this.i18n.t('confirmations.deleteTabFromLayoutMessage')
    );
    if (!confirmed) {
      return;
    }
    this.tabLayoutDraft.update((tabs) => tabs.filter((tab) => tab.id !== tabId));
    if (this.tabLayoutDraft().length === 0) {
      this.showTabSection.set(false);
    }
  }

  /** Adds a field to a tab (no duplicates). */
  addFieldToTabLayout(event: { tabId: string; fieldId: string }): void {
    if (!event.fieldId) {
      return;
    }
    this.tabLayoutDraft.update((tabs) =>
      tabs.map((tab) =>
        tab.id === event.tabId && !tab.fieldIds.includes(event.fieldId)
          ? { ...tab, fieldIds: [...tab.fieldIds, event.fieldId] }
          : tab
      )
    );
  }

  /** Identifies the auto-generated default "Overview" tab so it can be filtered out. */
  private isDefaultOverviewTab(tab: ReportTabLayoutItem): boolean {
    return tab.id === 'overview' || tab.title.trim().toLowerCase() === 'overview';
  }

  /** Maps legacy/persisted layout-mode aliases to the canonical drawer values. */
  private normalizeDetailMode(mode: DetailLayout | string): DetailLayout {
    if (mode === 'all_fields') return 'all-fields';
    if (mode === 'block_layout') return 'block-view';
    if (mode === 'custom_layout') return 'tab-view';
    if (mode === 'all-fields' || mode === 'block-view' || mode === 'tab-view') {
      return mode;
    }
    return 'all-fields';
  }

  /** Clears any pending deferred tab-prompt timer. */
  private clearTabPromptTimer(): void {
    if (this.tabPromptOpenTimer) {
      clearTimeout(this.tabPromptOpenTimer);
      this.tabPromptOpenTimer = null;
    }
  }
}
