import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MockSchemaService } from '@builder/core/services/mock-schema.service';
import { injectPageBuilderTranslate } from '@builder/features/page-builder/services/page-builder-i18n.service';
import { PageBuilderReportMockService } from '@builder/features/page-builder/services/page-builder-report-mock.service';
import { ReportWidgetConfig, ReportWidgetRowPreview } from '@builder/features/page-builder/models/page-builder-canvas.model';
import { QoButtonComponent } from '@qo/ui-components';

@Component({
  selector: 'app-page-builder-report-preview-page',
  standalone: true,
  imports: [CommonModule, QoButtonComponent],
  templateUrl: './page-builder-report-preview-page.component.html',
  styleUrl: './page-builder-report-preview-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageBuilderReportPreviewPageComponent {
  protected readonly t = injectPageBuilderTranslate();
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly mockSchemaService = inject(MockSchemaService);
  private readonly reportMock = inject(PageBuilderReportMockService);

  readonly searchQuery = signal('');
  readonly reportId = computed(() => this.route.snapshot.queryParamMap.get('reportId') ?? '');
  readonly reportConfig = computed<ReportWidgetConfig | null>(() =>
    this.mockSchemaService.reportConfigs().find((config) => config.reportId === this.reportId()) ?? null,
  );
  readonly rows = computed<ReportWidgetRowPreview[]>(() => {
    const reportConfig = this.reportConfig();
    return reportConfig ? this.reportMock.getRows(reportConfig) : [];
  });

  getRows(): ReportWidgetRowPreview[] {
    const query = this.searchQuery().trim().toLowerCase();
    if (!query) {
      return this.rows();
    }

    return this.rows().filter((row) => row.values.some((value) => value.toLowerCase().includes(query)));
  }

  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.searchQuery.set(target?.value ?? '');
  }

  printReport(reportConfig: ReportWidgetConfig): void {
    const rows = this.getRows();
    const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=960,height=720');

    if (!printWindow) {
      return;
    }

    printWindow.document.write(this.buildPrintableReportMarkup(reportConfig, rows));
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }

  exportReport(reportConfig: ReportWidgetConfig): void {
    const rows = this.getRows();
    const csvLines = [
      reportConfig.columns.map((column) => this.escapeCsvValue(column.label)).join(','),
      ...rows.map((row) => row.values.map((value) => this.escapeCsvValue(value)).join(',')),
    ];
    const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `${this.slugifyReportLabel(reportConfig.reportLabel)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  closeTab(): void {
    const pageId = this.route.snapshot.queryParamMap.get('page')?.trim() ?? '';
    const previewMode = this.route.snapshot.queryParamMap.get('preview')?.trim() ?? '';
    const returnTo = this.route.snapshot.queryParamMap.get('returnTo')?.trim() ?? '';

    if (window.opener) {
      window.close();
      return;
    }

    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    if (returnTo) {
      window.location.assign(returnTo);
      return;
    }

    if (pageId) {
      void this.router.navigate(['/page-builder/preview'], {
        queryParams: {
          page: pageId,
          ...(previewMode ? { preview: previewMode } : {}),
        },
      });
      return;
    }

    void this.router.navigate(['/page-builder']);
  }

  private buildPrintableReportMarkup(reportConfig: ReportWidgetConfig, rows: ReportWidgetRowPreview[]): string {
    const headCells = reportConfig.columns.map((column) => `<th>${this.escapeHtml(column.label)}</th>`).join('');
    const bodyRows = rows
      .map((row) => `<tr>${row.values.map((value) => `<td>${this.escapeHtml(value)}</td>`).join('')}</tr>`)
      .join('');

    return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${this.escapeHtml(reportConfig.reportLabel)}</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 24px; color: #111827; }
      h1 { font-size: 22px; margin: 0 0 8px; }
      p { margin: 0 0 18px; color: #6b7280; }
      table { width: 100%; border-collapse: collapse; }
      th, td { border: 1px solid #d1d5db; padding: 10px 12px; text-align: left; font-size: 14px; }
      th { background: #f3f4f6; font-weight: 700; }
    </style>
  </head>
  <body>
    <h1>${this.escapeHtml(reportConfig.reportLabel)}</h1>
    <p>${rows.length} ${this.escapeHtml(this.t('editCanvas.rowsSuffix'))}</p>
    <table>
      <thead><tr>${headCells}</tr></thead>
      <tbody>${bodyRows}</tbody>
    </table>
  </body>
</html>`;
  }

  private escapeHtml(value: string): string {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  private escapeCsvValue(value: string): string {
    return `"${value.replaceAll('"', '""')}"`;
  }

  private slugifyReportLabel(label: string): string {
    return label.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'report';
  }
}
