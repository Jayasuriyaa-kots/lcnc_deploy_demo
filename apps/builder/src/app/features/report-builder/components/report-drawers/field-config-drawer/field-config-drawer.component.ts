import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal, inject } from '@angular/core';
import { ReportBuilderColumn } from '@builder/features/report-builder/facades/report-builder.facade';
import { QoButtonComponent, QoIconComponent, QoInputComponent, QoSelectComponent, SelectOption } from '@qo/ui-components';


const REPORT_COLOR_TEXT_PRIMARY = 'var(--qo-color-neutral-900)';

/**
 * Field-config drawer. Two modes driven by `isCardLayoutMode`:
 *   • Card layout → a two-slot card editor (field + display name, plus style).
 *   • List layout → a column list with display/style inspector + hidden-field adder.
 * Column edits are emitted as a fresh column array via `reorderColumns`; visibility
 * toggles via `toggleColumn`; card text style via `cardStyleChange`.
 */
import { ReportBuilderI18nService } from '../../../services/report-builder-i18n.service';
@Component({
  selector: 'app-field-config-drawer',
  standalone: true,
  imports: [QoButtonComponent, QoIconComponent, QoInputComponent, QoSelectComponent],
  templateUrl: './field-config-drawer.component.html',
  styleUrl: '../report-drawers.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldConfigDrawerComponent {
  private readonly i18n = inject(ReportBuilderI18nService);
  protected readonly t = this.i18n.t.bind(this.i18n);
  protected readonly common = this.i18n.common.bind(this.i18n);
  /** Exposed for templates that coerce a `valueChange` payload to string. */
  protected readonly String = String;

  // ── Inputs ─────────────────────────────────────────────────────────────────
  readonly allColumns = input<ReportBuilderColumn[]>([]);
  readonly visibleColumns = input<ReportBuilderColumn[]>([]);
  readonly isCardLayoutMode = input<boolean>(false);
  readonly cardFieldTextColor = input<string>(REPORT_COLOR_TEXT_PRIMARY);
  readonly cardFieldFontSize = input<number>(13);

  // ── Outputs ──────────────────────────────────────────────────────────────
  readonly closeAll = output<void>();
  readonly toggleColumn = output<string>();
  readonly reorderColumns = output<ReportBuilderColumn[]>();
  readonly cardStyleChange = output<{ textColor: string; fontSize: number }>();

  // ── Local UI state ───────────────────────────────────────────────────────────
  readonly cardSlotIndices = [0, 1] as const;
  readonly hiddenFieldsExpanded = signal<boolean>(false);
  readonly draggedColumnId = signal<string | null>(null);
  readonly cardConfigTab = signal<'display' | 'style'>('display');
  readonly listConfigTab = signal<'display' | 'style'>('display');
  readonly selectedCardSlot = signal<number>(0);
  readonly selectedListColumnId = signal<string | null>(null);
  readonly originalColumnLabels = signal<Record<string, string>>({});
  readonly cardTextColor = signal<string>(REPORT_COLOR_TEXT_PRIMARY);
  readonly cardFontSize = signal<number>(16);

  // ── Derived data ─────────────────────────────────────────────────────────────
  readonly hiddenColumns = computed(() => this.allColumns().filter((column) => !column.visible));
  readonly cardVisibleColumns = computed(() => this.visibleColumns().slice(0, 2));
  readonly allColumnOptions = computed<SelectOption[]>(() =>
    this.allColumns().map((column) => ({ value: column.id, label: column.label }))
  );
  readonly columnWidthOptions: SelectOption[] = [
    { value: 'Small', label: this.i18n.t('options.small') },
    { value: 'Medium', label: this.i18n.t('options.medium') },
    { value: 'Large', label: this.i18n.t('options.large') },
  ];
  readonly columnAlignmentOptions: SelectOption[] = [
    { value: 'Left', label: this.i18n.t('options.left') },
    { value: 'Center', label: this.i18n.t('options.center') },
    { value: 'Right', label: this.i18n.t('options.right') },
  ];
  /** Column currently selected in the list inspector (falls back to first visible). */
  readonly selectedListColumn = computed<ReportBuilderColumn | null>(() => {
    const selectedId = this.selectedListColumnId();
    const visible = this.visibleColumns();
    if (selectedId) {
      return visible.find((column) => column.id === selectedId) ?? visible[0] ?? null;
    }
    return visible[0] ?? null;
  });

  constructor() {
    // Mirror incoming card style into local editable signals.
    effect(
      () => {
        this.cardTextColor.set(this.cardFieldTextColor());
        this.cardFontSize.set(this.cardFieldFontSize());
      },
      { allowSignalWrites: true }
    );

    // Keep the selected list column valid as the visible set changes.
    effect(
      () => {
        const visible = this.visibleColumns();
        const selectedId = this.selectedListColumnId();
        if (!visible.length) {
          this.selectedListColumnId.set(null);
          return;
        }
        if (!selectedId || !visible.some((column) => column.id === selectedId)) {
          this.selectedListColumnId.set(visible[0].id);
        }
      },
      { allowSignalWrites: true }
    );

    // Remember each column's first-seen label so "Original Name" stays stable.
    effect(
      () => {
        const all = this.allColumns();
        this.originalColumnLabels.update((current) => {
          const next = { ...current };
          let changed = false;
          all.forEach((column) => {
            if (!next[column.id]) {
              next[column.id] = column.label || this.toTitleCaseFromId(column.id);
              changed = true;
            }
          });
          return changed ? next : current;
        });
      },
      { allowSignalWrites: true }
    );
  }

  /** Original (first-seen) label for a column, for the read-only "Original Name". */
  getOriginalColumnLabel(columnId: string): string {
    return this.originalColumnLabels()[columnId] ?? this.toTitleCaseFromId(columnId);
  }

  /** Humanises a field id ("flat_pincode" → "Flat Pincode"). */
  private toTitleCaseFromId(value: string): string {
    return (value || '').replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  }

  /** `track` fn for column `@for` loops. */
  trackColumn(_index: number, column: ReportBuilderColumn): string {
    return column.id;
  }

  // ── Hidden-field adder ─────────────────────────────────────────────────────
  /** Expand/collapse the "+ Add Fields" hidden-columns panel. */
  toggleHiddenFields(): void {
    this.hiddenFieldsExpanded.update((value) => !value);
  }

  /** Makes a hidden column visible. */
  addHiddenColumn(columnId: string): void {
    const column = this.allColumns().find((item) => item.id === columnId);
    if (!column || column.visible) {
      return;
    }
    this.toggleColumn.emit(columnId);
  }

  /** Hides a currently-visible column. */
  removeVisibleColumn(columnId: string): void {
    const column = this.allColumns().find((item) => item.id === columnId);
    if (!column || !column.visible) {
      return;
    }
    this.toggleColumn.emit(columnId);
  }

  // ── List inspector ──────────────────────────────────────────────────────────
  /** Selects a column to edit in the list inspector. */
  selectListColumn(columnId: string): void {
    this.selectedListColumnId.set(columnId);
  }

  /** Switches the list inspector between Display and Style tabs. */
  setListConfigTab(tab: 'display' | 'style'): void {
    this.listConfigTab.set(tab);
  }

  /** Renames a column (emits a new column array). */
  updateColumnLabel(columnId: string, value: string | number): void {
    const nextLabel = String(value ?? '').trim();
    if (!nextLabel) {
      return;
    }
    const columns = this.allColumns().map((column) =>
      column.id === columnId ? { ...column, label: nextLabel } : { ...column }
    );
    this.reorderColumns.emit(columns);
  }

  /** Updates a column's width (Small/Medium/Large). */
  updateColumnWidth(columnId: string, value: string | number): void {
    const nextWidth = String(value ?? '') as ReportBuilderColumn['width'];
    if (!['Small', 'Medium', 'Large'].includes(nextWidth)) {
      return;
    }
    const columns = this.allColumns().map((column) =>
      column.id === columnId ? { ...column, width: nextWidth } : { ...column }
    );
    this.reorderColumns.emit(columns);
  }

  /** Updates a column's text alignment (Left/Center/Right). */
  updateColumnAlignment(columnId: string, value: string | number): void {
    const nextAlignment = String(value ?? '') as ReportBuilderColumn['alignment'];
    if (!['Left', 'Center', 'Right'].includes(nextAlignment)) {
      return;
    }
    const columns = this.allColumns().map((column) =>
      column.id === columnId ? { ...column, alignment: nextAlignment } : { ...column }
    );
    this.reorderColumns.emit(columns);
  }

  /** Moves a column one step left/right in the order. */
  moveColumn(columnId: string, direction: -1 | 1): void {
    const columns = [...this.allColumns()];
    const currentIndex = columns.findIndex((column) => column.id === columnId);
    if (currentIndex < 0) {
      return;
    }
    const nextIndex = currentIndex + direction;
    if (nextIndex < 0 || nextIndex >= columns.length) {
      return;
    }
    const [column] = columns.splice(currentIndex, 1);
    columns.splice(nextIndex, 0, column);
    this.reorderColumns.emit(columns);
  }

  // ── Drag-and-drop reorder ──────────────────────────────────────────────────
  /** Records the column being dragged. */
  onDragStart(columnId: string): void {
    this.draggedColumnId.set(columnId);
  }

  /** Allows a drop by preventing the default dragover behaviour. */
  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  /** Reorders the dragged column to the drop target's position. */
  onDrop(targetColumnId: string): void {
    const draggedColumnId = this.draggedColumnId();
    if (!draggedColumnId || draggedColumnId === targetColumnId) {
      return;
    }
    const columns = [...this.allColumns()];
    const fromIndex = columns.findIndex((column) => column.id === draggedColumnId);
    const toIndex = columns.findIndex((column) => column.id === targetColumnId);
    if (fromIndex < 0 || toIndex < 0) {
      this.draggedColumnId.set(null);
      return;
    }
    const [moved] = columns.splice(fromIndex, 1);
    columns.splice(toIndex, 0, moved);
    this.reorderColumns.emit(columns);
    this.draggedColumnId.set(null);
  }

  // ── Card editor ─────────────────────────────────────────────────────────────
  /** Switches the card editor between Display and Style tabs. */
  setCardConfigTab(tab: 'display' | 'style'): void {
    this.cardConfigTab.set(tab);
  }

  /** Selects which card slot (0 or 1) is being edited. */
  selectCardSlot(slotIndex: number): void {
    this.selectedCardSlot.set(slotIndex);
  }

  /** Column id bound to a card slot. */
  getCardSlotColumnId(slotIndex: number): string {
    return this.cardVisibleColumns()[slotIndex]?.id ?? '';
  }

  /** Display label for a card slot. */
  getCardSlotLabel(slotIndex: number): string {
    return this.cardVisibleColumns()[slotIndex]?.label ?? 'Select Field';
  }

  /** Column bound to a card slot. */
  getCardSlotColumn(slotIndex: number): ReportBuilderColumn | null {
    return this.cardVisibleColumns()[slotIndex] ?? null;
  }

  /** Binds a column to a card slot, reordering visible columns so it lands in the slot. */
  onCardSlotFieldChange(slotIndex: number, columnId: string): void {
    if (!columnId) {
      return;
    }
    const columns = this.allColumns().map((column) => ({ ...column }));
    const selected = columns.find((column) => column.id === columnId);
    if (!selected) {
      return;
    }
    selected.visible = true;

    const visibleIds = columns.filter((column) => column.visible).map((column) => column.id);
    const reorderedVisible = visibleIds.filter((id) => id !== columnId);
    const insertAt = Math.min(slotIndex, reorderedVisible.length);
    reorderedVisible.splice(insertAt, 0, columnId);

    const orderIds = [
      ...reorderedVisible,
      ...columns.map((column) => column.id).filter((id) => !reorderedVisible.includes(id)),
    ];
    const orderMap = new Map(orderIds.map((id, index) => [id, index]));
    columns.sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0));

    this.reorderColumns.emit(columns);
  }

  /** Template adapter — coerces a select payload before binding a card slot field. */
  onCardSlotFieldChangeFromEvent(slotIndex: number, value: string | number): void {
    this.onCardSlotFieldChange(slotIndex, String(value ?? ''));
  }

  /** Renames the column bound to a card slot. */
  updateCardSlotDisplayName(slotIndex: number, value: string | number): void {
    const column = this.getCardSlotColumn(slotIndex);
    if (!column) {
      return;
    }
    this.updateColumnLabel(column.id, value);
  }

  /** Updates the card text colour and emits the style change. */
  onCardTextColorInput(value: string | null): void {
    const nextValue = value ?? REPORT_COLOR_TEXT_PRIMARY;
    this.cardTextColor.set(nextValue);
    this.cardStyleChange.emit({ textColor: nextValue, fontSize: this.cardFontSize() });
  }

  /** Updates the card font size (clamped 11–28) and emits the style change. */
  onCardFontSizeInput(value: string | number): void {
    const parsed = Number(value ?? 13);
    const nextValue = Number.isFinite(parsed) ? Math.min(28, Math.max(11, parsed)) : 13;
    this.cardFontSize.set(nextValue);
    this.cardStyleChange.emit({ textColor: this.cardTextColor(), fontSize: nextValue });
  }
}
