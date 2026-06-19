import type { FormPreviewMixinIndex } from '../form-preview-content.mixin-index';
import { Directive, inject } from '@angular/core';
import { BuilderAction, BuilderField } from '@builder/features/form-builder/models/form-builder.models';
import { FormPreviewRichTextService } from '@builder/features/form-builder/components/form-preview-modal/services/form-preview-rich-text.service';
import { FormPreviewSignatureService } from '@builder/features/form-builder/components/form-preview-modal/services/form-preview-signature.service';
import { FormPreviewContentMediaBase } from './form-preview-content-media-domain.base';

@Directive()
export abstract class FormPreviewContentRichTextBase extends FormPreviewContentMediaBase {
  [key: string]: FormPreviewMixinIndex;

  protected readonly richTextService = inject(FormPreviewRichTextService);
  protected readonly signatureService = inject(FormPreviewSignatureService);

  getRichTextHeight(field: BuilderField): number {
    const richTextProps = field.properties as unknown as Record<string, unknown>;
    const px = richTextProps['richTextHeightPx'] ?? field.properties.heightPx;
    return typeof px === 'number' ? Math.max(px, 140) : 180;
  }

  getRichTextToolbarOpt(field: BuilderField, key: string): boolean {
    const richTextProps = field.properties as unknown as Record<string, unknown>;
    const toolbar = richTextProps['richTextToolbar'];
    if (!toolbar || typeof toolbar !== 'object') {
      return [
        'undoRedo', 'bold', 'italic', 'underline', 'strikethrough', 'subscript', 'superscript',
        'code', 'paragraphStyle', 'fontOptions', 'alignment', 'indentation', 'textColor',
        'backgroundColor', 'link', 'orderedList', 'blockquote', 'table', 'codeView'
      ].includes(key);
    }
    return (toolbar as Record<string, unknown>)[key] !== false;
  }

  richTextCmdState(fieldId: string, cmd: string, value?: string): boolean {
    if (this._richTextState.fieldId !== fieldId) {
      return false;
    }
    if (cmd === 'formatBlock') {
      return !!this._richTextState.state.formatBlock && (value || 'blockquote') === 'blockquote';
    }
    return !!this._richTextState.state[cmd];
  }

  onRichTextSelectionInteraction(): void {
    this.updateRichTextStateFromSelection();
  }

  richTextCmd(event: Event, fieldId: string, cmd: string, value?: string): void {
    event.preventDefault();
    event.stopPropagation();
    this.restoreRichTextSelection(fieldId);
    this.execRichTextCommand(cmd, value);
    setTimeout(() => this.updateRichTextStateFromSelection());
  }

  richTextCmdLink(event: Event, fieldId: string): void {
    event.preventDefault();
    event.stopPropagation();
    this.restoreRichTextSelection(fieldId);
    this.richTextLinkEditorFieldId = fieldId;
    this.richTextLinkDraft = '';
    this.cdr.markForCheck();
  }

  saveRichTextLink(): void {
    const fieldId = this.richTextLinkEditorFieldId;
    const url = this.richTextLinkDraft.trim();
    if (fieldId && url) {
      this.restoreRichTextSelection(fieldId);
      this.execRichTextCommand('createLink', url);
      setTimeout(() => this.updateRichTextStateFromSelection());
    }
    this.closeRichTextLinkEditor();
  }

  closeRichTextLinkEditor(): void {
    this.richTextLinkEditorFieldId = null;
    this.richTextLinkDraft = '';
    this.cdr.markForCheck();
  }

  richTextFontSize(event: Event, fieldId: string): void {
    this.richTextFontSizeValue((event.target as HTMLSelectElement).value, fieldId);
  }

  richTextFontSizeValue(selectVal: string, fieldId: string): void {
    const pxMap: Record<string, number> = { '1': 10, '2': 12, '3': 14, '4': 16, '5': 18 };
    const px = pxMap[selectVal] ?? 14;
    this.insertStyledRichTextSpan(fieldId, { fontSize: `${px}px` });
  }

  richTextFontName(event: Event, fieldId: string): void {
    this.richTextFontNameValue((event.target as HTMLSelectElement).value, fieldId);
  }

  richTextFontNameValue(font: string, fieldId: string): void {
    if (font) {
      this.insertStyledRichTextSpan(fieldId, { fontFamily: font });
    }
  }

  richTextFormatBlock(event: Event, fieldId: string): void {
    this.richTextFormatBlockValue((event.target as HTMLSelectElement).value || 'p', fieldId);
  }

  richTextFormatBlockValue(tag: string, fieldId: string): void {
    this.restoreRichTextSelection(fieldId);
    this.execRichTextCommand('formatBlock', `<${tag.toLowerCase()}>`);
    setTimeout(() => this.updateRichTextStateFromSelection());
  }

