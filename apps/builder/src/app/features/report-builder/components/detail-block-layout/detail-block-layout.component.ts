import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, input, output, signal } from '@angular/core';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ReportBlockLayoutItem } from '@builder/features/report-builder/models/report-builder.models';
import { ReportBuilderColumn } from '@builder/features/report-builder/facades/report-builder.facade';
import { QoButtonComponent, QoInputComponent, QoSelectComponent, SelectOption } from '@qo/ui-components';


import { ReportBuilderI18nService } from '../../services/report-builder-i18n.service';
@Component({
  selector: 'app-detail-block-layout',
  standalone: true,
  imports: [DragDropModule, QoButtonComponent, QoInputComponent, QoSelectComponent],
  templateUrl: './detail-block-layout.component.html',
  styleUrl: './detail-block-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * Block-based detail layout editor. Renders the report's detail blocks, each with
 * up to two field columns supporting drag/drop (within and across columns/blocks),
 * rename, split, collapse, and delete. Emits the updated blocks via `change`.
 */
export class DetailBlockLayoutComponent {
  private readonly i18n = inject(ReportBuilderI18nService);
  protected readonly t = this.i18n.t.bind(this.i18n);
  protected readonly common = this.i18n.common.bind(this.i18n);
  readonly blocks = input<ReportBlockLayoutItem[]>([]);
  readonly allColumns = input<ReportBuilderColumn[]>([]);
  readonly change = output<ReportBlockLayoutItem[]>();
  readonly addBlock = output<void>();
  readonly deleteBlock = output<string>();
  readonly renameBlock = output<{ id: string; title: string }>();

  /** This component's host element — used to focus the title editor in-scope. */
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly selectedBlockId = signal<string | null>(null);
  readonly editingTitleBlockId = signal<string | null>(null);
  readonly collapsedBlockIds = signal<Record<string, boolean>>({});
  readonly MAX_COLUMNS = 2;

  /** All column drop-list ids (`<blockId>__col<n>`) for cross-list DnD. */
  readonly connectedIds = computed(() =>
    this.blocks().flatMap((b) =>
      this.getBlockColumns(b).map((_, ci) => `${b.id}__col${ci}`)
    )
  );

  /** Alias of `connectedIds` used by the template's drop lists. */
  readonly allDropIds = computed(() => this.connectedIds());

  /** A block's columns (explicit `columns`, or a single column of `fieldIds`). */
  getBlockColumns(block: ReportBlockLayoutItem): string[][] {
    return block.columns ?? [block.fieldIds];
  }

  /** Selects a block for editing. */
  selectBlock(id: string): void {
    this.selectedBlockId.set(id);
  }

  /** Toggles inline title editing for a block (and focuses the input). */
  editBlockTitle(blockId: string): void {
    this.selectedBlockId.set(blockId);
    this.editingTitleBlockId.set(this.editingTitleBlockId() === blockId ? null : blockId);
    window.setTimeout(() => {
      // Scope the focus query to this component's own element (no global DOM query).
      this.host.nativeElement.querySelector<HTMLElement>('.block-title-editor')?.focus();
    });
  }

  /** Emits deletion of a block and clears its local UI state. */
  deleteBlockById(blockId: string): void {
    this.deleteBlock.emit(blockId);
    this.selectedBlockId.set(null);
    this.editingTitleBlockId.set(null);
    this.collapsedBlockIds.update((state) => {
      const next = { ...state };
      delete next[blockId];
      return next;
    });
  }

  /** Emits a block rename. */
  rename(id: string, title: string): void {
    this.renameBlock.emit({ id, title });
  }

  /** Selects all text in the title input on focus. */
  selectTitleText(event: FocusEvent): void {
    const input = event.target as HTMLInputElement | null;
    input?.select();
  }

  /** Splits a block into a second column (max two), emitting the change. */
  splitBlockById(blockId: string): void {
    this.collapsedBlockIds.update((state) => ({ ...state, [blockId]: false }));
    const next = this.blocks().map((b) => {
      if (b.id !== blockId) return b;
      const cols = b.columns ?? [b.fieldIds];
      if (cols.length >= this.MAX_COLUMNS) return b;
      return { ...b, columns: [...cols, []], fieldIds: b.fieldIds };
    });
    this.change.emit(next);
  }

  /** Whether a block is collapsed in the UI. */
  isBlockCollapsed(blockId: string): boolean {
    return !!this.collapsedBlockIds()[blockId];
  }

  /** Toggles a block's collapsed state. */
  toggleBlockCollapsed(blockId: string): void {
    this.collapsedBlockIds.update((state) => ({ ...state, [blockId]: !state[blockId] }));
  }

  /** Removes a column from a block (collapsing to single-column when one remains). */
  removeColumnById(blockId: string, colIndex: number): void {
    const next = this.blocks().map((b) => {
      if (b.id !== blockId) return b;
      const cols = b.columns ?? [b.fieldIds];
      if (cols.length <= 1) return b;
      const remaining = cols.filter((_, i) => i !== colIndex);
      if (remaining.length === 1) {
        return { ...b, columns: undefined, fieldIds: remaining[0] };
      }
      return { ...b, columns: remaining };
    });
    this.change.emit(next);
  }

  /** Handles a drag/drop into a block column (reorder or transfer across lists). */
  dropInColumn(event: CdkDragDrop<string[]>, blockId: string, colIndex: number): void {
    const next = this.blocks().map((b) => ({ ...b, fieldIds: [...b.fieldIds], columns: b.columns ? b.columns.map((c) => [...c]) : undefined }));
    const block = next.find((b) => b.id === blockId);
    if (!block) return;

    const cols = block.columns ?? [block.fieldIds];

    if (event.previousContainer === event.container) {
      moveItemInArray(cols[colIndex], event.previousIndex, event.currentIndex);
    } else {
      const srcId = event.previousContainer.id;
      const srcColMatch = srcId.match(/^(.+)__col(\d+)$/);
      if (srcColMatch) {
        const srcBlockId = srcColMatch[1];
        const srcColIndex = Number(srcColMatch[2]);
        const srcBlock = next.find((b) => b.id === srcBlockId);
        if (!srcBlock) return;
        const srcCols = srcBlock.columns ?? [srcBlock.fieldIds];
        const moving = srcCols[srcColIndex][event.previousIndex];
        if (cols[colIndex].includes(moving)) return;
        transferArrayItem(srcCols[srcColIndex], cols[colIndex], event.previousIndex, event.currentIndex);
        if (!srcBlock.columns) srcBlock.fieldIds = srcCols[0];
        else srcBlock.columns = srcCols;
      }
    }

    if (!block.columns) block.fieldIds = cols[0];
    else block.columns = cols;

    this.change.emit(next);
  }

  /** Adds a field to a block column (no duplicates), emitting the change. */
  addFieldToColumn(blockId: string, colIndex: number, fieldId: string): void {
    if (!fieldId) return;
    const next = this.blocks().map((b) => {
      if (b.id !== blockId) return b;
      const cols = (b.columns ?? [b.fieldIds]).map((c) => [...c]);
      if (cols[colIndex].includes(fieldId)) return b;
      cols[colIndex] = [...cols[colIndex], fieldId];
      if (!b.columns) return { ...b, fieldIds: cols[0] };
      return { ...b, columns: cols };
    });
    this.change.emit(next);
  }

  /** Removes a field from a block column, emitting the change. */
  removeFieldFromColumn(blockId: string, colIndex: number, fieldId: string): void {
    const next = this.blocks().map((b) => {
      if (b.id !== blockId) return b;
      const cols = (b.columns ?? [b.fieldIds]).map((c) => c.filter((id) => id !== fieldId));
      if (!b.columns) return { ...b, fieldIds: cols[0] };
      return { ...b, columns: cols };
    });
    this.change.emit(next);
  }

  /** Legacy single-column drop — delegates to column 0. */
  drop(event: CdkDragDrop<string[]>, blockId: string): void {
    this.dropInColumn(event, blockId, 0);
  }

  /** Legacy single-column add — delegates to column 0. */
  addField(blockId: string, fieldId: string): void {
    this.addFieldToColumn(blockId, 0, fieldId);
  }

  /** Legacy single-column remove — delegates to column 0. */
  removeField(blockId: string, fieldId: string): void {
    this.removeFieldFromColumn(blockId, 0, fieldId);
  }

  /** Columns not yet used by any block (eligible to add). */
  addableFields(fieldIds: string[]): ReportBuilderColumn[] {
    const allUsed = new Set(this.blocks().flatMap((b) => (b.columns ?? [b.fieldIds]).flat()));
    return this.allColumns().filter((column) => !allUsed.has(column.id));
  }

  /** Add-field picker options (addable columns). */
  addableFieldOptions(fieldIds: string[]): SelectOption[] {
    return this.addableFields(fieldIds).map((column) => ({ label: column.label, value: column.id }));
  }

  /** Coerces an unknown select/input payload to a string. */
  asText(value: unknown): string {
    return String(value ?? '');
  }

  /** Human label for a field id (column label, else the raw id). */
  label(id: string): string {
    return this.allColumns().find((c) => c.id === id)?.label ?? id;
  }
}
