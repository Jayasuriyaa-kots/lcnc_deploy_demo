import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import {
  ReportBuilderColumn,
  ReportBuilderSourceOption,
} from '@builder/features/report-builder/facades/report-builder.facade';
import { ReportDetailTabBlock } from '@builder/features/report-builder/models/report-builder.models';
import { QoButtonComponent, QoConfirmDialogService, QoIconComponent, QoInputComponent, QoSelectComponent, SelectOption } from '@qo/ui-components';


type BlockLayoutPreset = 'preset_1' | 'preset_2' | 'preset_3' | 'preset_4' | 'preset_5' | 'preset_6';

/** A detail block in local editing form (adds UI-only collapsed/alignment/preset). */
interface EditableDetailBlock {
  id: string;
  title: string;
  fieldIds: string[];
  columns?: string[][];
  collapsed: boolean;
  alignment: 'left' | 'center' | 'right';
  layoutPreset: BlockLayoutPreset;
  sourceFormId: string;
}

/**
 * Detail block layout drawer ("Configure Fields"). Lets the user compose detail
 * blocks: add/remove fields (with drag reorder across blocks), pick a layout preset,
 * set title/alignment, collapse, and add related blocks from other source forms.
 * Edits live in local signals and are emitted via `detailBlocksChange` on Apply.
 *
 * Mounted fresh on open, so the blocks are seeded once in ngOnInit.
 */
