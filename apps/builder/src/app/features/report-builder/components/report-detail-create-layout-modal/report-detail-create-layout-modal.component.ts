import { inject, ChangeDetectionStrategy, Component, DestroyRef, computed, effect, input, output, signal } from '@angular/core';
import { QoCheckboxComponent, QoColorPickerComponent, QoSelectComponent, QoConfirmDialogService, QoButtonComponent, QoInputComponent, SelectOption } from '@qo/ui-components';
import { ReportBuilderColumn } from '@builder/features/report-builder/facades/report-builder.facade';
import { CanvasItemFieldStyle } from '@builder/features/report-builder/models/report-builder.models';

import {
  CanvasItem,
  CanvasItemStyle,
  CanvasItemType,
  defaultStyle,
  restoreStyle,
  elementDefaults,
  activeTabIndex,
  resolveParentSectionId,
  resolveParentTabPlacement,
  buildOrderedFieldData,
} from './canvas-item.model';
import { CanvasDragController } from './canvas-drag.controller';

export { CanvasItem, CanvasItemStyle, CanvasItemType } from './canvas-item.model';

import { ReportBuilderI18nService } from '../../services/report-builder-i18n.service';
@Component({
  selector: 'app-report-detail-create-layout-modal',
  standalone: true,
  imports: [QoCheckboxComponent, QoColorPickerComponent, QoSelectComponent, QoButtonComponent, QoInputComponent],
  templateUrl: './report-detail-create-layout-modal.component.html',
  styleUrl: './report-detail-create-layout-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportDetailCreateLayoutModalComponent {
  private readonly i18n = inject(ReportBuilderI18nService);
  protected readonly t = this.i18n.t.bind(this.i18n);
  protected readonly common = this.i18n.common.bind(this.i18n);
  private readonly confirmDialog = inject(QoConfirmDialogService);
  readonly allColumns = input<ReportBuilderColumn[]>([]);
  readonly initialLayoutName = input<string>('Custom Layout 1');
  readonly initialFieldIds = input<string[]>([]);
  readonly initialFieldStyles = input<Record<string, CanvasItemFieldStyle>>({});
  readonly initialCanvasItems = input<Array<Omit<CanvasItem, 'style'> & { style: CanvasItemFieldStyle }>>([]);
  readonly closed = output<void>();
  readonly saved = output<{
    name: string;
    fieldIds: string[];
    fieldStyles: Record<string, CanvasItemFieldStyle>;
    canvasItems: CanvasItem[];
  }>();

  readonly layoutName = signal('Custom Layout 1');
  readonly activeTool = signal<'data' | 'elements' | 'style'>('data');
  readonly searchText = signal('');
  readonly selectedElementType = signal<'section' | 'tab' | 'table' | 'text' | 'icon' | 'line'>('text');
  readonly stylePanelTab = signal<'design' | 'properties' | 'condition'>('design');
  readonly fieldsCollapsed = signal(false);
  readonly droppedFields = signal<CanvasItem[]>([]);
  readonly selectedItemId = signal<string | null>(null);
  readonly tabActiveIndexByItemId = signal<Record<string, number>>({});
  readonly contextMenuOpen = signal(false);
  readonly contextMenuX = signal(0);
  readonly contextMenuY = signal(0);
  readonly contextMenuItemId = signal<string | null>(null);

  // Which expand-sections are open (independent of enabled)
  readonly borderOpen = signal(false);
  readonly shadowOpen = signal(false);
  readonly radiusOpen = signal(false);
  readonly paddingOpen = signal(false);
  readonly marginOpen = signal(false);

  readonly borderStyles: CanvasItemStyle['borderStyle'][] = ['solid', 'dashed', 'dotted', 'double', 'none'];

  /**
   * Computes selected item from the current report state.
   */
  readonly selectedItem = computed<CanvasItem | null>(() => {
    const id = this.selectedItemId();
    if (!id) return null;
    return this.droppedFields().find((item) => item.id === id) ?? null;
  });

  /**
   * Ensures the style panel has an item to edit when the canvas already contains fields.
   */
  private ensureSelectedCanvasItem(items = this.droppedFields()): void {
    const currentId = this.selectedItemId();
    if (currentId && items.some((item) => item.id === currentId)) {
      return;
    }

    const firstEditable = items.find((item) => this.isItemVisible(item)) ?? items[0] ?? null;
    this.selectedItemId.set(firstEditable?.id ?? null);
  }

  /**
   * Computes filtered columns from the current report state.
   */
  readonly filteredColumns = computed(() => {
    const query = this.searchText().trim().toLowerCase();
    if (!query) return this.allColumns();
    return this.allColumns().filter((col) => col.label.toLowerCase().includes(query));
  });

  readonly fontWeights: CanvasItemStyle['fontWeight'][] = ['Regular', 'Semi bold', 'Bold'];
  readonly labelAligns: CanvasItemStyle['labelAlign'][] = ['Top', 'Left', 'Bottom', 'Right'];
  readonly fontWeightOptions: SelectOption[] = this.fontWeights.map((weight) => ({ label: weight, value: weight }));
  readonly borderStyleOptions: SelectOption[] = this.borderStyles.map((style) => ({ label: style, value: style }));

  /** Owns canvas item move/resize pointer interaction (keeps this component thin). */
  private readonly drag = new CanvasDragController(
    this.droppedFields,
    this.selectedItemId,
    () => this.tabActiveIndexByItemId(),
    () => this.closeContextMenu(),
  );

  /**
   * Initializes report detail create layout modal component and wires its reactive state.
   */
  constructor() {
    inject(DestroyRef).onDestroy(() => this.drag.destroy());

    effect(() => {
      const next = this.initialLayoutName().trim();
      this.layoutName.set(next || 'Custom Layout 1');
    }, { allowSignalWrites: true });

    effect(() => {
      const canvasItems = this.initialCanvasItems();
      if (canvasItems.length) {
        const restoredItems = canvasItems.map((item) => ({
            ...item,
            style: restoreStyle(item.style as CanvasItemFieldStyle),
            parentSectionId: item.parentSectionId ?? null,
            parentTabItemId: item.parentTabItemId ?? null,
            parentTabKey: item.parentTabKey ?? null,
            tabLabels: item.tabLabels ? [...item.tabLabels] : undefined,
          }));
        this.droppedFields.set(restoredItems);
        this.ensureSelectedCanvasItem(restoredItems);
        const tabState: Record<string, number> = {};
        canvasItems
          .filter((item) => item.type === 'tab')
          .forEach((tab) => {
            tabState[tab.id] = 0;
          });
        this.tabActiveIndexByItemId.set(tabState);
        return;
      }

      const fieldIds = this.initialFieldIds();
      if (!fieldIds.length) return;
      const columns = this.allColumns();
      const savedStyles = this.initialFieldStyles();
      const ITEM_HEIGHT = 56;
      const ITEM_WIDTH = 260;
      const PADDING = 16;
      const restoredItems = fieldIds.map((fieldId, index) => {
          const column = columns.find((col) => col.id === fieldId);
          const itemId = `${fieldId}-initial-${index}`;
          const savedStyle = savedStyles[itemId];
          return {
            id: itemId,
            type: 'field' as CanvasItemType,
            fieldId,
            label: column?.label ?? fieldId,
            x: PADDING,
            y: PADDING + index * (ITEM_HEIGHT + PADDING),
            width: ITEM_WIDTH,
            height: ITEM_HEIGHT,
            style: savedStyle ? restoreStyle(savedStyle) : defaultStyle(),
            parentSectionId: null,
            parentTabItemId: null,
            parentTabKey: null,
          };
        });
      this.droppedFields.set(restoredItems);
      this.ensureSelectedCanvasItem(restoredItems);
    }, { allowSignalWrites: true });
  }

  /**
   * Closes the modal and emits the close event.
   */
  close(): void { this.closed.emit(); }

  /** Returns the value safe for [style.background] — CSS vars work fine here */
  resolveSwatchColor(value: string): string {
    return value || 'var(--qo-color-neutral-200)';
  }

  /** Returns a hex value safe for [value] on input[type=color].
   *  CSS var() strings are NOT valid for color inputs — fall back to a neutral grey. */
  resolveHexColor(value: string): string {
    if (!value) return '#e5e7eb';
    if (value.startsWith('var(')) return '#e5e7eb';
    if (value.startsWith('#') && (value.length === 4 || value.length === 7)) return value;
    return '#e5e7eb';
  }

  /**
   * Updates layout name for the report configuration workflow.
   */
  updateLayoutName(value: string | number): void {
    this.layoutName.set(String(value ?? 'Custom Layout 1'));
  }

  /**
   * Updates search text for the report configuration workflow.
   */
  updateSearchText(value: string | number): void {
    this.searchText.set(String(value ?? ''));
  }

  /**
   * Sets element type for the report configuration workflow.
   */
  setElementType(type: 'section' | 'tab' | 'table' | 'text' | 'icon' | 'line'): void {
    this.selectedElementType.set(type);
  }

  /**
   * Sets style panel tab for the report configuration workflow.
   */
  setStylePanelTab(tab: 'design' | 'properties' | 'condition'): void {
    this.stylePanelTab.set(tab);
  }

  /**
   * Toggles fields collapsed for the report configuration workflow.
   */
  toggleFieldsCollapsed(): void {
    this.fieldsCollapsed.update((v) => !v);
  }

  /**
   * Changes the left-rail mode and prepares the style panel with an editable canvas item.
   */
  setActiveTool(tool: 'data' | 'elements' | 'style'): void {
    this.activeTool.set(tool);
    if (tool === 'style') {
      this.stylePanelTab.set('design');
      this.ensureSelectedCanvasItem();
    }
  }

  // Double-click on canvas item → select it and open Style panel
  /**
   * Selects item for the report configuration workflow.
   */
  selectItem(itemId: string): void {
    this.selectedItemId.set(itemId);
    this.activeTool.set('style');
    this.stylePanelTab.set('design');
  }

  /**
   * Deselects item for the report configuration workflow.
   */
  deselectItem(): void {
    this.selectedItemId.set(null);
    this.closeContextMenu();
  }

  /**
   * Opens item context menu for the report configuration workflow.
   */
  openItemContextMenu(event: MouseEvent, itemId: string): void {
    event.preventDefault();
    event.stopPropagation();

    const frame = (event.currentTarget as HTMLElement | null)?.closest('.canvas-frame') as HTMLElement | null;
    if (!frame) return;
    const rect = frame.getBoundingClientRect();
    this.contextMenuX.set(Math.max(0, Math.round(event.clientX - rect.left)));
    this.contextMenuY.set(Math.max(0, Math.round(event.clientY - rect.top)));
    this.contextMenuItemId.set(itemId);
    this.contextMenuOpen.set(true);
  }

  /**
   * Closes context menu for the report configuration workflow.
   */
  closeContextMenu(): void {
    this.contextMenuOpen.set(false);
    this.contextMenuItemId.set(null);
  }

  /**
   * Deletes context menu item for the report configuration workflow.
   */
  async deleteContextMenuItem(): Promise<void> {
    const itemId = this.contextMenuItemId();
    if (!itemId) return;
    const confirmed = await this.confirmDialog.confirm(
      this.i18n.t('confirmations.deleteElementTitle'),
      this.i18n.t('confirmations.deleteElementFromCanvasMessage')
    );
    if (!confirmed) return;

    this.droppedFields.update((items) => {
      const target = items.find((item) => item.id === itemId);
      if (!target) return items;
      if (target.type === 'section') {
        return items.filter((item) => item.id !== itemId && item.parentSectionId !== itemId);
      }
      if (target.type === 'tab') {
        return items.filter((item) => item.id !== itemId && item.parentTabItemId !== itemId);
      }
      return items.filter((item) => item.id !== itemId);
    });
    if (this.selectedItemId() === itemId) {
      this.selectedItemId.set(null);
    }
    this.closeContextMenu();
  }

  /**
   * Updates item style for the report configuration workflow.
   */
  updateItemStyle<K extends keyof CanvasItemStyle>(itemId: string, key: K, value: CanvasItemStyle[K]): void {
    this.droppedFields.update((items) =>
      items.map((item) =>
        item.id === itemId ? { ...item, style: { ...item.style, [key]: value } } : item
      )
    );
  }

  /** Sets the font weight from a qo-select value (avoids `$any` in the template). */
  setFontWeight(itemId: string, value: string | number): void {
    const options: CanvasItemStyle['fontWeight'][] = ['Regular', 'Semi bold', 'Bold'];
    const next = options.includes(value as CanvasItemStyle['fontWeight'])
      ? (value as CanvasItemStyle['fontWeight'])
      : 'Regular';
    this.updateItemStyle(itemId, 'fontWeight', next);
  }

  /** Sets the border style from a qo-select value (avoids `$any` in the template). */
  setBorderStyle(itemId: string, value: string | number): void {
    const options: CanvasItemStyle['borderStyle'][] = ['solid', 'dashed', 'dotted', 'double', 'none'];
    const next = options.includes(value as CanvasItemStyle['borderStyle'])
      ? (value as CanvasItemStyle['borderStyle'])
      : 'solid';
    this.updateItemStyle(itemId, 'borderStyle', next);
  }

  /**
   * Reads a native range input value as a number for canvas style updates.
   */
  readRangeValue(event: Event): number {
    const input = event.target as HTMLInputElement | null;
    return Number(input?.value ?? 0);
  }

  /**
   * Converts the style-panel font label to a CSS font-weight value.
   */
  getCanvasFontWeight(weight: CanvasItemStyle['fontWeight']): number {
    if (weight === 'Bold') return 700;
    if (weight === 'Semi bold') return 600;
    return 400;
  }

  /**
   * Toggles item style flag for the report configuration workflow.
   */
  toggleItemStyleFlag(itemId: string, flag: 'borderEnabled' | 'shadowEnabled' | 'radiusEnabled' | 'paddingEnabled' | 'marginEnabled'): void {
    const item = this.droppedFields().find((i) => i.id === itemId);
    if (!item) return;
    const newVal = !item.style[flag];
    this.updateItemStyle(itemId, flag, newVal);
    if (flag === 'borderEnabled')  this.borderOpen.set(newVal);
    if (flag === 'shadowEnabled')  this.shadowOpen.set(newVal);
    if (flag === 'radiusEnabled')  this.radiusOpen.set(newVal);
    if (flag === 'paddingEnabled') this.paddingOpen.set(newVal);
    if (flag === 'marginEnabled')  this.marginOpen.set(newVal);
  }

  /**
   * Toggles expand panel for the report configuration workflow.
   */
  toggleExpandPanel(panel: 'border' | 'shadow' | 'radius' | 'padding' | 'margin'): void {
    if (panel === 'border')  this.borderOpen.update((v) => !v);
    if (panel === 'shadow')  this.shadowOpen.update((v) => !v);
    if (panel === 'radius')  this.radiusOpen.update((v) => !v);
    if (panel === 'padding') this.paddingOpen.update((v) => !v);
    if (panel === 'margin')  this.marginOpen.update((v) => !v);
  }

  /**
   * Coordinates on field drag start for the report configuration workflow.
   */
  onFieldDragStart(event: DragEvent, column: ReportBuilderColumn): void {
    if (!event.dataTransfer) return;
    event.dataTransfer.setData('application/x-qo-field-id', column.id);
    event.dataTransfer.setData('application/x-qo-field-label', column.label);
    event.dataTransfer.effectAllowed = 'copy';
  }

  /**
   * Coordinates on element drag start for the report configuration workflow.
   */
  onElementDragStart(event: DragEvent, elementType: CanvasItemType): void {
    if (!event.dataTransfer) return;
    event.dataTransfer.setData('application/x-qo-element-type', elementType);
    event.dataTransfer.effectAllowed = 'copy';
  }

  /**
   * Coordinates on canvas drag over for the report configuration workflow.
   */
  onCanvasDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
  }

  /**
   * Coordinates on canvas drop for the report configuration workflow.
   */
  onCanvasDrop(event: DragEvent): void {
    this.closeContextMenu();
    event.preventDefault();
    const canvas = event.currentTarget as HTMLElement | null;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.round(event.clientX - rect.left - 80));
    const y = Math.max(0, Math.round(event.clientY - rect.top - 18));
    const elementType = event.dataTransfer?.getData('application/x-qo-element-type') as CanvasItemType | undefined;

    if (elementType && elementType !== 'field') {
      // Element drop (Section, Tab, Table, Text, Icon, Line)
      const defaults = elementDefaults(elementType);
      const items = this.droppedFields();
      const parentSectionId =
        elementType === 'section'
          ? null
          : resolveParentSectionId(items, x, y, defaults.width, defaults.height, null);
      const tabPlacement =
        elementType === 'section' || elementType === 'tab'
          ? null
          : resolveParentTabPlacement(items, x, y, defaults.width, defaults.height, null, this.tabActiveIndexByItemId());
      const tabId = `${elementType}-${Date.now()}`;
      const nextItem: CanvasItem = {
        id: tabId,
        type: elementType,
        fieldId: '',
        label: defaults.label,
        x, y,
        width: defaults.width,
        height: defaults.height,
        style: defaultStyle(),
        parentSectionId,
        parentTabItemId: tabPlacement?.tabItemId ?? null,
        parentTabKey: tabPlacement?.tabKey ?? null,
        tabLabels: elementType === 'tab' ? [this.i18n.t('detailLayout.unnamedTab')] : undefined,
        textContent: elementType === 'text' ? 'Text' : undefined,
      };
      this.droppedFields.update((items) => [
        ...items,
        nextItem,
      ]);
      this.selectItem(tabId);
      if (elementType === 'tab') {
        this.tabActiveIndexByItemId.update((map) => ({ ...map, [tabId]: 0 }));
      }
      return;
    }

    // Field drop
    const fieldId = event.dataTransfer?.getData('application/x-qo-field-id') ?? '';
    const fieldLabel = event.dataTransfer?.getData('application/x-qo-field-label') ?? '';
    if (!fieldId || !fieldLabel) return;
    const nextItemId = `${fieldId}-${Date.now()}-${this.droppedFields().filter((item) => item.fieldId === fieldId).length + 1}`;
    this.droppedFields.update((items) => {
      const width = 260;
      const height = 56;
      const parentSectionId = resolveParentSectionId(items, x, y, width, height, null);
      const tabPlacement = resolveParentTabPlacement(items, x, y, width, height, null, this.tabActiveIndexByItemId());
      return [...items, {
        id: nextItemId,
        type: 'field' as CanvasItemType,
        fieldId,
        label: fieldLabel,
        x, y,
        width,
        height,
        style: defaultStyle(),
        parentSectionId,
        parentTabItemId: tabPlacement?.tabItemId ?? null,
        parentTabKey: tabPlacement?.tabKey ?? null,
      }];
    });
    this.selectItem(nextItemId);
  }

  /** Begins moving a canvas item (delegated to the drag controller). */
  startCanvasItemMove(event: MouseEvent, itemId: string): void {
    this.drag.startMove(event, itemId);
  }

  /** Begins resizing a canvas item (delegated to the drag controller). */
  startCanvasItemResize(event: MouseEvent, itemId: string): void {
    this.drag.startResize(event, itemId);
  }

  /**
   * Coordinates get active tab index for the report configuration workflow.
   */
  getActiveTabIndex(tabItemId: string, maxTabs = 1): number {
    return activeTabIndex(this.tabActiveIndexByItemId(), tabItemId, maxTabs);
  }

  /**
   * Coordinates is tab active for the report configuration workflow.
   */
  isTabActive(tabItemId: string, index: number): boolean {
    const tab = this.droppedFields().find((item) => item.id === tabItemId);
    const total = tab?.tabLabels?.length ?? 1;
    return this.getActiveTabIndex(tabItemId, total) === index;
  }

  /**
   * Coordinates switch tab for the report configuration workflow.
   */
  switchTab(tabItemId: string, index: number): void {
    this.tabActiveIndexByItemId.update((map) => ({ ...map, [tabItemId]: Math.max(0, index) }));
  }

  /**
   * Adds tab for the report configuration workflow.
   */
  addTab(tabItemId: string): void {
    this.droppedFields.update((items) =>
      items.map((item) => {
        if (item.id !== tabItemId || item.type !== 'tab') return item;
        const current = item.tabLabels?.length ? item.tabLabels : [this.i18n.t('detailLayout.unnamedTab')];
        const nextLabel = `Unnamed Tab ${current.length + 1}`;
        return { ...item, tabLabels: [...current, nextLabel] };
      })
    );
    const tab = this.droppedFields().find((item) => item.id === tabItemId && item.type === 'tab');
    const nextIndex = (tab?.tabLabels?.length ?? 1) - 1;
    this.tabActiveIndexByItemId.update((map) => ({ ...map, [tabItemId]: Math.max(0, nextIndex) }));
  }

  /**
   * Coordinates is item visible for the report configuration workflow.
   */
  isItemVisible(item: CanvasItem): boolean {
    if (!item.parentTabItemId || !item.parentTabKey) return true;
    const tab = this.droppedFields().find((candidate) => candidate.id === item.parentTabItemId && candidate.type === 'tab');
    if (!tab) return true;
    const labels = tab.tabLabels?.length ? tab.tabLabels : [this.i18n.t('detailLayout.unnamedTab')];
    const activeKey = labels[this.getActiveTabIndex(tab.id, labels.length)] ?? labels[0];
    return activeKey === item.parentTabKey;
  }

  /**
   * Saves as new for the report configuration workflow.
   */
  saveAsNew(): void {
    const { fieldIds, fieldStyles, canvasItems } = buildOrderedFieldData(this.droppedFields());
    this.saved.emit({ name: this.layoutName().trim() || 'Custom Layout', fieldIds, fieldStyles, canvasItems });
  }

  /**
   * Updates layout for the report configuration workflow.
   */
  updateLayout(): void {
    const { fieldIds, fieldStyles, canvasItems } = buildOrderedFieldData(this.droppedFields());
    this.saved.emit({ name: this.layoutName().trim() || 'Custom Layout', fieldIds, fieldStyles, canvasItems });
  }
}
