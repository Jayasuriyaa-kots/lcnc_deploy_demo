import { inject, ChangeDetectionStrategy, Component, computed, effect, input, output, signal } from '@angular/core';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ReportTabLayoutItem } from '@builder/features/report-builder/models/report-builder.models';
import { ReportBuilderColumn } from '@builder/features/report-builder/facades/report-builder.facade';
import { QoConfirmDialogService, QoSelectComponent, QoButtonComponent, QoInputComponent, SelectOption } from '@qo/ui-components';


/** A block within a tab (tabs may contain multiple field blocks). */
type TabBlock = NonNullable<ReportTabLayoutItem['blocks']>[number];

/**
 * Tab-based detail layout editor. Presents a tab rail plus an editor for the
 * active tab where the user arranges fields (drag/drop), and optional blocks
 * that can be renamed, split into two columns, collapsed, or deleted.
 *
 * Dumb/presentational: it holds only UI-local state (active tab, rename/collapse,
 * prompt) and emits every persistent change upward via outputs.
 */
import { ReportBuilderI18nService } from '../../services/report-builder-i18n.service';
@Component({
  selector: 'app-detail-tab-layout',
  standalone: true,
  imports: [DragDropModule, QoSelectComponent, QoButtonComponent, QoInputComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './detail-tab-layout.component.html',
  styleUrl: './detail-tab-layout.component.scss',
})
export class DetailTabLayoutComponent {
  private readonly i18n = inject(ReportBuilderI18nService);
  protected readonly t = this.i18n.t.bind(this.i18n);
  protected readonly common = this.i18n.common.bind(this.i18n);
  private readonly confirmDialog = inject(QoConfirmDialogService);

  // ── Inputs / Outputs ─────────────────────────────────────────────────────
  readonly tabs = input<ReportTabLayoutItem[]>([]);
  readonly allColumns = input<ReportBuilderColumn[]>([]);

  readonly change = output<ReportTabLayoutItem[]>();
  readonly addTab = output<string>();
  readonly renameTab = output<{ id: string; title: string }>();
  readonly deleteTab = output<string>();
  readonly addField = output<{ tabId: string; fieldId: string }>();

  // ── UI-local state ───────────────────────────────────────────────────────────
  readonly promptOpen = signal(false);
  readonly promptValue = signal('');
  readonly renamingId = signal<string | null>(null);
  readonly renamingValue = signal('');
  readonly renamingBlockId = signal<string | null>(null);
  readonly renamingBlockValue = signal('');
  readonly activeTabId = signal<string | null>(null);
  readonly collapsedBlocks = signal<Record<string, boolean>>({});

  /** All cdkDropList ids (tab field lists + every block column) for cross-list DnD. */
  readonly connectedIds = computed(() =>
    this.tabs().flatMap((tab) => [
      tab.id,
      ...(tab.blocks ?? []).flatMap((block) =>
        this.getBlockColumns(block).map((_, colIndex) => `${block.id}__col${colIndex}`)
      ),
    ])
  );
  /** The currently-edited tab (falls back to the last tab). */
  readonly activeTab = computed(() => {
    const tabs = this.tabs();
    return tabs.find((tab) => tab.id === this.activeTabId()) ?? tabs[tabs.length - 1] ?? null;
  });

  constructor() {
    // Keep a valid active tab as the tabs input changes (default to the last one).
    effect(
      () => {
        const tabs = this.tabs();
        const activeId = this.activeTabId();
        if (!tabs.length) {
          this.activeTabId.set(null);
          return;
        }
        if (!activeId || !tabs.some((tab) => tab.id === activeId)) {
          this.activeTabId.set(tabs[tabs.length - 1].id);
        }
      },
      { allowSignalWrites: true }
    );
  }

  /** Opens the "name new tab" prompt. */
  openPrompt(): void {
    this.promptValue.set('');
    this.promptOpen.set(true);
  }

  /** Closes the prompt without creating a tab. */
  cancelPrompt(): void {
    this.promptOpen.set(false);
    this.promptValue.set('');
  }

  /** Confirms the prompt and emits a request to add a tab with the entered name. */
  confirmPrompt(): void {
    const title = this.promptValue().trim() || `Tab ${this.tabs().length + 1}`;
    this.addTab.emit(title);
    this.cancelPrompt();
  }

  /** Makes a tab active and exits any in-progress rename. */
  selectTab(tabId: string): void {
    this.activeTabId.set(tabId);
    this.renamingId.set(null);
    this.renamingBlockId.set(null);
  }

  /** Begins inline rename of a tab. */
  startRename(tab: ReportTabLayoutItem): void {
    this.activeTabId.set(tab.id);
    this.renamingId.set(tab.id);
    this.renamingValue.set(tab.title);
  }

  /** Commits a tab rename and emits it upward. */
  commitRename(tabId: string): void {
    const title = this.renamingValue().trim() || this.i18n.t('detailLayout.untitledTab');
    this.renameTab.emit({ id: tabId, title });
    this.renamingId.set(null);
  }

  /** Begins inline rename of a block. */
  startBlockRename(block: TabBlock): void {
    this.renamingBlockId.set(block.id);
    this.renamingBlockValue.set(block.title);
  }

  /** Commits a block rename into the tabs model and emits the change. */
  commitBlockRename(tabId: string, blockId: string): void {
    if (this.renamingBlockId() !== blockId) {
      return;
    }
    const title = this.renamingBlockValue().trim() || this.i18n.t('detailLayout.untitledBlock');
    this.change.emit(
      this.tabs().map((tab) =>
        tab.id === tabId
          ? {
              ...tab,
              blocks: (tab.blocks ?? []).map((block) => (block.id === blockId ? { ...block, title } : block)),
            }
          : tab
      )
    );
    this.renamingBlockId.set(null);
  }

  /** Confirms, then emits deletion of a tab, selecting a neighbouring tab. */
  async deleteActiveTab(tabId: string): Promise<void> {
    const confirmed = await this.confirmDialog.confirm(
      this.i18n.t('confirmations.deleteTabTitle'),
      this.i18n.t('confirmations.deleteTabAndFieldsMessage')
    );
    if (!confirmed) return;
    const tabs = this.tabs();
    const index = tabs.findIndex((tab) => tab.id === tabId);
    const next = tabs[index + 1] ?? tabs[index - 1] ?? null;
    this.activeTabId.set(next?.id ?? null);
    this.renamingId.set(null);
    this.deleteTab.emit(tabId);
  }

  /** Handles drag/drop within a tab's top-level field list (reorder or transfer in). */
  drop(event: CdkDragDrop<string[]>, tabId: string): void {
    const next = this.tabs().map((tab) => ({ ...tab, fieldIds: [...tab.fieldIds] }));
    const target = next.find((tab) => tab.id === tabId);
    if (!target) {
      return;
    }

    if (event.previousContainer === event.container) {
      moveItemInArray(target.fieldIds, event.previousIndex, event.currentIndex);
    } else {
      const source = next.find((tab) => tab.id === event.previousContainer.id);
      if (!source) {
        return;
      }
      const moving = source.fieldIds[event.previousIndex];
      if (target.fieldIds.includes(moving)) {
        return;
      }
      transferArrayItem(source.fieldIds, target.fieldIds, event.previousIndex, event.currentIndex);
    }
    this.change.emit(next);
  }

  /** Removes a field from a tab's top-level field list. */
  removeField(tabId: string, fieldId: string): void {
    this.change.emit(
      this.tabs().map((tab) =>
        tab.id === tabId ? { ...tab, fieldIds: tab.fieldIds.filter((id) => id !== fieldId) } : tab
      )
    );
  }

  /** Appends a new empty block to a tab. */
  addBlock(tabId: string): void {
    const sourceId = this.tabs().find((tab) => tab.id === tabId)?.sourceFormId ?? '';
    this.change.emit(
      this.tabs().map((tab) => {
        if (tab.id !== tabId) {
          return tab;
        }
        const blocks = tab.blocks ?? [];
        return {
          ...tab,
          blocks: [
            ...blocks,
            { id: `tab-block-${Date.now()}`, title: `Block ${blocks.length + 1}`, sourceFormId: sourceId, fieldIds: [] },
          ],
        };
      })
    );
  }

  /** Deletes a block from a tab and forgets its collapsed/rename state. */
  deleteBlock(tabId: string, blockId: string): void {
    this.collapsedBlocks.update((state) => {
      const next = { ...state };
      delete next[blockId];
      return next;
    });
    if (this.renamingBlockId() === blockId) {
      this.renamingBlockId.set(null);
    }
    this.change.emit(
      this.tabs().map((tab) =>
        tab.id === tabId ? { ...tab, blocks: (tab.blocks ?? []).filter((block) => block.id !== blockId) } : tab
      )
    );
  }

  /** Adds a field to a specific column of a block (no duplicates within the block). */
  onAddBlockField(tabId: string, blockId: string, value: unknown, colIndex = 0): void {
    const fieldId = String(value ?? '');
    if (!fieldId) {
      return;
    }
    this.change.emit(
      this.tabs().map((tab) =>
        tab.id === tabId
          ? {
              ...tab,
              blocks: (tab.blocks ?? []).map((block) =>
                block.id === blockId && !this.getBlockColumns(block).flat().includes(fieldId)
                  ? this.withBlockColumns(
                      block,
                      this.getBlockColumns(block).map((column, index) =>
                        index === colIndex ? [...column, fieldId] : [...column]
                      )
                    )
                  : block
              ),
            }
          : tab
      )
    );
  }

  /** Removes a field from a block (from whichever column holds it). */
  removeBlockField(tabId: string, blockId: string, fieldId: string): void {
    this.change.emit(
      this.tabs().map((tab) =>
        tab.id === tabId
          ? {
              ...tab,
              blocks: (tab.blocks ?? []).map((block) =>
                block.id === blockId
                  ? this.withBlockColumns(block, this.getBlockColumns(block).map((column) => column.filter((id) => id !== fieldId)))
                  : block
              ),
            }
          : tab
      )
    );
  }

  /** Handles drag/drop into/within a block column (reorder, cross-column, cross-block). */
  dropBlockField(event: CdkDragDrop<string[]>, tabId: string, blockId: string, colIndex = 0): void {
    const sourceRef = this.parseColumnRef(event.previousContainer.id);
    const movingId = String(event.item.data ?? '');
    this.change.emit(
      this.tabs().map((tab) => {
        if (tab.id !== tabId) {
          return tab;
        }
        const tabFieldIds =
          event.previousContainer.id === tab.id && movingId
            ? tab.fieldIds.filter((id) => id !== movingId)
            : [...tab.fieldIds];
        return {
          ...tab,
          fieldIds: tabFieldIds,
          blocks: (tab.blocks ?? []).map((block) => {
            if (block.id !== blockId && block.id !== sourceRef.blockId) {
              return block;
            }

            const columns = this.getBlockColumns(block).map((column) => [...column]);
            if (event.previousContainer === event.container && block.id === blockId) {
              moveItemInArray(columns[colIndex], event.previousIndex, event.currentIndex);
              return this.withBlockColumns(block, columns);
            }

            if (block.id === blockId && block.id === sourceRef.blockId) {
              const [moving] = columns[sourceRef.colIndex].splice(event.previousIndex, 1);
              if (!moving || columns[colIndex].includes(moving)) {
                return this.withBlockColumns(block, columns);
              }
              columns[colIndex].splice(event.currentIndex, 0, moving);
              return this.withBlockColumns(block, columns);
            }

            if (block.id === sourceRef.blockId) {
              columns[sourceRef.colIndex].splice(event.previousIndex, 1);
              return this.withBlockColumns(block, columns);
            }

            if (!movingId || columns.flat().includes(movingId)) {
              return block;
            }
            columns[colIndex].splice(event.currentIndex, 0, movingId);
            return this.withBlockColumns(block, columns);
          }),
        };
      })
    );
  }

  /** Select options for columns not already present in `fieldIds`. */
  addableOptions(fieldIds: string[]): SelectOption[] {
    return this.allColumns()
      .filter((column) => !fieldIds.includes(column.id))
      .map((column) => ({ label: column.label, value: column.id }));
  }

  /** Emits a request to add a field to a tab's top-level field list. */
  onAddField(tabId: string, value: unknown): void {
    const fieldId = String(value ?? '');
    if (fieldId) {
      this.addField.emit({ tabId, fieldId });
    }
  }

  /** Human label for a field id (column label, else the raw id). */
  label(id: string): string {
    return this.allColumns().find((column) => column.id === id)?.label ?? id;
  }

  /** Whether a block is collapsed in the UI. */
  isBlockCollapsed(blockId: string): boolean {
    return !!this.collapsedBlocks()[blockId];
  }

  /** Toggles a block's collapsed state. */
  toggleBlockCollapsed(blockId: string): void {
    this.collapsedBlocks.update((state) => ({ ...state, [blockId]: !state[blockId] }));
  }

  /** A block's columns (its explicit `columns`, or a single column of `fieldIds`). */
  getBlockColumns(block: TabBlock): string[][] {
    return block.columns?.length ? block.columns : [block.fieldIds];
  }

  /** Splits a block into a second column (max two columns). */
  splitBlock(tabId: string, blockId: string): void {
    this.change.emit(
      this.tabs().map((tab) =>
        tab.id === tabId
          ? {
              ...tab,
              blocks: (tab.blocks ?? []).map((block) => {
                if (block.id !== blockId) {
                  return block;
                }
                const columns = this.getBlockColumns(block).map((column) => [...column]);
                if (columns.length >= 2) {
                  return block;
                }
                return this.withBlockColumns(block, [...columns, []]);
              }),
            }
          : tab
      )
    );
  }

  /** Removes one column from a block (keeping at least one). */
  removeBlockColumn(tabId: string, blockId: string, colIndex: number): void {
    this.change.emit(
      this.tabs().map((tab) =>
        tab.id === tabId
          ? {
              ...tab,
              blocks: (tab.blocks ?? []).map((block) => {
                if (block.id !== blockId) {
                  return block;
                }
                const columns = this.getBlockColumns(block).map((column) => [...column]);
                if (columns.length <= 1) {
                  return block;
                }
                return this.withBlockColumns(block, columns.filter((_, index) => index !== colIndex));
              }),
            }
          : tab
      )
    );
  }

  /** Normalises a block's columns: single column collapses to `fieldIds` (no `columns`). */
  private withBlockColumns(block: TabBlock, columns: string[][]): TabBlock {
    const normalized = columns.map((column) => [...column]);
    if (normalized.length <= 1) {
      return { ...block, fieldIds: normalized[0] ?? [], columns: undefined };
    }
    return { ...block, fieldIds: normalized.flat(), columns: normalized };
  }

  /** Parses a `<blockId>__col<n>` drop-list id into its block id and column index. */
  private parseColumnRef(value: string): { blockId: string; colIndex: number } {
    const match = value.match(/^(.+)__col(\d+)$/);
    if (!match) {
      return { blockId: value, colIndex: 0 };
    }
    return { blockId: match[1], colIndex: Number(match[2]) || 0 };
  }
}
