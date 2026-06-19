import { ChangeDetectionStrategy, Component, computed, input, output, inject } from '@angular/core';
import {
  ReportBuilderAsset,
  ReportBuilderColumn,
} from '@builder/features/report-builder/facades/report-builder.facade';
import {
  PreviewRecord,
  QuickViewCanvasElement,
  QuickLayout,
  QuickViewBoxPadding,
  QuickViewCustomSlot,
  QuickViewSlotStyles,
} from '@builder/features/report-builder/models/report-builder.models';
import { QoEmptyStateComponent, QoIconComponent, QoButtonComponent } from '@qo/ui-components';


const REPORT_COLOR_SURFACE = 'var(--qo-color-neutral-0)';

/**
 * Center preview pane of the report builder. Renders the report's rows as a list
 * or card grid (including the custom card variants) with grouping headers, a
 * toolbar, and pagination. Presentational — interactions are emitted as outputs.
 */
import { ReportBuilderI18nService } from '../../services/report-builder-i18n.service';
@Component({
  selector: 'app-report-center-preview',
  standalone: true,
  imports: [QoEmptyStateComponent, QoIconComponent, QoButtonComponent],
  templateUrl: './report-center-preview.component.html',
  styleUrl: './report-center-preview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportCenterPreviewComponent {
  private readonly i18n = inject(ReportBuilderI18nService);
  protected readonly t = this.i18n.t.bind(this.i18n);
  protected readonly common = this.i18n.common.bind(this.i18n);
  private readonly columnWidthMap: Record<ReportBuilderColumn['width'], number> = {
    Small: 140,
    Medium: 220,
    Large: 320,
  };

  readonly report = input.required<ReportBuilderAsset>();
  readonly visibleColumns = input.required<ReportBuilderColumn[]>();
  readonly quickLayout = input<QuickLayout>('list');
  readonly records = input.required<PreviewRecord[]>();
  readonly totalRecords = input<number>(0);
  readonly rangeStart = input<number>(0);
  readonly rangeEnd = input<number>(0);
  readonly currentPage = input<number>(1);
  readonly totalPages = input<number>(1);
  readonly previewSelection = input.required<number[]>();
  readonly selectedCount = input<number>(0);

  readonly viewTypeChange = output<'List View' | 'Card View'>();
  readonly toggleRow = output<number>();
  readonly clearSelection = output<void>();
  readonly openSearch = output<void>();
  readonly openFieldConfig = output<void>();
  readonly openBulkEdit = output<void>();
  readonly nextPage = output<void>();
  readonly previousPage = output<void>();

  /** Whether the report groups its rows by a field. */
  readonly hasGrouping = computed<boolean>(
    () => !!this.report().settings.groupBy
  );
  /** Card view rendering the user-designed custom layout. */
  readonly isCustomCardView = computed<boolean>(
    () => this.report().viewType === 'Card View' && this.quickLayout() === 'custom'
  );
  /** Custom layout built from a slot template (vs. the free-form canvas). */
  readonly isTemplateCustomCardView = computed<boolean>(
    () =>
      this.isCustomCardView() &&
      !!this.report().settings.quickViewCustomLayout.templateMode
  );
  /** The "list" template variant of the custom layout. */
  readonly isListTemplateCustomCardView = computed<boolean>(
    () =>
      this.isTemplateCustomCardView() &&
      (this.report().settings.quickViewCustomLayout.templateVariant ?? 'block') === 'list'
  );
  /** Custom layout drawn on the free-form canvas (has positioned elements). */
  readonly hasDesignedCanvasLayout = computed<boolean>(
    () =>
      this.isCustomCardView() &&
      !this.isTemplateCustomCardView() &&
      !!this.report().settings.quickViewCustomLayout.canvasLayout?.elements?.length
  );

  /** Whether a record is currently selected. */
  isPreviewRowSelected(recordId: number): boolean {
    return this.previewSelection().includes(recordId);
  }

  /** Whether a group header should render before the row at `rowIndex`. */
  shouldShowGroupHeader(rowIndex: number): boolean {
    if (!this.hasGrouping()) {
      return false;
    }

    const records = this.records();

    if (rowIndex === 0) {
      return true;
    }

    const currentGroup = records[rowIndex]?.groupLabel ?? '';
    const previousGroup = records[rowIndex - 1]?.groupLabel ?? '';

    return currentGroup !== previousGroup;
  }

  /** Number of records in a group. */
  getGroupCount(groupLabel: string): number {
    if (!this.hasGrouping()) {
      return 1;
    }

    return this.records().filter(
      (record) => record.groupLabel === groupLabel
    ).length;
  }

  /** Columns shown on a card (2 for card layout, else up to `limit`). */
  visibleCardColumns(limit = 5): ReportBuilderColumn[] {
    const resolvedLimit = this.quickLayout() === 'card' ? 2 : limit;
    return this.visibleColumns().slice(0, resolvedLimit);
  }

  /** First visible column shown as a card's heading. */
  cardPrimaryColumn(): ReportBuilderColumn | null {
    return this.visibleCardColumns(2)[0] ?? null;
  }

  /** Second visible column shown as a card's body line. */
  cardSecondaryColumn(): ReportBuilderColumn | null {
    return this.visibleCardColumns(2)[1] ?? null;
  }

  /** Stringified field value for a column on a row. */
  getCardFieldValue(row: PreviewRecord, column: ReportBuilderColumn | null): string {
    if (!column) {
      return '-';
    }

    return String(row.fields[column.id] ?? '-');
  }

  /** Field value bound to a custom-layout slot. */
  getCustomSlotValue(
    row: PreviewRecord,
    slot: QuickViewCustomSlot
  ): string {
    const columnId = this.report().settings.quickViewCustomLayout.slots[slot];
    if (!columnId) {
      return '';
    }

    return String(row.fields[columnId] ?? '');
  }

  /** Display label for a custom-layout slot (column label, else slot name). */
  getCustomSlotLabel(
    slot: QuickViewCustomSlot
  ): string {
    const columnId = this.report().settings.quickViewCustomLayout.slots[slot];
    if (!columnId) {
      return slot.replace('_', ' ').toUpperCase();
    }

    const column = this.report().columns.find((item) => item.id === columnId);
    return (column?.label ?? slot).toUpperCase();
  }

  /** Custom card background colour. */
  getCustomCardBackground(): string {
    return this.report().settings.quickViewCustomLayout.styles.cardBackgroundColor;
  }

  /** Inline style (background + padding) for a custom card. */
  getCustomCardStyle(): Record<string, string> {
    const styles = this.report().settings.quickViewCustomLayout.styles;
    const cardPadding = this.normalizePadding(styles.cardPadding);

    return {
      background: styles.cardBackgroundColor,
      padding: this.paddingToCss(cardPadding),
    };
  }

  /** Inline sizing style for the custom-layout canvas container. */
  getDesignerContainerStyle(): Record<string, string> {
    const layout = this.report().settings.quickViewCustomLayout.canvasLayout;
    const width = Math.max(260, Math.round(layout?.containerWidth ?? 420));
    const height = Math.max(160, Math.round(layout?.containerHeight ?? 220));
    return {
      width: '100%',
      maxWidth: `${width}px`,
      minHeight: `${height}px`,
      height: `${height}px`,
    };
  }

  /** Positioned elements drawn on the custom-layout canvas. */
  getDesignerElements(): QuickViewCanvasElement[] {
    return this.report().settings.quickViewCustomLayout.canvasLayout?.elements ?? [];
  }

  /** Resolves a canvas element's display text (bound field value, else label). */
  getDesignerElementText(row: PreviewRecord, element: QuickViewCanvasElement): string {
    const columnId = this.report().settings.quickViewCustomLayout.slots[element.slotId];
    if (columnId) {
      return String(row.fields[columnId] ?? element.label ?? '');
    }
    return element.label ?? '';
  }

  /** Inline style (align/background/padding) for a custom card slot. */
  getSlotStyle(slot: QuickViewCustomSlot): Record<string, string> {
    const style = this.getNormalizedSlotStyle(slot);

    return {
      'text-align': style.align,
      background: style.backgroundColor,
      padding: this.paddingToCss(style.padding),
    };
  }

  /** CSS modifier class for the configured image shape. */
  getImageShapeClass(): string {
    const shape = this.report().settings.quickViewCustomLayout.styles.imageShape;
    return `custom-card__image--${shape}`;
  }

  /** `track` fn for column loops. */
  trackColumn(_index: number, column: ReportBuilderColumn): string {
    return column.id;
  }

  /** `track` fn for row loops. */
  trackRow(_index: number, row: PreviewRecord): number {
    return row.id;
  }

  /** Inline style (width + alignment) for a list-view column. */
  getColumnStyle(column: ReportBuilderColumn): Record<string, string> {
    const width = this.columnWidthMap[column.width] ?? this.columnWidthMap.Medium;
    return {
      'text-align': column.alignment.toLowerCase(),
      width: `${width}px`,
      'min-width': `${width}px`,
    };
  }

  /** Resolves a slot's style with defaults applied. */
  private getNormalizedSlotStyle(slot: QuickViewCustomSlot): QuickViewSlotStyles {
    const slotStyles = this.report().settings.quickViewCustomLayout.styles.slotStyles;
    const fallbackPadding = this.createDefaultPadding(12);

    return {
      align: slotStyles?.[slot]?.align ?? 'left',
      backgroundColor: slotStyles?.[slot]?.backgroundColor ?? REPORT_COLOR_SURFACE,
      padding: this.normalizePadding(slotStyles?.[slot]?.padding ?? fallbackPadding),
    };
  }

  /** Coerces a partial padding to a full, non-negative padding (default 12). */
  private normalizePadding(
    padding: QuickViewBoxPadding | undefined
  ): QuickViewBoxPadding {
    return {
      top: Math.max(0, Number(padding?.top ?? 12)),
      right: Math.max(0, Number(padding?.right ?? 12)),
      bottom: Math.max(0, Number(padding?.bottom ?? 12)),
      left: Math.max(0, Number(padding?.left ?? 12)),
    };
  }

  /** Serialises a padding object to a CSS shorthand string. */
  private paddingToCss(padding: QuickViewBoxPadding): string {
    return `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`;
  }

  /** Builds a uniform padding object from a single value. */
  private createDefaultPadding(value: number): QuickViewBoxPadding {
    return {
      top: value,
      right: value,
      bottom: value,
      left: value,
    };
  }
}
