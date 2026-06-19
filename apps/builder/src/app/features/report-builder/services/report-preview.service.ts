import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { ReportBuilderFacade } from '@builder/features/report-builder/facades/report-builder.facade';
import { PreviewRecord } from '@builder/features/report-builder/models/report-builder.models';

/**
 * Component-scoped service owning the center list/card preview paging and the
 * active detail row. Provide it in the host component's `providers` array.
 *
 * State lives here (per Frontend Guide §9); derived values use `computed()` and
 * never duplicate a source signal. Reads report data through the root facade.
 */
@Injectable()
export class ReportPreviewService {
  private readonly facade = inject(ReportBuilderFacade);

  /** Full, unpaged preview record set for the selected report. */
  readonly records = computed<PreviewRecord[]>(() =>
    this.facade.buildPreviewRecords(this.facade.selectedReport())
  );

  /** Page size coerced to a positive integer (defaults to 20). */
  readonly pageSizeNumber = computed<number>(() => {
    const parsed = Number(this.facade.previewPageSize());
    return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 20;
  });

  readonly currentPage = signal<number>(1);

  readonly totalPages = computed<number>(() =>
    Math.max(1, Math.ceil(this.records().length / this.pageSizeNumber()))
  );

  readonly pagedRecords = computed<PreviewRecord[]>(() => {
    const pageSize = this.pageSizeNumber();
    const page = Math.min(this.currentPage(), this.totalPages());
    const start = (page - 1) * pageSize;
    return this.records().slice(start, start + pageSize);
  });

  readonly rangeStart = computed<number>(() => {
    const total = this.records().length;
    if (!total) {
      return 0;
    }
    return (Math.min(this.currentPage(), this.totalPages()) - 1) * this.pageSizeNumber() + 1;
  });

  readonly rangeEnd = computed<number>(() =>
    Math.min(this.rangeStart() + this.pagedRecords().length - 1, this.records().length)
  );

  /** Index (into `records`) of the row whose detail view is open, or null. */
  readonly activeRowIndex = signal<number | null>(null);

  readonly activeRecord = computed<PreviewRecord | null>(() => {
    const rowIndex = this.activeRowIndex();
    return rowIndex === null ? null : this.records()[rowIndex] ?? null;
  });

  constructor() {
    // Keep the current page within bounds as the record set / page size changes.
    effect(
      () => {
        const totalPages = this.totalPages();
        const page = this.currentPage();
        if (page > totalPages) {
          this.currentPage.set(totalPages);
        } else if (page < 1) {
          this.currentPage.set(1);
        }
      },
      { allowSignalWrites: true }
    );
  }

  setPageSize(size: string): void {
    this.facade.setPreviewPageSize(size);
    this.currentPage.set(1);
  }

  nextPage(): void {
    const next = this.currentPage() + 1;
    if (next <= this.totalPages()) {
      this.currentPage.set(next);
    }
  }

  previousPage(): void {
    const previous = this.currentPage() - 1;
    if (previous >= 1) {
      this.currentPage.set(previous);
    }
  }

  toggleRow(index: number): void {
    this.activeRowIndex.set(index);
    this.facade.togglePreviewRow(index);
  }

  clearSelection(): void {
    this.activeRowIndex.set(null);
    this.facade.clearPreviewSelection();
  }
}
