import { inject, ChangeDetectionStrategy, Component, ElementRef, computed, effect, input, output, signal } from '@angular/core';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ReportBuilderColumn } from '@builder/features/report-builder/facades/report-builder.facade';
import { ReportDetailTab, ReportDetailTabBlock } from '@builder/features/report-builder/models/report-builder.models';
import { QoConfirmDialogService, QoButtonComponent, QoIconComponent, QoInputComponent } from '@qo/ui-components';


import { ReportBuilderI18nService } from '../../services/report-builder-i18n.service';
@Component({
  selector: 'app-report-detail-layout-builder',
  standalone: true,
  imports: [QoButtonComponent, QoIconComponent, DragDropModule, QoInputComponent],
  templateUrl: './report-detail-layout-builder.component.html',
  styleUrl: './report-detail-layout-builder.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportDetailLayoutBuilderComponent {
  private readonly i18n = inject(ReportBuilderI18nService);
  protected readonly t = this.i18n.t.bind(this.i18n);
  protected readonly common = this.i18n.common.bind(this.i18n);
  private readonly confirmDialog = inject(QoConfirmDialogService);
  /** Host element — used to scroll this component's own fields panel into view. */
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly allColumns = input<ReportBuilderColumn[]>([]);
  readonly visibleColumns = input<ReportBuilderColumn[]>([]);
  readonly sourceFormId = input<string>('');
  readonly initialDetailTabs = input<ReportDetailTab[]>([]);
  readonly initialDetailBlocks = input<ReportDetailTabBlock[]>([]);

  readonly detailTabsChange = output<ReportDetailTab[]>();

  readonly tabs = signal<ReportDetailTab[]>([]);
  readonly activeTabId = signal<string | null>(null);

  /**
   * Computes active tab from the current report state.
   */
  readonly activeTab = computed(() => this.tabs().find((tab) => tab.id === this.activeTabId()) ?? this.tabs()[0] ?? null);
  /**
   * Computes field groups from the current report state.
   */
  readonly fieldGroups = computed(() => {
    const columns = this.allColumns();
    const primaryId = this.sourceFormId();
    const primary = columns.filter((column) => (column.formId || primaryId) === primaryId);
    const joinedMap = new Map<string, ReportBuilderColumn[]>();
    for (const column of columns) {
      const key = column.formId || primaryId;
      if (key === primaryId) {
        continue;
      }
      if (!joinedMap.has(key)) {
        joinedMap.set(key, []);
      }
      joinedMap.get(key)!.push(column);
    }

    return {
      primary,
      joined: Array.from(joinedMap.entries()).map(([formId, items]) => ({ formId, items })),
    };
  });

  /**
   * Initializes report detail layout builder component and wires its reactive state.
   */
  constructor() {
    effect(
      () => {
        const tabs = this.initialDetailTabs();
        if (tabs.length > 0) {
          this.tabs.set(tabs.map((tab) => ({ ...tab, blocks: tab.blocks.map((block) => this.cloneBlock(block)) })));
          this.activeTabId.set(tabs[0].id);
          return;
        }

        const blocks = this.initialDetailBlocks();
        if (blocks.length > 0) {
          this.tabs.set([
            {
              id: 'overview',
              title: this.i18n.t('detailLayout.overview'),
              blocks: blocks.map((block) => this.cloneBlock(block)),
            },
          ]);
          this.activeTabId.set('overview');
          return;
        }

        const sourceId = this.sourceFormId();
        const defaultFields = this.visibleColumns().map((column) => column.id);
        this.tabs.set([
          {
            id: 'overview',
            title: this.i18n.t('detailLayout.overview'),
            blocks: [
              {
                id: `block-${Date.now()}`,
                title: this.i18n.t('detailLayout.details'),
                sourceFormId: sourceId,
                fieldIds: defaultFields,
              },
            ],
          },
        ]);
        this.activeTabId.set('overview');
      },
      { allowSignalWrites: true }
    );
  }

  /**
   * Selects tab for the report configuration workflow.
   */
  selectTab(tabId: string): void {
    this.activeTabId.set(tabId);
  }

  /**
   * Adds tab for the report configuration workflow.
   */
  addTab(): void {
    const nextId = `tab-${Date.now()}`;
    const sourceId = this.sourceFormId();
    const nextTab: ReportDetailTab = {
      id: nextId,
      title: `Tab ${this.tabs().length + 1}`,
      blocks: [
        {
          id: `block-${nextId}`,
          title: this.i18n.t('detailLayout.details'),
          sourceFormId: sourceId,
          fieldIds: [],
        },
      ],
    };
    this.tabs.set([...this.tabs(), nextTab]);
    this.activeTabId.set(nextId);
  }

  /**
   * Coordinates rename tab for the report configuration workflow.
   */
  renameTab(tabId: string, value: string | number): void {
    const title = String(value ?? '').trim() || this.i18n.t('detailLayout.untitled');
    this.tabs.update((tabs) => tabs.map((tab) => (tab.id === tabId ? { ...tab, title } : tab)));
  }

  /**
   * Deletes tab for the report configuration workflow.
   */
  async deleteTab(tabId: string): Promise<void> {
    const confirmed = await this.confirmDialog.confirm(
      this.i18n.t('confirmations.deleteTabTitle'),
      this.i18n.t('confirmations.deleteTabMessage')
    );
    if (!confirmed) return;
    const next = this.tabs().filter((tab) => tab.id !== tabId);
    if (!next.length) {
      return;
    }
    this.tabs.set(next);
    if (this.activeTabId() === tabId) {
      this.activeTabId.set(next[0].id);
    }
  }

  /**
   * Adds block for the report configuration workflow.
   */
  addBlock(): void {
    const active = this.activeTab();
    if (!active) {
      return;
    }
    const blockId = `block-${Date.now()}`;
    const sourceId = this.sourceFormId();
    this.tabs.update((tabs) =>
      tabs.map((tab) =>
        tab.id === active.id
          ? {
              ...tab,
              blocks: [...tab.blocks, { id: blockId, title: `Block ${tab.blocks.length + 1}`, sourceFormId: sourceId, fieldIds: [] }],
            }
          : tab
      )
    );
  }

  /**
   * Coordinates rename block for the report configuration workflow.
   */
  renameBlock(tabId: string, blockId: string, value: string | number): void {
    const title = String(value ?? '').trim() || this.i18n.t('detailLayout.untitledBlock');
    this.tabs.update((tabs) =>
      tabs.map((tab) =>
        tab.id === tabId
          ? { ...tab, blocks: tab.blocks.map((block) => (block.id === blockId ? { ...block, title } : block)) }
          : tab
      )
    );
  }

  /**
   * Deletes block for the report configuration workflow.
   */
  async deleteBlock(tabId: string, blockId: string): Promise<void> {
    const confirmed = await this.confirmDialog.confirm(
      this.i18n.t('confirmations.deleteBlockTitle'),
      this.i18n.t('confirmations.deleteBlockAndFieldsMessage')
    );
    if (!confirmed) return;
    this.tabs.update((tabs) =>
      tabs.map((tab) => {
        if (tab.id !== tabId) {
          return tab;
        }
        if (tab.blocks.length === 1) {
          return tab;
        }
        return { ...tab, blocks: tab.blocks.filter((block) => block.id !== blockId) };
      })
    );
  }

  /**
   * Adds field to block for the report configuration workflow.
   */
  addFieldToBlock(blockId: string, fieldId: string, colIndex = 0): void {
    this.tabs.update((tabs) =>
      tabs.map((tab) => ({
        ...tab,
        blocks: tab.blocks.map((block) => {
          if (block.id !== blockId) {
            return block;
          }

          const columns = this.getBlockColumns(block).map((column) => [...column]);
          if (columns.flat().includes(fieldId)) {
            return block;
          }

          columns[colIndex] = [...(columns[colIndex] ?? []), fieldId];
          return this.withBlockColumns(block, columns);
        }),
      }))
    );
  }

  /**
   * Coordinates drop field for the report configuration workflow.
   */
  dropField(event: CdkDragDrop<string[]>, tabId: string, blockId: string, colIndex = 0): void {
    if (event.previousContainer === event.container) {
      const next = [...event.container.data];
      moveItemInArray(next, event.previousIndex, event.currentIndex);
      this.patchBlockColumn(tabId, blockId, colIndex, next);
      return;
    }

    const prev = [...event.previousContainer.data];
    const curr = [...event.container.data];
    const movingId = event.previousContainer.id === 'available-fields'
      ? String(event.item.data ?? '')
      : prev[event.previousIndex];
    if (curr.includes(movingId)) {
      return;
    }
    if (!movingId) {
      return;
    }

    if (event.previousContainer.id === 'available-fields') {
      curr.splice(event.currentIndex, 0, movingId);
      this.patchBlockColumn(tabId, blockId, colIndex, curr);
      return;
    }

    transferArrayItem(prev, curr, event.previousIndex, event.currentIndex);
    this.patchFieldArrays(event.previousContainer.id, prev, `${blockId}__col${colIndex}`, curr);
  }

  /**
   * Saves save back into the report configuration.
   */
  save(): void {
    this.detailTabsChange.emit(this.tabs().map((tab) => ({ ...tab, blocks: tab.blocks.map((block) => this.cloneBlock(block)) })));
  }

  /** Remove a single field from a specific block (the ✕ button on each field row). */
  removeFieldFromBlock(tabId: string, blockId: string, fieldId: string): void {
    this.tabs.update((tabs) =>
      tabs.map((tab) =>
        tab.id === tabId
          ? {
              ...tab,
              blocks: tab.blocks.map((block) =>
                block.id === blockId
                  ? this.removeFieldFromColumns(block, fieldId)
                  : block
              ),
            }
          : tab
      )
    );
  }

  /**
   * Opens the field picker for a given block.
   * Currently implemented as a click on the available-fields panel — the
   * sidebar is always visible so this simply scrolls the sidebar into view.
   * Replace with a modal/popover if a compact UI is preferred.
   */
  openFieldPicker(_blockId: string): void {
    this.host.nativeElement.querySelector<HTMLElement>('.dlb__fields-panel')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /**
   * Coordinates get field label for the report configuration workflow.
   */
  getFieldLabel(fieldId: string): string {
    return this.allColumns().find((column) => column.id === fieldId)?.label ?? fieldId;
  }

  /**
   * Provides a stable tracking key for by id for the report configuration workflow.
   */
  trackById(_index: number, item: { id: string }): string {
    return item.id;
  }

  /**
   * Coordinates get block columns for the report configuration workflow.
   */
  getBlockColumns(block: ReportDetailTabBlock): string[][] {
    return block.columns?.length ? block.columns : [block.fieldIds];
  }

  /**
   * Coordinates get block drop ids for the report configuration workflow.
   */
  getBlockDropIds(tab: ReportDetailTab): string[] {
    return [
      'available-fields',
      ...tab.blocks.flatMap((block) =>
        this.getBlockColumns(block).map((_, colIndex) => `${block.id}__col${colIndex}`)
      ),
    ];
  }

  /**
   * Coordinates split block for the report configuration workflow.
   */
  splitBlock(tabId: string, blockId: string): void {
    this.tabs.update((tabs) =>
      tabs.map((tab) =>
        tab.id === tabId
          ? {
              ...tab,
              blocks: tab.blocks.map((block) => {
                if (block.id !== blockId) {
                  return block;
                }
                const columns = this.getBlockColumns(block).map((column) => [...column]);
                if (columns.length >= 2) {
                  return block;
                }
                return { ...block, columns: [...columns, []] };
              }),
            }
          : tab
      )
    );
  }

  /**
   * Removes block column for the report configuration workflow.
   */
  removeBlockColumn(tabId: string, blockId: string, colIndex: number): void {
    this.tabs.update((tabs) =>
      tabs.map((tab) =>
        tab.id === tabId
          ? {
              ...tab,
              blocks: tab.blocks.map((block) => {
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

  /**
   * Coordinates patch field arrays for the report configuration workflow.
   */
  private patchFieldArrays(fromBlockId: string, fromFields: string[], toBlockId: string, toFields: string[]): void {
    this.tabs.update((tabs) =>
      tabs.map((tab) => ({
        ...tab,
        blocks: tab.blocks.map((block) => {
          const fromRef = this.parseColumnRef(fromBlockId);
          const toRef = this.parseColumnRef(toBlockId);
          if (block.id === fromRef.blockId) {
            return this.patchBlockColumnValue(block, fromRef.colIndex, fromFields);
          }
          if (block.id === toRef.blockId) {
            return this.patchBlockColumnValue(block, toRef.colIndex, toFields);
          }
          return block;
        }),
      }))
    );
  }

  /**
   * Coordinates patch block fields for the report configuration workflow.
   */
  private patchBlockFields(tabId: string, blockId: string, fieldIds: string[]): void {
    this.tabs.update((tabs) =>
      tabs.map((tab) =>
        tab.id === tabId
          ? { ...tab, blocks: tab.blocks.map((block) => (block.id === blockId ? { ...block, fieldIds, columns: undefined } : block)) }
          : tab
      )
    );
  }

  /**
   * Coordinates patch block column for the report configuration workflow.
   */
  private patchBlockColumn(tabId: string, blockId: string, colIndex: number, fieldIds: string[]): void {
    this.tabs.update((tabs) =>
      tabs.map((tab) =>
        tab.id === tabId
          ? {
              ...tab,
              blocks: tab.blocks.map((block) =>
                block.id === blockId ? this.patchBlockColumnValue(block, colIndex, fieldIds) : block
              ),
            }
          : tab
      )
    );
  }

  /**
   * Coordinates patch block column value for the report configuration workflow.
   */
  private patchBlockColumnValue(block: ReportDetailTabBlock, colIndex: number, fieldIds: string[]): ReportDetailTabBlock {
    const columns = this.getBlockColumns(block).map((column) => [...column]);
    columns[colIndex] = fieldIds;
    return this.withBlockColumns(block, columns);
  }

  /**
   * Coordinates with block columns for the report configuration workflow.
   */
  private withBlockColumns(block: ReportDetailTabBlock, columns: string[][]): ReportDetailTabBlock {
    const normalizedColumns = columns.map((column) => [...column]);
    if (normalizedColumns.length <= 1) {
      return { ...block, fieldIds: normalizedColumns[0] ?? [], columns: undefined };
    }
    return {
      ...block,
      fieldIds: normalizedColumns.flat(),
      columns: normalizedColumns,
    };
  }

  /**
   * Removes field from columns for the report configuration workflow.
   */
  private removeFieldFromColumns(block: ReportDetailTabBlock, fieldId: string): ReportDetailTabBlock {
    const columns = this.getBlockColumns(block).map((column) => column.filter((id) => id !== fieldId));
    return this.withBlockColumns(block, columns);
  }

  /**
   * Coordinates clone block for the report configuration workflow.
   */
  private cloneBlock(block: ReportDetailTabBlock): ReportDetailTabBlock {
    return {
      ...block,
      fieldIds: [...block.fieldIds],
      columns: block.columns?.map((column) => [...column]),
    };
  }

  /**
   * Coordinates parse column ref for the report configuration workflow.
   */
  private parseColumnRef(value: string): { blockId: string; colIndex: number } {
    const match = value.match(/^(.+)__col(\d+)$/);
    if (!match) {
      return { blockId: value, colIndex: 0 };
    }
    return { blockId: match[1], colIndex: Number(match[2]) || 0 };
  }
}
