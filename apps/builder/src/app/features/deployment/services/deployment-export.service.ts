import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { type PreviewDataset } from '../models/deployment.models';

@Injectable({ providedIn: 'root' })
export class DeploymentExportService {
  private readonly document = inject(DOCUMENT);

  exportCsv(dataset: PreviewDataset, filename: string): void {
    const header = dataset.columns.map((c) => this.toCsvCell(c)).join(',');
    const body = dataset.rows.map((row) => row.map((cell) => this.toCsvCell(cell)).join(','));
    const csv = '﻿' + [header, ...body].join('\r\n');
    this.downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), `${filename}.csv`);
  }

  exportJson(dataset: PreviewDataset, filename: string): void {
    const records = dataset.rows.map((row) =>
      Object.fromEntries(dataset.columns.map((col, i) => [col, row[i] ?? '']))
    );
    this.downloadBlob(
      new Blob([JSON.stringify(records, null, 2)], { type: 'application/json' }),
      `${filename}.json`
    );
  }

  exportPdf(dataset: PreviewDataset, filename: string, title: string): Promise<void> {
    return import('jspdf').then(({ jsPDF }) =>
      import('jspdf-autotable').then(({ default: autoTable }) => {
        const orientation = dataset.columns.length > 5 ? 'landscape' : 'portrait';
        const doc = new jsPDF({ orientation });
        doc.setFontSize(13);
        doc.text(title, 14, 16);
        autoTable(doc, {
          head: [dataset.columns],
          body: dataset.rows,
          startY: 22,
          styles: { fontSize: 8, cellPadding: 3 },
          headStyles: { fillColor: [30, 41, 59], textColor: 255, fontStyle: 'bold' },
          alternateRowStyles: { fillColor: [248, 250, 252] },
        });
        doc.save(`${filename}.pdf`);
      })
    );
  }

  private toCsvCell(value: string): string {
    return `"${String(value ?? '').replace(/"/g, '""')}"`;
  }

  private downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const anchor = this.document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }
}