import { ReportBuilderI18nService } from '../../../services/report-builder-i18n.service';
@Component({
  selector: 'app-detail-block-layout-drawer',
  standalone: true,
  imports: [QoButtonComponent, QoIconComponent, QoInputComponent, QoSelectComponent],
  templateUrl: './detail-block-layout-drawer.component.html',
  styleUrl: '../report-drawers.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailBlockLayoutDrawerComponent implements OnInit {
  private readonly i18n = inject(ReportBuilderI18nService);
  protected readonly t = this.i18n.t.bind(this.i18n);
  protected readonly common = this.i18n.common.bind(this.i18n);
  private readonly confirmDialog = inject(QoConfirmDialogService);
  private nextDetailBlockId = 1;

  // ── Inputs ─────────────────────────────────────────────────────────────────
  readonly allColumns = input<ReportBuilderColumn[]>([]);
  readonly visibleColumns = input<ReportBuilderColumn[]>([]);
  readonly sourceOptions = input<ReportBuilderSourceOption[]>([]);
  readonly currentSourceFormId = input<string>('');
  readonly initialDetailBlocks = input<ReportDetailTabBlock[]>([]);

  // ── Outputs ──────────────────────────────────────────────────────────────
  readonly closeAll = output<void>();
  readonly detailBlocksChange = output<ReportDetailTabBlock[]>();

  // ── Local state ──────────────────────────────────────────────────────────────
  readonly detailBlocks = signal<EditableDetailBlock[]>([]);
  readonly detailAddFieldTarget = signal<string | null>(null);
  readonly selectedDetailBlockId = signal<string | null>(null);
  readonly blockPresetPickerOpen = signal<boolean>(false);
  readonly draggedDetailField = signal<{ fieldId: string; fromBlockId: string } | null>(null);
  readonly internalRelationModalOpen = signal<boolean>(false);
  readonly selectedRelation = signal<string>('');

  // ── Derived data / static options ────────────────────────────────────────────
  readonly selectedDetailBlock = computed(() =>
    this.detailBlocks().find((block) => block.id === this.selectedDetailBlockId()) ?? null
  );
  readonly relationOptions = computed<SelectOption[]>(() => {
    const currentFormId = this.currentSourceFormId();
    return this.sourceOptions()
      .filter((source) => source.id !== currentFormId)
      .map((source) => ({ value: source.id, label: `${source.name} (${source.tableLabel})` }));
  });
  readonly allColumnOptions = computed<SelectOption[]>(() =>
    this.allColumns().map((column) => ({ value: column.id, label: column.label }))
  );
  readonly blockAlignmentOptions: SelectOption[] = [
    { value: 'left', label: this.i18n.t('options.left') },
    { value: 'center', label: this.i18n.t('options.center') },
    { value: 'right', label: this.i18n.t('options.right') },
  ];
  get blockLayoutPresetOptions(): Array<{ id: BlockLayoutPreset; label: string }> {
    return ([1, 2, 3, 4, 5, 6] as const).map((index) => ({
      id: `preset_${index}` as BlockLayoutPreset,
      label: this.i18n.t('options.preset', { index }),
    }));
  }

  /** Seeds the editable blocks from the configured blocks (or one default block). */
  ngOnInit(): void {
    const configuredBlocks = this.initialDetailBlocks();
    if (configuredBlocks.length) {
      this.detailBlocks.set(
        configuredBlocks.map((block) => ({
          id: block.id || `detail-block-${this.nextDetailBlockId++}`,
          title: block.title || this.i18n.t('detailLayout.title'),
          fieldIds: [...block.fieldIds],
          columns: block.columns?.map((column) => [...column]),
          collapsed: false,
          alignment: 'left',
          layoutPreset: 'preset_6',
          sourceFormId: block.sourceFormId || this.currentSourceFormId(),
        }))
      );
    } else {
      this.detailBlocks.set([
        {
          id: `detail-block-${this.nextDetailBlockId++}`,
          title: this.i18n.t('detailLayout.title'),
          fieldIds: this.visibleColumns().map((column) => column.id),
          collapsed: false,
          alignment: 'left',
          layoutPreset: 'preset_6',
          sourceFormId: this.currentSourceFormId(),
        },
      ]);
    }
    this.selectedDetailBlockId.set(this.detailBlocks()[0]?.id ?? null);
    this.detailAddFieldTarget.set(null);
  }

  /** Human label for a field id (column label, else the raw id). */
  getDetailFieldLabel(fieldId: string): string {
    return this.allColumns().find((column) => column.id === fieldId)?.label ?? fieldId;
  }

  /** Allows a drop by preventing the default dragover behaviour. */
  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  // ── Add fields ──────────────────────────────────────────────────────────────
  /** Opens the inline field picker for a block. */
  openDetailAddFields(target: string): void {
    this.detailAddFieldTarget.set(target);
  }

  /** Adds the chosen field to the target block (no duplicates). */
  onDetailFieldSelected(value: unknown): void {
    const fieldId = String(value ?? '');
    const target = this.detailAddFieldTarget();
    if (!fieldId || !target) {
      return;
    }
    this.detailBlocks.update((blocks) =>
      blocks.map((block) =>
        block.id === target && !block.fieldIds.includes(fieldId)
          ? { ...block, fieldIds: [...block.fieldIds, fieldId] }
          : block
      )
    );
    this.detailAddFieldTarget.set(null);
  }

  // ── Blocks ──────────────────────────────────────────────────────────────────
  /** Adds a block seeded from the first block's fields (or all visible columns). */
  addDetailBlock(): void {
    const defaultFields = this.detailBlocks()[0]?.fieldIds.length
      ? this.detailBlocks()[0].fieldIds
      : this.visibleColumns().map((column) => column.id);

    this.detailBlocks.update((blocks) => [
      ...blocks,
      {
        id: `detail-block-${this.nextDetailBlockId++}`,
        title: this.i18n.t('detailLayout.title'),
        fieldIds: [...defaultFields],
        collapsed: false,
        alignment: 'left',
        layoutPreset: 'preset_6',
        sourceFormId: this.currentSourceFormId(),
      },
    ]);
    this.selectedDetailBlockId.set(this.detailBlocks()[this.detailBlocks().length - 1]?.id ?? null);
  }

  /** Selects a block for editing in the inspector. */
  selectDetailBlock(blockId: string): void {
    this.selectedDetailBlockId.set(blockId);
  }

  /** First `count` fields of a block from `start` — used by the preset previews. */
  getBlockPreviewFields(blockId: string, start: number, count: number): string[] {
    const block = this.detailBlocks().find((item) => item.id === blockId);
    if (!block) {
      return [];
    }
    return block.fieldIds.slice(start, start + count);
  }

  /** Removes a field from a block. */
  removeDetailBlockField(blockId: string, fieldId: string): void {
    this.detailBlocks.update((blocks) =>
      blocks.map((block) =>
        block.id === blockId ? { ...block, fieldIds: block.fieldIds.filter((id) => id !== fieldId) } : block
      )
    );
  }

  /** Renames the selected block. */
  updateSelectedDetailBlockTitle(value: string | number): void {
    const selectedId = this.selectedDetailBlockId();
    if (!selectedId) {
      return;
    }
    const title = String(value ?? '').trim();
    this.detailBlocks.update((blocks) =>
      blocks.map((block) => (block.id === selectedId ? { ...block, title: title || this.i18n.t('detailLayout.title') } : block))
    );
  }

  /** Toggles a block's collapsed state. */
  toggleDetailBlockCollapse(blockId: string): void {
    this.detailBlocks.update((blocks) =>
      blocks.map((block) => (block.id === blockId ? { ...block, collapsed: !block.collapsed } : block))
    );
  }

  /** Toggles the selected block's collapsed state. */
  toggleSelectedDetailBlockCollapse(): void {
    const selectedId = this.selectedDetailBlockId();
    if (!selectedId) {
      return;
    }
    this.toggleDetailBlockCollapse(selectedId);
  }

  /** Deletes the selected block after confirmation, selecting the next remaining one. */
  async deleteSelectedDetailBlock(): Promise<void> {
    const selectedId = this.selectedDetailBlockId();
    if (!selectedId) {
      return;
    }
    const confirmed = await this.confirmDialog.confirm(
      this.i18n.t('confirmations.deleteBlockTitle'),
      this.i18n.t('confirmations.deleteBlockPermanentMessage')
    );
    if (!confirmed) {
      return;
    }
    const remaining = this.detailBlocks().filter((block) => block.id !== selectedId);
    this.detailBlocks.set(remaining);
    this.selectedDetailBlockId.set(remaining[0]?.id ?? null);
  }

  // ── Preset picker / alignment ─────────────────────────────────────────────────
  /** Opens/closes the layout preset picker. */
  toggleBlockPresetPicker(): void {
    this.blockPresetPickerOpen.update((open) => !open);
  }

  /** Closes the layout preset picker. */
  closeBlockPresetPicker(): void {
    this.blockPresetPickerOpen.set(false);
  }

  /** Applies a layout preset to the selected block. */
  updateSelectedDetailBlockLayoutPreset(presetId: BlockLayoutPreset): void {
    const selectedId = this.selectedDetailBlockId();
    if (!selectedId) {
      return;
    }
    this.detailBlocks.update((blocks) =>
      blocks.map((block) => (block.id === selectedId ? { ...block, layoutPreset: presetId } : block))
    );
    this.blockPresetPickerOpen.set(false);
  }

  /** Sets the selected block's field alignment. */
  updateSelectedDetailBlockAlignment(value: string | number): void {
    const selectedId = this.selectedDetailBlockId();
    if (!selectedId) {
      return;
    }
    const alignment = String(value ?? 'left') as 'left' | 'center' | 'right';
    if (!['left', 'center', 'right'].includes(alignment)) {
      return;
    }
    this.detailBlocks.update((blocks) =>
      blocks.map((block) => (block.id === selectedId ? { ...block, alignment } : block))
    );
  }

  // ── Drag-and-drop fields between blocks ──────────────────────────────────────
  /** Records the field being dragged and its origin block. */
  onDetailFieldDragStart(blockId: string, fieldId: string): void {
    this.draggedDetailField.set({ fieldId, fromBlockId: blockId });
  }

  /** Moves/reorders the dragged field to the drop target (within or across blocks). */
  onDetailFieldDrop(targetBlockId: string, targetFieldId: string): void {
    const dragged = this.draggedDetailField();
    if (!dragged) {
      return;
    }
    if (dragged.fromBlockId === targetBlockId && dragged.fieldId === targetFieldId) {
      this.draggedDetailField.set(null);
      return;
    }

    this.detailBlocks.update((blocks) => {
      // Reorder within the same block.
      if (dragged.fromBlockId === targetBlockId) {
        return blocks.map((block) => {
          if (block.id !== targetBlockId) {
            return block;
          }
          const fromIndex = block.fieldIds.findIndex((id) => id === dragged.fieldId);
          const targetIndex = block.fieldIds.findIndex((id) => id === targetFieldId);
          if (fromIndex < 0 || targetIndex < 0) {
            return block;
          }
          const reordered = [...block.fieldIds];
          reordered.splice(fromIndex, 1);
          const insertIndex = fromIndex < targetIndex ? targetIndex - 1 : targetIndex;
          reordered.splice(insertIndex, 0, dragged.fieldId);
          return { ...block, fieldIds: reordered };
        });
      }

      // Move across blocks: remove from origin, insert at the target position.
      const nextBlocks = blocks.map((block) => ({
        ...block,
        fieldIds: block.fieldIds.filter((id) => !(block.id === dragged.fromBlockId && id === dragged.fieldId)),
      }));

      return nextBlocks.map((block) => {
        if (block.id !== targetBlockId) {
          return block;
        }
        const targetIndex = block.fieldIds.findIndex((id) => id === targetFieldId);
        if (targetIndex < 0) {
          return { ...block, fieldIds: [...block.fieldIds, dragged.fieldId] };
        }
        const reordered = [...block.fieldIds];
        reordered.splice(targetIndex, 0, dragged.fieldId);
        return { ...block, fieldIds: reordered };
      });
    });

    this.draggedDetailField.set(null);
  }

  /** Clears the drag state. */
  onDetailFieldDragEnd(): void {
    this.draggedDetailField.set(null);
  }

  // ── Internal relation (related block) modal ──────────────────────────────────
  /** Opens the related-block source picker. */
  openInternalRelationModal(): void {
    this.selectedRelation.set('');
    this.internalRelationModalOpen.set(true);
  }

  /** Closes the related-block source picker. */
  closeInternalRelationModal(): void {
    this.internalRelationModalOpen.set(false);
    this.selectedRelation.set('');
  }

  /** Records the chosen related source form. */
  onRelationSelected(value: string | number): void {
    this.selectedRelation.set(String(value ?? ''));
  }

  /** Adds a block built from the chosen related source form's columns. */
  confirmRelatedBlock(): void {
    const relationId = this.selectedRelation();
    if (!relationId) {
      return;
    }
    const source = this.sourceOptions().find((s) => s.id === relationId);
    const title = source ? source.name : this.i18n.t('detailLayout.relatedBlock');
    const relatedFieldIds = source ? source.columns.map((c) => c.id) : [];

    this.detailBlocks.update((blocks) => [
      ...blocks,
      {
        id: `detail-block-${this.nextDetailBlockId++}`,
        title,
        fieldIds: relatedFieldIds,
        collapsed: false,
        alignment: 'left' as const,
        layoutPreset: 'preset_6' as const,
        sourceFormId: relationId,
      },
    ]);
    this.selectedDetailBlockId.set(this.detailBlocks()[this.detailBlocks().length - 1]?.id ?? null);
    this.closeInternalRelationModal();
  }

  /** Emits the current blocks as persistable detail blocks (Apply). */
  emitDetailBlocks(): void {
    this.detailBlocksChange.emit(
      this.detailBlocks().map((block) => ({
        id: block.id,
        title: block.title,
        fieldIds: [...block.fieldIds],
        sourceFormId: block.sourceFormId,
        columns: block.columns?.map((column) => [...column]),
      }))
    );
  }
}
