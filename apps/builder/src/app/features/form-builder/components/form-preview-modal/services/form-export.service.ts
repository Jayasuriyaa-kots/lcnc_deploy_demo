import { inject, Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

import { BuilderField } from '@builder/features/form-builder/models/form-builder.models';
import { FormBuilderI18nService } from '@builder/features/form-builder/services/form-builder-i18n.service';

@Injectable({ providedIn: 'root' })
export class FormExportService {
  private readonly i18n = inject(FormBuilderI18nService);

  buildExportFileName(formName: string, extension: 'csv' | 'pdf'): string {
    const fallback = this.i18n.t('export.defaultSlug');
    const safeName = (formName || fallback)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    return `${safeName || fallback}.${extension}`;
  }

  buildCsv(fields: BuilderField[], values: Record<string, unknown>): string {
    const headers = fields.map((field) => this.escapeCsv(field.label));
    const row = fields.map((field) => this.escapeCsv(this.stringifyValue(values[field.id])));
    return [headers.join(','), row.join(',')].join('\n');
  }

  buildPdfRows(fields: BuilderField[], values: Record<string, unknown>): Array<[string, string]> {
    return fields.map((field) => [field.label, this.stringifyValue(values[field.id])]);
  }

  buildPdfDocument(formName: string, fields: BuilderField[], values: Record<string, unknown>): jsPDF {
    const title = (formName || this.i18n.t('export.defaultTitle')).trim();
    const generatedAt = new Date().toLocaleString();
    const rows = this.buildPdfRows(fields, values);

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4'
    });

    doc.setFontSize(16);
    doc.text(title, 40, 40);
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text(`${this.i18n.t('export.generatedLabel')}: ${generatedAt}`, 40, 58);
    doc.setTextColor(0, 0, 0);

    autoTable(doc, {
      startY: 72,
      head: [['Field', 'Value']],
      body: rows,
      theme: 'grid',
      styles: {
        fontSize: 9,
        cellPadding: 4,
        overflow: 'linebreak'
      },
      headStyles: {
        fillColor: [243, 244, 246],
        textColor: [17, 24, 39],
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 180 },
        1: { cellWidth: 'auto' }
      },
      margin: { top: 72, left: 30, right: 30, bottom: 30 }
    });

    return doc;
  }

  savePdf(formName: string, fields: BuilderField[], values: Record<string, unknown>): void {
    const doc = this.buildPdfDocument(formName, fields, values);
    doc.save(this.buildExportFileName(formName, 'pdf'));
  }

  private stringifyValue(value: unknown): string {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    if (value && typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value ?? '');
  }

  private escapeCsv(value: string): string {
    return `"${value.replace(/"/g, '""')}"`;
  }
}