  richTextInsertTable(event: Event, fieldId: string): void {
    event.preventDefault();
    event.stopPropagation();
    const tableHtml = '<table border="1" class="preview-rich-text__inserted-table"><tr><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td></tr></table>';
    if (this.restoreRichTextSelection(fieldId)) {
      this.execRichTextCommand('insertHTML', tableHtml);
    } else {
      this.findRichTextEditor(fieldId)?.insertAdjacentHTML('beforeend', tableHtml);
    }
    setTimeout(() => this.updateRichTextStateFromSelection());
  }

  getRichTextTextColor(): string {
    return 'rgb(17, 17, 17)';
  }

  getRichTextHighlightColor(): string {
    return 'yellow';
  }

  toggleRichTextCodeView(event: Event, fieldId: string): void {
    event.preventDefault();
    event.stopPropagation();
    const next = !this.richTextCodeView[fieldId];
    const editor = this.findRichTextEditor(fieldId);
    if (next && editor) {
      const field = this.fields.find((item) => item.id === fieldId);
      this.setValue(fieldId, this.sanitizeRichTextHtml(editor.innerHTML), field);
    }
    this.richTextCodeView = { ...this.richTextCodeView, [fieldId]: next };
    if (!next) {
      setTimeout(() => this.initRichTextEditorsContent());
    }
    this.cdr.markForCheck();
  }

  isRichTextCodeView(fieldId: string): boolean {
    return !!this.richTextCodeView[fieldId];
  }

  onRichTextCodeChange(fieldId: string, html: string): void {
    const field = this.fields.find((item) => item.id === fieldId);
    this.setValue(fieldId, this.sanitizeRichTextHtml(html ?? ''), field);
  }

  getRichTextHtml(fieldId: string): string {
    const value = this.values[fieldId];
    return value == null ? '' : String(value);
  }

  onRichTextInput(fieldId: string, event: Event): void {
    const target = event.target as HTMLElement;
    const field = this.fields.find((item) => item.id === fieldId);
    this.setValue(fieldId, this.sanitizeRichTextHtml(target.innerHTML ?? ''), field);
  }

  onRichTextBlur(fieldId: string): void {
    this.richTextActiveFieldId = null;
    const editor = this.findRichTextEditor(fieldId);
    if (editor) {
      const field = this.fields.find((item) => item.id === fieldId);
      this.setValue(fieldId, this.sanitizeRichTextHtml(editor.innerHTML || ''), field);
    }
  }

  protected initRichTextEditorsContent(): void {
    const root = this.previewRoot?.nativeElement;
    if (!root) {
      return;
    }
    root.querySelectorAll('.preview-rich-text__editor').forEach((element) => {
      const editor = element as HTMLElement;
      const fieldId = editor.getAttribute('data-field-id');
      if (!fieldId || this.document.activeElement === editor) {
        return;
      }
      const html = this.sanitizeRichTextHtml(this.getRichTextHtml(fieldId));
      const safeHtml = this.sanitizeRichTextHtml(html);
      if (editor.innerHTML !== safeHtml) {
        editor.innerHTML = safeHtml;
      }
    });
  }

  protected sanitizeRichTextHtml(html: string): string {
    return this.richTextService.sanitizeHtml(html);
  }

