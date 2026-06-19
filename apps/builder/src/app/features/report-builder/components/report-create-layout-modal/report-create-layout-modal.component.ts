import { TitleCasePipe } from '@angular/common';
import { inject, ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { QoConfirmDialogService, QoIconComponent, QoButtonComponent,
  QoColorPickerComponent,
  QoInputComponent,
  QoSelectComponent,
  SelectOption, } from '@qo/ui-components';
import { ReportBuilderColumn } from '@builder/features/report-builder/facades/report-builder.facade';
import { ReportQuickViewCustomLayout } from '../../models/report-builder.models';

import {
  BuilderElementId,
  BuilderTab,
  BuilderTool,
  TextPresetStyle,
  IconItem,
  ButtonPreset,
  BuilderElement,
  REPORT_TEXT_COLOR,
  REPORT_SURFACE_COLOR,
  TEXT_STYLE_DEFAULTS,
  IMAGE_SIZES,
  ICON_POOL_OUTLINE,
  ICON_POOL_SOLID,
} from './report-create-layout.model';

// ─── Component ────────────────────────────────────────────────────────────────

import { ReportBuilderI18nService } from '../../services/report-builder-i18n.service';
import { REPORTS_LANG } from '../../lang/reports.lang';
@Component({
  selector: 'app-report-create-layout-modal',
  standalone: true,
  imports: [QoIconComponent, TitleCasePipe, QoButtonComponent, QoColorPickerComponent, QoInputComponent, QoSelectComponent],
  templateUrl: './report-create-layout-modal.component.html',
  styleUrl: './report-create-layout-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportCreateLayoutModalComponent {
  private readonly i18n = inject(ReportBuilderI18nService);
  protected readonly t = this.i18n.t.bind(this.i18n);
  protected readonly common = this.i18n.common.bind(this.i18n);
  private readonly confirmDialog = inject(QoConfirmDialogService);
  /** Host element — used to query this modal's own canvas elements in-scope. */
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly allColumns = input<ReportBuilderColumn[]>([]);
  readonly config = input.required<ReportQuickViewCustomLayout>();

  readonly closed = output<void>();
  readonly saved = output<ReportQuickViewCustomLayout>();

  // ── State ──────────────────────────────────────────────────────────────────

  readonly activeTab        = signal<BuilderTab>('display');
  readonly activeTool       = signal<BuilderTool>('card');
  readonly selectedElement  = signal<string>('title-1');
  readonly containerWidth   = signal<number>(420);
  readonly containerHeight  = signal<number>(220);
  readonly iconTab          = signal<'outline' | 'solid'>('outline');
  readonly iconSearch       = signal<string>('');
  readonly slotMap          = signal<ReportQuickViewCustomLayout['slots']>({
    image: '', title: '', body: '', meta_left: '', meta_right: '',
  });

  private hydrated = false;

  private readonly layoutText = REPORTS_LANG.layoutBuilder;
  private readonly layoutOptions = REPORTS_LANG.options;

  readonly elements = signal<BuilderElement[]>([
    { instanceId: 'image-1',     slotId: 'image',      label: this.layoutText.slots.image,       x: 24,  y: 24,  width: 92,  height: 92,  visualType: 'image', imageShape: 'square' },
    { instanceId: 'title-1',     slotId: 'title',      label: this.layoutText.slots.title,       x: 136, y: 24,  width: 240, height: 44,  visualType: 'text',  textStyle: 'title',     fontSize: 18, fontWeight: 700 },
    { instanceId: 'body-1',      slotId: 'body',       label: this.layoutText.slots.bodyText,    x: 136, y: 72,  width: 220, height: 32,  visualType: 'text',  textStyle: 'normal',    fontSize: 14, fontWeight: 400 },
    { instanceId: 'meta-left-1', slotId: 'meta_left',  label: this.layoutText.slots.singleLine,  x: 136, y: 116, width: 140, height: 30,  visualType: 'text',  textStyle: 'secondary', fontSize: 13, fontWeight: 400 },
    { instanceId: 'meta-right-1',slotId: 'meta_right', label: this.layoutText.slots.caption,     x: 136, y: 150, width: 140, height: 30,  visualType: 'text',  textStyle: 'subtext',   fontSize: 12, fontWeight: 400 },
  ]);

  // ── Preset definitions ─────────────────────────────────────────────────────

  readonly textPresets: Array<{ label: string; style: TextPresetStyle; slotId: BuilderElementId }> = [
    { label: this.layoutText.textPresets.title,          style: 'title',     slotId: 'title'      },
    { label: this.layoutText.textPresets.subtitle,       style: 'subtitle',  slotId: 'title'      },
    { label: this.layoutText.textPresets.normalText,     style: 'normal',    slotId: 'body'       },
    { label: this.layoutText.textPresets.italicText,     style: 'italic',    slotId: 'body'       },
    { label: this.layoutText.textPresets.secondaryText,  style: 'secondary', slotId: 'meta_left'  },
    { label: this.layoutText.textPresets.boldText,       style: 'bold',      slotId: 'meta_left'  },
    { label: this.layoutText.textPresets.subtext,        style: 'subtext',   slotId: 'meta_right' },
  ];

  readonly imageShapes: Array<'square' | 'rounded' | 'circle'> = ['square', 'rounded', 'circle'];
  readonly imageSizes: Array<'small' | 'medium' | 'large'>     = ['small', 'medium', 'large'];

  readonly buttonPresets: ButtonPreset[] = [
    { variant: 'outline', shape: 'rectangular', label: this.layoutOptions.rectangular },
    { variant: 'outline', shape: 'rounded',     label: this.layoutOptions.rounded     },
    { variant: 'filled',  shape: 'rectangular', label: this.layoutOptions.rectangular },
    { variant: 'filled',  shape: 'rounded',     label: this.layoutOptions.rounded     },
  ];

  // ── Computed ───────────────────────────────────────────────────────────────

  /**
   * Computes filtered icons from the current report state.
   */
  readonly filteredIcons = computed<IconItem[]>(() => {
    const pool   = this.iconTab() === 'outline' ? ICON_POOL_OUTLINE : ICON_POOL_SOLID;
    const query  = this.iconSearch().toLowerCase().trim();
    return query ? pool.filter(i => i.label.toLowerCase().includes(query)) : pool;
  });

  /**
   * Computes field options from the current report state.
   */
  readonly fieldOptions = computed<SelectOption[]>(() => [
    { value: '', label: this.i18n.t('common.none') },
    ...this.allColumns().map(c => ({ value: c.id, label: c.label })),
  ]);

  /**
   * Computes selected field from the current report state.
   */
  readonly selectedField = computed(() => {
    const sel = this.selectedElementData();
    return sel ? this.slotMap()[sel.slotId] : '';
  });

  /**
   * Computes selected element data from the current report state.
   */
  readonly selectedElementData = computed(() =>
    this.elements().find(e => e.instanceId === this.selectedElement()) ?? this.elements()[0]
  );

  /**
   * Computes selected display label from the current report state.
   */
  readonly selectedDisplayLabel = computed(() => {
    const sel     = this.selectedElementData();
    if (!sel) return '';
    return sel.label;
  });

  // ── Select options ─────────────────────────────────────────────────────────

  readonly containerLayoutOptions: SelectOption[] = [{ value: 'card', label: REPORTS_LANG.common.card }];
  readonly fontWeightOptions: SelectOption[] = [
    { value: 400, label: this.i18n.t('options.regular')  },
    { value: 500, label: this.i18n.t('options.medium')   },
    { value: 600, label: this.i18n.t('options.semibold') },
    { value: 700, label: this.i18n.t('options.bold')     },
  ];
  readonly textAlignOptions: SelectOption[] = [
    { value: 'left',   label: this.i18n.t('options.left')   },
    { value: 'center', label: this.i18n.t('options.center') },
    { value: 'right',  label: this.i18n.t('options.right')  },
  ];

  // ── Drag state ─────────────────────────────────────────────────────────────

  private dragState: {
    id: string;
    mode: 'move' | 'resize';
    pointerStartX: number; pointerStartY: number;
    elementStartX: number; elementStartY: number;
    elementStartW: number; elementStartH: number;
  } | null = null;

  // Dragging a new element from the panel onto the canvas
  private pendingDrop: {
    type: BuilderTool;
    textStyle?: TextPresetStyle;
    imageShape?: 'square' | 'rounded' | 'circle';
    imageSize?: 'small' | 'medium' | 'large';
    iconGlyph?: string;
    iconTab?: 'outline' | 'solid';
    buttonVariant?: 'filled' | 'outline';
    buttonShape?: 'rectangular' | 'rounded';
    pointerStartX: number; pointerStartY: number;
  } | null = null;

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  /**
   * Initializes report create layout modal component and wires its reactive state.
   */
  constructor() {
    effect(() => {
      if (this.hydrated) return;
      const cfg = this.config();
      this.slotMap.set({ ...cfg.slots });
      if (cfg.canvasLayout?.elements?.length) {
        this.containerWidth.set(Math.max(280, Math.round(cfg.canvasLayout.containerWidth || 420)));
        this.containerHeight.set(Math.max(180, Math.round(cfg.canvasLayout.containerHeight || 220)));
        this.elements.set(cfg.canvasLayout.elements.map(e => ({
          ...e,
          slotId: e.slotId as BuilderElementId,
        })));
        this.selectedElement.set(cfg.canvasLayout.elements[0].instanceId);
      }
      this.hydrated = true;
    }, { allowSignalWrites: true });
  }

  // ── Public actions ─────────────────────────────────────────────────────────

  /**
   * Closes the modal and emits the close event.
   */
  close(): void { this.closed.emit(); }

  /**
   * Sets tool for the report configuration workflow.
   */
  setTool(tool: BuilderTool): void { this.activeTool.set(tool); }

  /**
   * Sets tab for the report configuration workflow.
   */
  setTab(tab: BuilderTab): void { this.activeTab.set(tab); }

  /**
   * Sets icon tab for the report configuration workflow.
   */
  setIconTab(tab: 'outline' | 'solid'): void { this.iconTab.set(tab); }

  /**
   * Coordinates on icon search for the report configuration workflow.
   */
  onIconSearch(value: string | number): void { this.iconSearch.set(String(value)); }

  /**
   * Selects element for the report configuration workflow.
   */
  selectElement(id: string): void { this.selectedElement.set(id); }

  // ── Drag-from-panel (new element drop onto canvas) ─────────────────────────

  /**
   * Coordinates start panel drag for the report configuration workflow.
   */
  startPanelDrag(
    event: MouseEvent,
    opts: {
      type: BuilderTool;
      textStyle?: TextPresetStyle;
      imageShape?: 'square' | 'rounded' | 'circle';
      imageSize?: 'small' | 'medium' | 'large';
      iconGlyph?: string;
      iconTab?: 'outline' | 'solid';
      buttonVariant?: 'filled' | 'outline';
      buttonShape?: 'rectangular' | 'rounded';
    }
  ): void {
    event.preventDefault();
    this.pendingDrop = {
      ...opts,
      pointerStartX: event.clientX,
      pointerStartY: event.clientY,
    };
    window.addEventListener('mousemove', this.handlePanelDragMove);
    window.addEventListener('mouseup',   this.handlePanelDrop);
  }

  private handlePanelDragMove = (event: MouseEvent): void => {
    // Ghost cursor feedback is done via CSS on the body; nothing extra needed here.
  };

  private handlePanelDrop = (event: MouseEvent): void => {
    window.removeEventListener('mousemove', this.handlePanelDragMove);
    window.removeEventListener('mouseup',   this.handlePanelDrop);

    if (!this.pendingDrop) return;
    const pd = this.pendingDrop;
    this.pendingDrop = null;

    // Find the canvas pane element to compute drop coordinates (scoped to this modal).
    const root = this.host.nativeElement;
    const canvasPaneEl = root.querySelector('.create-layout-canvas') as HTMLElement | null;
    const cardEl       = root.querySelector('.canvas-container-card') as HTMLElement | null;
    if (!canvasPaneEl || !cardEl) return;

    const cardRect = cardEl.getBoundingClientRect();
    const dropX    = Math.max(0, Math.round(event.clientX - cardRect.left));
    const dropY    = Math.max(0, Math.round(event.clientY - cardRect.top));

    // Only create element if dropped inside the card area
    if (
      event.clientX < cardRect.left || event.clientX > cardRect.right ||
      event.clientY < cardRect.top  || event.clientY > cardRect.bottom
    ) {
      return;
    }

    this.addElementAtPosition(pd, dropX, dropY);
  };

  /**
   * Adds element at position for the report configuration workflow.
   */
  private addElementAtPosition(
    pd: NonNullable<typeof this.pendingDrop>,
    x: number,
    y: number
  ): void {
    const instanceId = `${pd.type}-${Date.now()}`;
    const slotIds: BuilderElementId[] = ['title', 'body', 'meta_left', 'meta_right', 'image'];
    const usedSlots = new Set(this.elements().map(e => e.slotId));
    const freeSlot  = slotIds.find(s => !usedSlots.has(s)) ?? 'meta_right';

    let newEl: BuilderElement;

    if (pd.type === 'text' && pd.textStyle) {
      const defaults = TEXT_STYLE_DEFAULTS[pd.textStyle];
      const label    = this.textPresets.find(t => t.style === pd.textStyle)?.label ?? pd.textStyle;
      newEl = {
        instanceId,
        slotId:     freeSlot,
        label,
        x, y,
        width: 200, height: 36,
        visualType: 'text',
        textStyle:  pd.textStyle,
        fontSize:   defaults.fontSize,
        fontWeight: defaults.fontWeight,
        textAlign:  'left',
      };
    } else if (pd.type === 'image' && pd.imageShape && pd.imageSize) {
      const dims = IMAGE_SIZES[pd.imageSize];
      newEl = {
        instanceId,
        slotId:     'image',
        label:      this.layoutText.slots.image,
        x, y,
        width:      dims.width,
        height:     dims.height,
        visualType: 'image',
        imageShape: pd.imageShape,
      };
    } else if (pd.type === 'icon' && pd.iconGlyph) {
      newEl = {
        instanceId,
        slotId:     freeSlot,
        label:      pd.iconGlyph,
        x, y,
        width: 40, height: 40,
        visualType: 'icon',
        iconGlyph:  pd.iconGlyph,
      };
    } else if (pd.type === 'button') {
      newEl = {
        instanceId,
        slotId:        freeSlot,
        label:         this.layoutText.tools.button,
        x, y,
        width: 140, height: 40,
        visualType:    'button',
        buttonVariant: pd.buttonVariant ?? 'outline',
        buttonShape:   pd.buttonShape   ?? 'rectangular',
      };
    } else {
      return;
    }

    this.elements.update(els => [...els, newEl]);
    this.selectedElement.set(instanceId);
  }

  // ── Canvas element drag/resize ─────────────────────────────────────────────

  /**
   * Coordinates start move for the report configuration workflow.
   */
  startMove(event: MouseEvent, id: string): void {
    if ((event.target as HTMLElement).classList.contains('resize-handle')) return;
    event.preventDefault();
    this.selectElement(id);
    const current = this.elements().find(e => e.instanceId === id);
    if (!current) return;
    this.dragState = {
      id, mode: 'move',
      pointerStartX: event.clientX, pointerStartY: event.clientY,
      elementStartX: current.x,    elementStartY: current.y,
      elementStartW: current.width, elementStartH: current.height,
    };
    window.addEventListener('mousemove', this.handlePointerMove);
    window.addEventListener('mouseup',   this.stopPointerInteraction);
  }

  /**
   * Coordinates start resize for the report configuration workflow.
   */
  startResize(event: MouseEvent, id: string): void {
    event.preventDefault();
    event.stopPropagation();
    this.selectElement(id);
    const current = this.elements().find(e => e.instanceId === id);
    if (!current) return;
    this.dragState = {
      id, mode: 'resize',
      pointerStartX: event.clientX, pointerStartY: event.clientY,
      elementStartX: current.x,    elementStartY: current.y,
      elementStartW: current.width, elementStartH: current.height,
    };
    window.addEventListener('mousemove', this.handlePointerMove);
    window.addEventListener('mouseup',   this.stopPointerInteraction);
  }

  private handlePointerMove = (event: MouseEvent): void => {
    if (!this.dragState) return;
    const dx = event.clientX - this.dragState.pointerStartX;
    const dy = event.clientY - this.dragState.pointerStartY;
    const id = this.dragState.id;
    if (this.dragState.mode === 'move') {
      this.elements.update(els => els.map(e =>
        e.instanceId === id
          ? { ...e, x: Math.max(0, Math.round(this.dragState!.elementStartX + dx)),
                    y: Math.max(0, Math.round(this.dragState!.elementStartY + dy)) }
          : e
      ));
    } else {
      this.elements.update(els => els.map(e =>
        e.instanceId === id
          ? { ...e, width:  Math.max(48, Math.round(this.dragState!.elementStartW + dx)),
                    height: Math.max(28, Math.round(this.dragState!.elementStartH + dy)) }
          : e
      ));
    }
  };

  private stopPointerInteraction = (): void => {
    this.dragState = null;
    window.removeEventListener('mousemove', this.handlePointerMove);
    window.removeEventListener('mouseup',   this.stopPointerInteraction);
  };

  // ── Inspector actions ──────────────────────────────────────────────────────

  /**
   * Updates selected field for the report configuration workflow.
   */
  updateSelectedField(value: string | number): void {
    const sel = this.selectedElementData();
    if (!sel) return;
    const columnId = String(value ?? '');
    const matched = this.allColumns().find(c => c.id === columnId);
    this.slotMap.update(s => ({ ...s, [sel.slotId]: columnId }));
    if (matched) {
      this.updateSelectedElementLabel(matched.label);
    }
  }

  /**
   * Updates selected element label for the report configuration workflow.
   */
  updateSelectedElementLabel(value: string | number): void {
    const label = String(value ?? '').trim();
    const id = this.selectedElement();
    this.elements.update(els => els.map(e =>
      e.instanceId === id ? { ...e, label: label || e.label } : e
    ));
  }

  /**
   * Updates element value for the report configuration workflow.
   */
  updateElementValue(key: 'x' | 'y' | 'width' | 'height', value: string | number): void {
    const next = Number(value);
    if (!Number.isFinite(next)) return;
    const id = this.selectedElement();
    this.elements.update(els => els.map(e =>
      e.instanceId === id ? { ...e, [key]: Math.max(0, next) } : e
    ));
  }

  /**
   * Updates container size for the report configuration workflow.
   */
  updateContainerSize(key: 'width' | 'height', value: string | number): void {
    const next = Number(value);
    if (!Number.isFinite(next)) return;
    if (key === 'width')  { this.containerWidth.set(Math.max(280, Math.min(900, Math.round(next)))); return; }
    this.containerHeight.set(Math.max(180, Math.min(560, Math.round(next))));
  }

  /**
   * Updates selected element style for the report configuration workflow.
   */
  updateSelectedElementStyle(
    key: 'fontSize' | 'fontWeight' | 'textAlign' | 'textColor' | 'backgroundColor',
    value: string | number
  ): void {
    const id = this.selectedElement();
    this.elements.update(els => els.map(e => {
      if (e.instanceId !== id) return e;
      if (key === 'fontSize')   return { ...e, fontSize: Number.isFinite(Number(value)) ? Math.max(12, Math.min(48, Number(value))) : e.fontSize };
      if (key === 'fontWeight') return { ...e, fontWeight: Number(value || e.fontWeight || 600) };
      if (key === 'textAlign')  return { ...e, textAlign: String(value || 'left') as 'left' | 'center' | 'right' };
      if (key === 'textColor')  return { ...e, textColor: String(value || REPORT_TEXT_COLOR) };
      return { ...e, backgroundColor: String(value || REPORT_SURFACE_COLOR) };
    }));
  }

  /**
   * Coordinates reset selected element style for the report configuration workflow.
   */
  resetSelectedElementStyle(key: 'textColor' | 'backgroundColor'): void {
    this.updateSelectedElementStyle(key, key === 'textColor' ? REPORT_TEXT_COLOR : REPORT_SURFACE_COLOR);
  }

  /**
   * Coordinates align selected for the report configuration workflow.
   */
  alignSelected(horizontal: 'left' | 'center' | 'right'): void {
    const sel = this.selectedElementData();
    if (!sel) return;
    const cw = this.containerWidth();
    const x = horizontal === 'left' ? 12
             : horizontal === 'center' ? Math.round((cw - sel.width) / 2)
             : Math.max(12, cw - sel.width - 12);
    this.updateElementValue('x', x);
  }

  /**
   * Coordinates align selected vertical for the report configuration workflow.
   */
  alignSelectedVertical(vertical: 'top' | 'middle' | 'bottom'): void {
    const sel = this.selectedElementData();
    if (!sel) return;
    const ch = this.containerHeight();
    const y = vertical === 'top'    ? 12
             : vertical === 'middle' ? Math.round((ch - sel.height) / 2)
             : Math.max(12, ch - sel.height - 12);
    this.updateElementValue('y', y);
  }

  /**
   * Duplicates selected for the report configuration workflow.
   */
  duplicateSelected(): void {
    const sel = this.selectedElementData();
    if (!sel) return;
    const clone: BuilderElement = { ...sel, instanceId: `${sel.slotId}-${Date.now()}`, x: sel.x + 16, y: sel.y + 16 };
    this.elements.update(els => [...els, clone]);
    this.selectedElement.set(clone.instanceId);
  }

  /**
   * Deletes selected for the report configuration workflow.
   */
  async deleteSelected(): Promise<void> {
    const id = this.selectedElement();
    const current = this.elements();
    if (current.length <= 1) return;
    const confirmed = await this.confirmDialog.confirm(
      this.i18n.t('confirmations.deleteElementTitle'),
      this.i18n.t('confirmations.deleteElementFromLayoutMessage')
    );
    if (!confirmed) return;
    const remaining = current.filter(e => e.instanceId !== id);
    this.elements.set(remaining);
    this.selectedElement.set(remaining[0].instanceId);
  }

  // ── Canvas preview helpers ─────────────────────────────────────────────────

  /**
   * Coordinates text style class for the report configuration workflow.
   */
  textStyleClass(style: TextPresetStyle | undefined): string {
    return style ? `canvas-text--${style}` : 'canvas-text--normal';
  }

  /**
   * Coordinates image border radius for the report configuration workflow.
   */
  imageBorderRadius(shape: string | undefined): string {
    if (shape === 'circle')  return '50%';
    if (shape === 'rounded') return '12px';
    return '4px';
  }

  /**
   * Coordinates button border radius for the report configuration workflow.
   */
  buttonBorderRadius(shape: string | undefined): string {
    return shape === 'rounded' ? '9999px' : '4px';
  }

  // ── Save ───────────────────────────────────────────────────────────────────

  /**
   * Saves layout for the report configuration workflow.
   */
  saveLayout(): void {
    const cfg = this.config();
    const sel = this.selectedElementData();
    this.saved.emit({
      ...cfg,
      templateMode: false,
      templateVariant: 'block',
      selectedSlot: sel?.slotId ?? 'title',
      activeTab: this.activeTab(),
      slots: { ...this.slotMap() },
      canvasLayout: {
        containerWidth:  this.containerWidth(),
        containerHeight: this.containerHeight(),
        elements:        this.elements().map(e => ({ ...e })),
      },
    });
  }
}
