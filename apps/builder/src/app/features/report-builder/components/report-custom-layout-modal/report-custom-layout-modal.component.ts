import { ChangeDetectionStrategy, Component, effect, input, output, signal, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { ReportBuilderColumn } from '@builder/features/report-builder/facades/report-builder.facade';
import {
  QuickViewSlotAlign,
  QuickViewSlotStyles,
  QuickViewCustomSlot,
  QuickViewCustomTab,
  ReportQuickViewCustomLayout,
} from '@builder/features/report-builder/models/report-builder.models';
import { QoIconComponent, QoButtonComponent,
  QoColorPickerComponent,
  QoInputComponent,
  QoSelectComponent,
  SelectOption, } from '@qo/ui-components';

import {
  REPORT_COLOR_SURFACE,
  REPORT_COLOR_TEXT_PRIMARY,
  REPORT_COLOR_TEXT_BODY,
  REPORT_COLOR_TEXT_META,
  normalizeNumber,
  normalizeColor,
  createDefaultSingleSlotStyle,
  createDefaultSlotStyles,
  normalizeSlotStyles,
  getDefaultSlotLabel,
} from './report-custom-layout.model';

type ImageShape = 'square' | 'circle' | 'full';

type LayoutModalForm = FormGroup<{
  selectedSlot: FormControl<QuickViewCustomSlot>;
  activeTab: FormControl<QuickViewCustomTab>;
  imageField: FormControl<string>;
  titleField: FormControl<string>;
  bodyField: FormControl<string>;
  metaLeftField: FormControl<string>;
  metaRightField: FormControl<string>;
  cardBackgroundColor: FormControl<string>;
  titleColor: FormControl<string>;
  titleFontSize: FormControl<number>;
  titleFontWeight: FormControl<number>;
  bodyColor: FormControl<string>;
  bodyFontSize: FormControl<number>;
  metaColor: FormControl<string>;
  metaFontSize: FormControl<number>;
  imageShape: FormControl<ImageShape>;
  cardPaddingTop: FormControl<number>;
  cardPaddingRight: FormControl<number>;
  cardPaddingBottom: FormControl<number>;
  cardPaddingLeft: FormControl<number>;
  slotStyles: FormControl<Record<QuickViewCustomSlot, QuickViewSlotStyles>>;
}>;

import { ReportBuilderI18nService } from '../../services/report-builder-i18n.service';
@Component({
  selector: 'app-report-custom-layout-modal',
  standalone: true,
  imports: [QoIconComponent, 
    ReactiveFormsModule,
    QoButtonComponent,
    QoColorPickerComponent,
    QoInputComponent,
    QoSelectComponent,
  ],
  templateUrl: './report-custom-layout-modal.component.html',
  styleUrl: './report-custom-layout-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportCustomLayoutModalComponent {
  private readonly i18n = inject(ReportBuilderI18nService);
  protected readonly t = this.i18n.t.bind(this.i18n);
  protected readonly common = this.i18n.common.bind(this.i18n);
  /** Slot rows shown in the template list (typed so templates avoid `$any`). */
  readonly slotRows: QuickViewCustomSlot[] = ['title', 'meta_left', 'meta_right', 'body', 'image'];
  readonly allColumns = input<ReportBuilderColumn[]>([]);
  readonly config = input.required<ReportQuickViewCustomLayout>();
  readonly templateMode = input<boolean>(false);
  readonly templateVariant = input<'block' | 'list'>('block');

  readonly closed = output<void>();
  readonly saved = output<ReportQuickViewCustomLayout>();
  readonly alignOptions: SelectOption[] = [
    { value: 'left', label: this.i18n.t('options.left') },
    { value: 'center', label: this.i18n.t('options.center') },
    { value: 'right', label: this.i18n.t('options.right') },
  ];
  readonly imageShapeOptions: SelectOption[] = [
    { value: 'square', label: this.i18n.t('options.square') },
    { value: 'circle', label: this.i18n.t('options.circle') },
    { value: 'full', label: this.i18n.t('options.full') },
  ];
  readonly titleWeightOptions: SelectOption[] = [
    { value: 400, label: this.i18n.t('options.regular') },
    { value: 500, label: this.i18n.t('options.medium') },
    { value: 600, label: this.i18n.t('options.semibold') },
    { value: 700, label: this.i18n.t('options.bold') },
  ];
  readonly displayOptionOptions: SelectOption[] = [
    { value: 'default', label: this.i18n.t('options.default') },
    { value: 'day_of_month', label: this.i18n.t('options.dayOfMonth') },
  ];

  readonly form: LayoutModalForm = new FormGroup({
    selectedSlot: new FormControl<QuickViewCustomSlot>('title', {
      nonNullable: true,
    }),
    activeTab: new FormControl<QuickViewCustomTab>('display', {
      nonNullable: true,
    }),
    imageField: new FormControl<string>('', { nonNullable: true }),
    titleField: new FormControl<string>('', { nonNullable: true }),
    bodyField: new FormControl<string>('', { nonNullable: true }),
    metaLeftField: new FormControl<string>('', { nonNullable: true }),
    metaRightField: new FormControl<string>('', { nonNullable: true }),
    cardBackgroundColor: new FormControl<string>(REPORT_COLOR_SURFACE, {
      nonNullable: true,
    }),
    titleColor: new FormControl<string>(REPORT_COLOR_TEXT_PRIMARY, {
      nonNullable: true,
    }),
    titleFontSize: new FormControl<number>(24, {
      nonNullable: true,
    }),
    titleFontWeight: new FormControl<number>(600, {
      nonNullable: true,
    }),
    bodyColor: new FormControl<string>(REPORT_COLOR_TEXT_BODY, {
      nonNullable: true,
    }),
    bodyFontSize: new FormControl<number>(16, {
      nonNullable: true,
    }),
    metaColor: new FormControl<string>(REPORT_COLOR_TEXT_META, {
      nonNullable: true,
    }),
    metaFontSize: new FormControl<number>(14, {
      nonNullable: true,
    }),
    imageShape: new FormControl<ImageShape>('square', {
      nonNullable: true,
    }),
    cardPaddingTop: new FormControl<number>(16, { nonNullable: true }),
    cardPaddingRight: new FormControl<number>(16, { nonNullable: true }),
    cardPaddingBottom: new FormControl<number>(16, { nonNullable: true }),
    cardPaddingLeft: new FormControl<number>(16, { nonNullable: true }),
    slotStyles: new FormControl<Record<QuickViewCustomSlot, QuickViewSlotStyles>>(
      createDefaultSlotStyles(),
      { nonNullable: true }
    ),
  });

  readonly selectedSlot = signal<QuickViewCustomSlot>('title');
  readonly activeTab = signal<QuickViewCustomTab>('display');
  private hasHydrated = false;

  /**
   * Coordinates get selected slot field for the report configuration workflow.
   */
  getSelectedSlotField(): string {
    switch (this.selectedSlot()) {
      case 'image':
        return this.form.controls.imageField.value;
      case 'title':
        return this.form.controls.titleField.value;
      case 'body':
        return this.form.controls.bodyField.value;
      case 'meta_left':
        return this.form.controls.metaLeftField.value;
      case 'meta_right':
        return this.form.controls.metaRightField.value;
      default:
        return '';
    }
  }

  /**
   * Initializes report custom layout modal component and wires its reactive state.
   */
  constructor() {
    effect(
      () => {
        if (this.hasHydrated) {
          return;
        }

        const config = this.config();

        this.form.setValue(
          {
            selectedSlot: 'title',
            activeTab: 'display',
            imageField: config.slots.image,
            titleField: config.slots.title,
            bodyField: config.slots.body,
            metaLeftField: config.slots.meta_left,
            metaRightField: config.slots.meta_right,
            cardBackgroundColor: normalizeColor(config.styles.cardBackgroundColor, REPORT_COLOR_SURFACE),
            titleColor: normalizeColor(config.styles.titleColor, REPORT_COLOR_TEXT_PRIMARY),
            titleFontSize: normalizeNumber(config.styles.titleFontSize, 24),
            titleFontWeight: normalizeNumber(config.styles.titleFontWeight, 600),
            bodyColor: normalizeColor(config.styles.bodyColor, REPORT_COLOR_TEXT_BODY),
            bodyFontSize: normalizeNumber(config.styles.bodyFontSize, 16),
            metaColor: normalizeColor(config.styles.metaColor, REPORT_COLOR_TEXT_META),
            metaFontSize: normalizeNumber(config.styles.metaFontSize, 14),
            imageShape: config.styles.imageShape,
            cardPaddingTop: normalizeNumber(config.styles.cardPadding?.top, 16),
            cardPaddingRight: normalizeNumber(config.styles.cardPadding?.right, 16),
            cardPaddingBottom: normalizeNumber(config.styles.cardPadding?.bottom, 16),
            cardPaddingLeft: normalizeNumber(config.styles.cardPadding?.left, 16),
            slotStyles: normalizeSlotStyles(config.styles.slotStyles),
          },
          { emitEvent: false }
        );

        this.selectedSlot.set('title');
        this.activeTab.set('display');
        this.hasHydrated = true;
      },
      { allowSignalWrites: true }
    );
  }

  /**
   * Closes the modal and emits the close event.
   */
  close(): void {
    this.closed.emit();
  }

  /**
   * Saves save back into the report configuration.
   */
  save(): void {
    const value = this.form.getRawValue();
    const nextStyles = {
      cardBackgroundColor: value.cardBackgroundColor,
      cardPadding: {
        top: value.cardPaddingTop,
        right: value.cardPaddingRight,
        bottom: value.cardPaddingBottom,
        left: value.cardPaddingLeft,
      },
      slotStyles: value.slotStyles,
      titleColor: value.titleColor,
      titleFontSize: value.titleFontSize,
      titleFontWeight: value.titleFontWeight,
      bodyColor: value.bodyColor,
      bodyFontSize: value.bodyFontSize,
      metaColor: value.metaColor,
      metaFontSize: value.metaFontSize,
      imageShape: value.imageShape,
    };

    this.saved.emit({
      templateMode: this.templateMode(),
      templateVariant: this.templateMode() ? this.templateVariant() : 'block',
      selectedSlot: value.selectedSlot,
      activeTab: value.activeTab,
      slots: {
        image: value.imageField,
        title: value.titleField,
        body: value.bodyField,
        meta_left: value.metaLeftField,
        meta_right: value.metaRightField,
      },
      styles: nextStyles,
    });
  }

  /**
   * Coordinates get selected slot align for the report configuration workflow.
   */
  getSelectedSlotAlign(): QuickViewSlotAlign {
    return this.getSelectedSlotStyle().align;
  }

  /**
   * Coordinates get selected slot background color for the report configuration workflow.
   */
  getSelectedSlotBackgroundColor(): string {
    return this.getSelectedSlotStyle().backgroundColor;
  }

  /**
   * Coordinates get selected slot padding for the report configuration workflow.
   */
  getSelectedSlotPadding(side: 'top' | 'right' | 'bottom' | 'left'): number {
    return this.getSelectedSlotStyle().padding[side];
  }

  /**
   * Coordinates get card preview style for the report configuration workflow.
   */
  getCardPreviewStyle(): Record<string, string> {
    return {
      background: this.form.controls.cardBackgroundColor.value,
      padding: `${this.form.controls.cardPaddingTop.value}px ${this.form.controls.cardPaddingRight.value}px ${this.form.controls.cardPaddingBottom.value}px ${this.form.controls.cardPaddingLeft.value}px`,
    };
  }

  /**
   * Coordinates get slot preview style for the report configuration workflow.
   */
  getSlotPreviewStyle(slot: QuickViewCustomSlot): Record<string, string | number> {
    const style = this.form.controls.slotStyles.value[slot] ?? createDefaultSingleSlotStyle();
    return {
      textAlign: style.align,
      background: style.backgroundColor,
      padding: `${style.padding.top}px ${style.padding.right}px ${style.padding.bottom}px ${style.padding.left}px`,
      color: this.getSlotTextColor(slot),
      fontSize: `${this.getSlotFontSize(slot)}px`,
      fontWeight: this.getSlotFontWeight(slot),
    };
  }

  /**
   * Coordinates get slot field options for the report configuration workflow.
   */
  getSlotFieldOptions(): SelectOption[] {
    return [
      { value: '', label: this.i18n.t('common.none') },
      ...this.getSlotCandidates().map((column) => ({
        value: column.id,
        label: column.label,
      })),
    ];
  }

  /**
   * Coordinates on selected slot align change for the report configuration workflow.
   */
  onSelectedSlotAlignChange(value: string | number): void {
    const align = value as QuickViewSlotAlign | undefined;
    if (!align) {
      return;
    }

    this.updateSelectedSlotStyle((style) => ({ ...style, align }));
  }

  /**
   * Coordinates on selected slot background color change for the report configuration workflow.
   */
  onSelectedSlotBackgroundColorChange(value: string | null): void {
    this.updateSelectedSlotStyle((style) => ({
      ...style,
      backgroundColor: value ?? style.backgroundColor,
    }));
  }

  /**
   * Coordinates on selected slot padding change for the report configuration workflow.
   */
  onSelectedSlotPaddingChange(
    side: 'top' | 'right' | 'bottom' | 'left',
    value: string | number
  ): void {
    const nextValue = Number(value ?? 0);

    this.updateSelectedSlotStyle((style) => ({
      ...style,
      padding: {
        ...style.padding,
        [side]: Number.isFinite(nextValue) ? nextValue : style.padding[side],
      },
    }));
  }

  /**
   * Sets slot for the report configuration workflow.
   */
  setSlot(slot: QuickViewCustomSlot): void {
    this.selectedSlot.set(slot);
    this.form.controls.selectedSlot.setValue(slot);
  }

  /**
   * Sets tab for the report configuration workflow.
   */
  setTab(tab: QuickViewCustomTab): void {
    this.activeTab.set(tab);
    this.form.controls.activeTab.setValue(tab);
  }

  /**
   * Sets selected slot field for the report configuration workflow.
   */
  setSelectedSlotField(columnId: string): void {
    switch (this.selectedSlot()) {
      case 'image':
        this.form.controls.imageField.setValue(columnId);
        break;
      case 'title':
        this.form.controls.titleField.setValue(columnId);
        break;
      case 'body':
        this.form.controls.bodyField.setValue(columnId);
        break;
      case 'meta_left':
        this.form.controls.metaLeftField.setValue(columnId);
        break;
      case 'meta_right':
        this.form.controls.metaRightField.setValue(columnId);
        break;
    }
  }

  /**
   * Coordinates on selected slot field change for the report configuration workflow.
   */
  onSelectedSlotFieldChange(value: string | number): void {
    this.setSelectedSlotField(String(value ?? ''));
  }

  /**
   * Coordinates get slot label for the report configuration workflow.
   */
  getSlotLabel(slot: QuickViewCustomSlot): string {
    const column = this.allColumns().find((item) => item.id === this.getFieldForSlot(slot));
    return column?.label ?? getDefaultSlotLabel(slot);
  }

  /**
   * Coordinates get slot candidates for the report configuration workflow.
   */
  getSlotCandidates(): ReportBuilderColumn[] {
    if (this.selectedSlot() === 'image') {
      const imageColumns = this.allColumns().filter((column) =>
        ['image', 'photo', 'file'].some((term) =>
          `${column.fieldType} ${column.label}`.toLowerCase().includes(term)
        )
      );
      return imageColumns.length > 0 ? imageColumns : this.allColumns();
    }

    return this.allColumns();
  }

  /**
   * Coordinates get selected slot style for the report configuration workflow.
   */
  private getSelectedSlotStyle(): QuickViewSlotStyles {
    const slotStyles = this.form.controls.slotStyles.value;
    return (
      slotStyles[this.selectedSlot()] ??
      createDefaultSingleSlotStyle()
    );
  }

  /**
   * Coordinates get slot text color for the report configuration workflow.
   */
  private getSlotTextColor(slot: QuickViewCustomSlot): string {
    if (slot === 'title') {
      return this.form.controls.titleColor.value;
    }
    if (slot === 'body') {
      return this.form.controls.bodyColor.value;
    }
    if (slot === 'meta_left' || slot === 'meta_right') {
      return this.form.controls.metaColor.value;
    }
    return REPORT_COLOR_TEXT_META;
  }

  /**
   * Coordinates get slot font size for the report configuration workflow.
   */
  private getSlotFontSize(slot: QuickViewCustomSlot): number {
    if (slot === 'title') {
      return this.form.controls.titleFontSize.value;
    }
    if (slot === 'body') {
      return this.form.controls.bodyFontSize.value;
    }
    if (slot === 'meta_left' || slot === 'meta_right') {
      return this.form.controls.metaFontSize.value;
    }
    return 14;
  }

  /**
   * Coordinates get slot font weight for the report configuration workflow.
   */
  private getSlotFontWeight(slot: QuickViewCustomSlot): number {
    return slot === 'title' ? this.form.controls.titleFontWeight.value : 500;
  }

  /**
   * Updates selected slot style for the report configuration workflow.
   */
  private updateSelectedSlotStyle(
    mutator: (style: QuickViewSlotStyles) => QuickViewSlotStyles
  ): void {
    const slot = this.selectedSlot();
    const slotStyles = this.form.controls.slotStyles.value;
    const current = slotStyles[slot] ?? createDefaultSingleSlotStyle();

    this.form.controls.slotStyles.setValue({
      ...slotStyles,
      [slot]: mutator(current),
    });
  }

  /**
   * Coordinates get field for slot for the report configuration workflow.
   */
  private getFieldForSlot(slot: QuickViewCustomSlot): string {
    switch (slot) {
      case 'image':
        return this.form.controls.imageField.value;
      case 'title':
        return this.form.controls.titleField.value;
      case 'body':
        return this.form.controls.bodyField.value;
      case 'meta_left':
        return this.form.controls.metaLeftField.value;
      case 'meta_right':
        return this.form.controls.metaRightField.value;
      default:
        return '';
    }
  }

}
