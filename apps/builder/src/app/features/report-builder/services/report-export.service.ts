import { Injectable, inject } from '@angular/core';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ReportBuilderColumn } from '@builder/features/report-builder/facades/report-builder.facade';
import { PreviewRecord } from '../models/report-builder.models';
import { ReportBuilderI18nService } from './report-builder-i18n.service';

export interface ExportField {
  label: string;
  value: string | number | boolean | null | undefined;
}

/**
 * Exports report preview data to downloadable files (CSV, XLSX-as-XML, PDF) and
 * a per-record detail PDF. Pure client-side generation via Blobs / jsPDF.
 */
@Injectable({ providedIn: 'root' })
export class ReportExportService {
  private readonly i18n = inject(ReportBuilderI18nService);

  /** Exports the rows/columns as a UTF-8 CSV download. */
  exportCsv(columns: ReportBuilderColumn[], rows: PreviewRecord[], reportName: string): void {
    const header = columns.map(col => this.escapeCsv(col.label)).join(',');
    const body = rows.map(row =>
      columns.map(col => this.escapeCsv(row.fields[col.id] ?? '')).join(',')
    );
    const content = [header, ...body].join('\r\n');
    const blob = new Blob([`﻿${content}`], { type: 'text/csv;charset=utf-8;' });
    this.triggerDownload(blob, `${this.toFileBaseName(reportName)}.csv`);
  }

  /** Exports the rows/columns as an Excel-compatible SpreadsheetML (.xlsx) download. */
  exportXlsx(columns: ReportBuilderColumn[], rows: PreviewRecord[], reportName: string): void {
    const headerCells = columns
      .map(col => `<Cell><Data ss:Type="String">${this.escapeXml(col.label)}</Data></Cell>`)
      .join('');
    const worksheetRows = rows
      .map(row => {
        const cells = columns
          .map(col => `<Cell><Data ss:Type="String">${this.escapeXml(row.fields[col.id] ?? '')}</Data></Cell>`)
          .join('');
        return `<Row>${cells}</Row>`;
      })
      .join('');

    const xml = `<?xml version="1.0"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Worksheet ss:Name="Report">
  <Table>
   <Row>${headerCells}</Row>
   ${worksheetRows}
  </Table>
 </Worksheet>
</Workbook>`;

    const blob = new Blob([xml], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8;',
    });
    this.triggerDownload(blob, `${this.toFileBaseName(reportName)}.xlsx`);
  }

  /** Exports the rows/columns as a tabular PDF (auto landscape for wide tables). */
  exportPdf(columns: ReportBuilderColumn[], rows: PreviewRecord[], reportName: string): void {
    const doc = new jsPDF({
      orientation: columns.length > 8 ? 'landscape' : 'portrait',
      unit: 'pt',
      format: 'a4',
    });
    const generatedAt = new Date().toLocaleString();
    doc.setFontSize(16);
    doc.text(reportName || 'Report', 40, 40);
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text(`Generated: ${generatedAt}`, 40, 58);
    autoTable(doc, {
      startY: 72,
      head: [columns.map(col => col.label)],
      body: rows.map(row => columns.map(col => String(row.fields[col.id] ?? ''))),
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 4, overflow: 'linebreak' },
      headStyles: { fillColor: [243, 244, 246], textColor: [17, 24, 39], fontStyle: 'bold' },
      margin: { top: 72, left: 30, right: 30, bottom: 30 },
    });
    doc.save(`${this.toFileBaseName(reportName)}.pdf`);
  }

  /** Exports a single record's field/value pairs as a detail PDF. */
  exportDetailRowPdf(fields: ExportField[], reportName: string, rowId: number): void {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    const generatedAt = new Date().toLocaleString();
    doc.setFontSize(16);
    const reportTitle = reportName || this.i18n.t('export.reportFallback');
    doc.text(this.i18n.t('export.recordDetailsTitle', { name: reportTitle }), 40, 40);
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text(this.i18n.t('export.generatedAt', { date: generatedAt }), 40, 58);
    autoTable(doc, {
      startY: 72,
      head: [[this.i18n.t('export.fieldColumn'), this.i18n.t('export.valueColumn')]],
      body: fields.map(f => [f.label, String(f.value ?? '-')]),
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 4, overflow: 'linebreak' },
      headStyles: { fillColor: [243, 244, 246], textColor: [17, 24, 39], fontStyle: 'bold' },
      margin: { top: 72, left: 30, right: 30, bottom: 30 },
    });
    doc.save(`${this.toFileBaseName(reportName)}-record-${rowId}.pdf`);
  }

  /** Quotes/escapes a value for safe CSV output. */
  private escapeCsv(value: unknown): string {
    const text = String(value ?? '');
    return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  }

  /** Escapes XML special characters for SpreadsheetML output. */
  private escapeXml(value: unknown): string {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /** Triggers a browser download for a generated blob. */
  private triggerDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  /** Slugifies a report name into a safe file base name. */
  private toFileBaseName(name: string): string {
    return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'report_export';
  }
}