  protected drawSignatureGuides(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void {
    this.signatureService.drawSignatureGuides(canvas, ctx);
  }

  protected getSignaturePoint(event: MouseEvent | TouchEvent, canvas: HTMLCanvasElement): { x: number; y: number } | null {
    return this.signatureService.getSignaturePoint(event, canvas);
  }

protected updateRichTextStateFromSelection(): void {
    const selection = this.document.getSelection();
    const editor = this.findRichTextEditorFromNode(selection?.anchorNode);
    const fieldId = editor?.getAttribute('data-field-id');
    if (!selection || !editor || !fieldId) {
      return;
    }

    this.richTextActiveFieldId = fieldId;
    if (selection.rangeCount > 0) {
      this.lastRichTextSelection[fieldId] = selection.getRangeAt(0).cloneRange();
    }

    const doc = this.document as Document & {
      queryCommandState?: (commandId: string) => boolean;
      queryCommandValue?: (commandId: string) => string;
    };
    this._richTextState = {
      fieldId,
      state: {
        bold: !!doc.queryCommandState?.('bold'),
        italic: !!doc.queryCommandState?.('italic'),
        underline: !!doc.queryCommandState?.('underline'),
        strikethrough: !!doc.queryCommandState?.('strikethrough'),
        subscript: !!doc.queryCommandState?.('subscript'),
        superscript: !!doc.queryCommandState?.('superscript'),
        justifyLeft: !!doc.queryCommandState?.('justifyLeft'),
        justifyCenter: !!doc.queryCommandState?.('justifyCenter'),
        justifyRight: !!doc.queryCommandState?.('justifyRight'),
        justifyFull: !!doc.queryCommandState?.('justifyFull'),
        insertOrderedList: !!doc.queryCommandState?.('insertOrderedList'),
        insertUnorderedList: !!doc.queryCommandState?.('insertUnorderedList'),
        formatBlock: ['blockquote', 'pre'].includes((doc.queryCommandValue?.('formatBlock') || '').toLowerCase().replace(/[<>]/g, ''))
      }
    };
    this.cdr.markForCheck();
  }

  protected restoreRichTextSelection(fieldId: string): boolean {
    const editor = this.findRichTextEditor(fieldId);
    if (!editor) {
      return false;
    }
    editor.focus();
    const saved = this.lastRichTextSelection[fieldId];
    const selection = this.document.getSelection();
    if (!selection) {
      return false;
    }
    try {
      if (saved) {
        selection.removeAllRanges();
        selection.addRange(saved);
        return true;
      }
    } catch {
      // Fall back to placing the caret at the end of the editor.
    }
    const range = this.document.createRange();
    range.selectNodeContents(editor);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
    this.lastRichTextSelection[fieldId] = range.cloneRange();
    return true;
  }

  protected insertStyledRichTextSpan(fieldId: string, styles: Partial<CSSStyleDeclaration>): void {
    this.restoreRichTextSelection(fieldId);
    const span = this.document.createElement('span');
    Object.assign(span.style, styles);
    span.appendChild(this.document.createTextNode('\u200B'));
    this.execRichTextCommand('insertHTML', span.outerHTML);
    setTimeout(() => this.updateRichTextStateFromSelection());
  }

  protected execRichTextCommand(cmd: string, value?: string): void {
    (this.document as Document & { execCommand?: (commandId: string, showUI?: boolean, value?: string) => boolean }).execCommand?.(cmd, false, value);
  }

  protected findRichTextEditor(fieldId: string): HTMLElement | null {
    return this.previewRoot?.nativeElement.querySelector<HTMLElement>(
      `.preview-rich-text__editor[data-field-id="${fieldId}"]`
    ) ?? null;
  }

  protected findRichTextEditorFromNode(node: Node | null | undefined): HTMLElement | null {
    let editor = node?.nodeType === Node.ELEMENT_NODE ? node as HTMLElement : node?.parentElement ?? null;
    while (editor && !editor.classList?.contains('preview-rich-text__editor')) {
      editor = editor.parentElement;
    }
    return editor;
  }



// Clears the drawn signature and resets the field value.
  clearSignature(fieldId: string): void {
    const canvas = this.getSignatureCanvas(fieldId);
    const state = this.signatureDrawing[fieldId];
    if (canvas && state) {
      state.ctx.clearRect(0, 0, canvas.width, canvas.height);
      this.drawSignatureGuides(canvas, state.ctx);
    }
    const field = this.fields.find((item) => item.id === fieldId);
    this.setValue(fieldId, '', field);
  }

  // Starts drawing a signature from mouse/touch coordinates.
  onSignatureStart(event: MouseEvent | TouchEvent, fieldId: string): void {
    const canvas = this.getSignatureCanvas(fieldId);
    const state = this.signatureDrawing[fieldId];
    if (!canvas || !state) {
      return;
    }
    const point = this.getSignaturePoint(event, canvas);
    if (!point) {
      return;
    }
    event.preventDefault();
    state.drawing = true;
    state.lastX = point.x;
    state.lastY = point.y;
    state.ctx.beginPath();
    state.ctx.moveTo(point.x, point.y);
  }

  // Draws signature strokes and stores the canvas data URL.
  onSignatureMove(event: MouseEvent | TouchEvent, fieldId: string): void {
    const canvas = this.getSignatureCanvas(fieldId);
    const state = this.signatureDrawing[fieldId];
    if (!canvas || !state?.drawing) {
      return;
    }
    const point = this.getSignaturePoint(event, canvas);
    if (!point) {
      return;
    }
    event.preventDefault();
    state.ctx.lineTo(point.x, point.y);
    state.ctx.stroke();
    state.lastX = point.x;
    state.lastY = point.y;
    const data = canvas.toDataURL('image/png');
    const field = this.fields.find((item) => item.id === fieldId);
    this.setValue(fieldId, data, field);
  }

  // Ends the active signature stroke.
  onSignatureEnd(fieldId: string): void {
    const state = this.signatureDrawing[fieldId];
    if (state) {
      state.drawing = false;
      state.ctx.closePath();
    }
  }

// Converts primitive preview values into display text.
  getDisplayValue(fieldId: string): string {
    const value = this.values[fieldId];
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object' && value) return '';
    return typeof value === 'string' ? value : '';
  }

  // Returns the value string used by the rendered control.
  getControlValue(field: BuilderField): string {
    if (this.isNumericField(field)) {
      return this.getNumericDisplayValue(field);
    }
    return this.getDisplayValue(field.id);
  }

  // Formats numeric values only when the user is not actively editing.
  getNumericDisplayValue(field: BuilderField): string {
    const raw = this.getDisplayValue(field.id);
    if (!raw) {
      return '';
    }

    if (this.focusedFields[field.id]) {
      return raw;
    }

    const numeric = Number(raw.replace(/,/g, ''));
    if (Number.isNaN(numeric)) {
      return raw;
    }

    const originalFormat = field.properties.displayFormat || field.properties.format || 'Default';
    const format = originalFormat.toLowerCase();
    if (format === 'compact') {
      return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(numeric);
    }
    if (format === 'detailed') {
      return new Intl.NumberFormat('en-US', {
        useGrouping: true,
        maximumFractionDigits: field.type === 'Number' ? 0 : 2
      }).format(numeric);
    }
    if (field.type === 'Percent') {
      const decimals = originalFormat === '0.00%' ? 2 : originalFormat === '0.0%' ? 1 : 0;
      return `${numeric.toFixed(decimals)}%`;
    }
    if (field.type === 'Currency') {
      const currencyCode = field.properties.currencyType || (originalFormat.includes('INR') ? 'INR' : originalFormat.includes('$') ? 'USD' : 'INR');
      try {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: currencyCode,
          minimumFractionDigits: field.properties.decimalPoints ?? 2,
          maximumFractionDigits: field.properties.decimalPoints ?? 2
        }).format(numeric);
      } catch {
        return `${currencyCode} ${numeric.toFixed(field.properties.decimalPoints ?? 2)}`;
      }
    }
    if (field.type === 'Decimal') {
      return numeric.toFixed(field.properties.decimalPoints ?? 2);
    }
    if (field.type === 'Number' && format === 'default') {
      return `${Math.trunc(numeric)}`;
    }
    return raw;
  }

  // Returns a sanitized phone number for display.
  getPhoneDisplayValue(field: BuilderField): string {
    return this.sanitizePhoneValue(this.getDisplayValue(field.id));
  }

  // Executes the behavior configured for a preview action button.
  runAction(action: BuilderAction): void {
    if (action.actionType === 'submit') {
      this.onSubmit();
      return;
    }
    if (action.actionType === 'reset') {
      this.resetForm();
      return;
    }
    if (action.actionType === 'cancel') {
      this.close();
      return;
    }
    if (action.actionType === 'save-draft') {
      this.saveDraft();
    }
  }

  // Builds the initial preview value for each supported field type.
  protected getInitialValue(field: BuilderField): unknown {
    const initialValue = field.properties.initialValue ?? field.properties.defaultValue ?? '';
    if (field.type === 'Name') {
      return { prefix: '', firstName: '', lastName: '', suffix: '' };
    }
    if (field.type === 'Address') {
      return {
        line1: '',
        line2: '',
        city: '',
        state: '',
        postalCode: '',
        country: ''
      };
    }
    if (field.type === 'Checkbox' || this.isMultiSelectField(field)) {
      return [];
    }
    if (field.type === 'Decision Box') {
      return field.properties.decisionBoxInitialValue === true ? true : '';
    }
    if (field.type === 'Rich Text') {
      return initialValue;
    }
    if ((field.type === 'Date Picker' || field.type === 'Date') && this.isCurrentTimePreset(initialValue)) {
      return this.getCurrentDateValue();
    }
    if (field.type === 'Date-Time' && this.isCurrentTimePreset(initialValue)) {
      return this.getCurrentDateTimeValue(field);
    }
    if (field.type === 'Time' && this.isCurrentTimePreset(initialValue)) {
      return this.getCurrentTimeValue(field);
    }
    return initialValue;
  }

  // Returns the configured max character count when enabled.
  getCharacterMaximum(field: BuilderField): number | null {
    return typeof field.properties.characterMaximum === 'number' && field.properties.characterMaximum > 0
      ? field.properties.characterMaximum
      : null;
  }

  // Counts visible characters, ignoring rich-text HTML tags.
  getCharacterCount(field: BuilderField): number {
    const value = this.values[field.id];
    if (typeof value === 'string') {
      return value.replace(/<[^>]+>/g, '').length;
    }
    return 0;
  }

  // Shows counters only for text-like fields with a configured limit.
  showCharacterCounter(field: BuilderField): boolean {
    return this.getCharacterMaximum(field) !== null && !this.isChoiceField(field) && !this.isFileUpload(field) && !this.isSignatureField(field);
  }

  // Mirrors the visible invalid state helper for templates.
  shouldShowInvalidState(field: BuilderField): boolean {
    return this.showFieldError(field);
  }

}
