import { TranslocoPipe } from '@jsverse/transloco';
import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, input, output, signal, viewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { resolvePageBuilderExpression, resolvePageBuilderExpressionToString } from '@builder/features/page-builder/services/page-builder-expression-resolver.service';
import { getPageBuilderRuntimeRow } from '@builder/features/page-builder/services/page-builder-runtime-binding.service';
import {
  createDefaultMediaWidgetConfig,
  MediaWidgetConfig,
} from '@builder/features/page-builder/models/page-builder-canvas.model';

const DEFAULT_MEDIA_WIDGET_CONFIG = createDefaultMediaWidgetConfig();

/**
 * TECHNICAL EXCEPTION - Violation 2 (Raw Form Elements):
 * This component is an approved canvas widget rendering/simulation exception.
 * It uses raw HTML elements to simulate dynamic layouts and customizable styling properties
 * (dynamic colors, custom border shape/sizes/paddings) which standard Qo components would override.
 */
import { injectPageBuilderTranslate } from '@builder/features/page-builder/services/page-builder-i18n.service';

@Component({
  selector: 'app-ui-media-widget',
  standalone: true,
  templateUrl: './ui-media-widget.component.html',
  styleUrl: './ui-media-widget.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiMediaWidgetComponent {
  protected readonly t = injectPageBuilderTranslate();
  private readonly domSanitizer = inject(DomSanitizer);
  readonly config = input<MediaWidgetConfig | undefined>(undefined);
  readonly allowLocalImageSelection = input(false);
  readonly enableImageZoomControls = input(false);
  readonly configChange = output<MediaWidgetConfig>();
  readonly imageFileInput = viewChild<ElementRef<HTMLInputElement>>('imageFileInput');
  readonly imageViewport = viewChild<ElementRef<HTMLDivElement>>('imageViewport');
  readonly imageZoomScale = signal(1);
  readonly imageOffsetX = signal(0);
  readonly imageOffsetY = signal(0);
  readonly isDraggingImage = signal(false);
  readonly isVideoExpanded = signal(false);
  private dragStartX = 0;
  private dragStartY = 0;
  private dragOriginX = 0;
  private dragOriginY = 0;

  readonly resolvedConfig = computed<MediaWidgetConfig>(() => ({
    ...DEFAULT_MEDIA_WIDGET_CONFIG,
    ...(this.config() ?? {}),
  }));

  readonly isVideo = computed(() => this.resolvedConfig().mediaType === 'video');
  readonly isPdf = computed(() => this.resolvedConfig().mediaType === 'pdf');
  readonly canOpenLocalPicker = computed(
    () => this.allowLocalImageSelection() && this.resolvedConfig().sourceMode === 'upload',
  );
  readonly fileInputAccept = computed(() =>
    this.isVideo() ? 'video/*' : this.isPdf() ? '.pdf,application/pdf' : 'image/*',
  );
  readonly datasourceRows = computed(() => {
    const binding = this.resolvedConfig().queryBinding?.trim() ?? '';
    if (!binding) {
      return [];
    }

    const jsonRows = this.tryParseJsonRows(binding);
    if (jsonRows.length) {
      return jsonRows;
    }

    const resolved = resolvePageBuilderExpression(binding);
    return this.coerceResolvedValueToRows(resolved);
  });
  readonly resolvedDatasourceDirectSource = computed(() => {
    const binding = this.resolvedConfig().queryBinding?.trim() ?? '';
    if (!binding) {
      return '';
    }

    const resolved = resolvePageBuilderExpression(binding);
    return typeof resolved === 'string' ? resolved.trim() : '';
  });
  readonly datasourceRow = computed(() =>
    this.resolvedConfig().sourceMode === 'datasource'
      ? this.resolveDatasourceRow()
      : null,
  );
  readonly resolvedDatasourceImageSource = computed(() => {
    const row = this.datasourceRow();
    const field = this.resolvedConfig().imageField.trim();
    const value = row && field ? row[field] : '';
    return typeof value === 'string' ? value.trim() : '';
  });
  readonly resolvedDatasourceVideoSource = computed(() => {
    const row = this.datasourceRow();
    const field = this.resolvedConfig().imageField.trim();
    const value = row && field ? row[field] : '';
    return typeof value === 'string' ? value.trim() : '';
  });
  readonly currentImageSource = computed(() => {
    const config = this.resolvedConfig();

    if (config.sourceMode === 'datasource') {
      return this.resolvedDatasourceImageSource() || this.resolvedDatasourceDirectSource();
    }

    if (config.sourceMode === 'upload') {
      return config.uploadedImageDataUrl.trim();
    }

    return this.resolveConfigBindingToString(config.sourceUrl) || config.uploadedImageDataUrl.trim();
  });
  readonly currentVideoSource = computed(
    () => {
      const config = this.resolvedConfig();

      if (config.sourceMode === 'datasource') {
        return this.resolvedDatasourceVideoSource() || this.resolvedDatasourceDirectSource();
      }

      if (config.sourceMode === 'upload') {
        return config.uploadedVideoDataUrl.trim();
      }

      return this.resolveConfigBindingToString(config.sourceUrl) || config.uploadedVideoDataUrl.trim();
    },
  );
  readonly resolvedDatasourcePdfSource = computed(() => {
    const row = this.datasourceRow();
    const field = this.resolvedConfig().imageField.trim();
    const value = row && field ? row[field] : '';
    return typeof value === 'string' ? value.trim() : '';
  });
  readonly currentPdfSource = computed(() => {
    const config = this.resolvedConfig();

    if (config.sourceMode === 'datasource') {
      return this.resolvedDatasourcePdfSource() || this.resolvedDatasourceDirectSource();
    }

    if (config.sourceMode === 'upload') {
      return config.uploadedPdfDataUrl.trim();
    }

    return this.resolveConfigBindingToString(config.sourceUrl) || config.uploadedPdfDataUrl.trim();
  });
  readonly hasImageSource = computed(() => !!this.currentImageSource());
  readonly hasVideoSource = computed(() => !!this.currentVideoSource());
  readonly hasPdfSource = computed(() => !!this.currentPdfSource());
  readonly pdfViewerSource = computed(() => {
    const source = this.currentPdfSource();
    if (!source) {
      return '';
    }

    // Data URLs (uploaded files) are embedded directly using native PDF viewer params.
    if (source.startsWith('data:')) {
      const params = [
        `page=${Math.max(this.resolvedConfig().pdfDefaultPage, 1)}`,
        `toolbar=${this.resolvedConfig().pdfShowToolbar ? 1 : 0}`,
        `zoom=${this.resolvedConfig().pdfFitToWidth ? 'page-width' : Math.max(this.resolvedConfig().pdfZoomLevel, 25)}`,
      ];
      const separator = source.includes('#') ? '&' : '#';
      return `${source}${separator}${params.join('&')}`;
    }

    // External URLs (datasource / static-url) are wrapped in the Google Docs viewer
    // so they render in iframes regardless of the origin server's X-Frame-Options header.
    return `https://docs.google.com/viewer?url=${encodeURIComponent(source)}&embedded=true`;
  });
  readonly safePdfViewerSource = computed<SafeResourceUrl | null>(() => {
    const source = this.pdfViewerSource();
    return source ? this.domSanitizer.bypassSecurityTrustResourceUrl(source) : null;
  });
  readonly mediaTypeLabel = computed(() => (this.isVideo() ? 'Video' : this.isPdf() ? 'PDF' : 'Image'));
  readonly resolvedTitle = computed(() => {
    const row = this.datasourceRow();
    const field = this.resolvedConfig().titleField.trim();
    const value = row && field ? row[field] : '';
    if (typeof value === 'string' && value.trim()) {
      return value;
    }

    return this.resolveConfigBindingToString(this.resolvedConfig().title);
  });
  readonly resolvedCaption = computed(() => {
    const row = this.datasourceRow();
    const field = this.resolvedConfig().captionField.trim();
    const value = row && field ? row[field] : '';
    if (typeof value === 'string' && value.trim()) {
      return value;
    }

    return this.resolveConfigBindingToString(this.resolvedConfig().caption);
  });
  readonly displayTitle = computed(() => (this.resolvedConfig().showTitle ? this.resolvedTitle().trim() : ''));
  readonly displayCaption = computed(() => (this.resolvedConfig().showCaption ? this.resolvedCaption().trim() : ''));
  readonly canShowZoomControls = computed(
    () => this.enableImageZoomControls() && !this.isVideo() && !this.isPdf() && this.hasImageSource(),
  );
  readonly imageTransform = computed(
    () => `translate(${this.imageOffsetX()}px, ${this.imageOffsetY()}px) scale(${this.imageZoomScale()})`,
  );
  readonly canDragImage = computed(() => this.canShowZoomControls() && this.imageZoomScale() > 1);

  openImagePicker(event?: MouseEvent): void {
    if (!this.canOpenLocalPicker()) {
      return;
    }

    event?.stopPropagation();
    this.imageFileInput()?.nativeElement.click();
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0];

    if (!file) {
      return;
    }

    const expectsVideo = this.isVideo();
    const expectsPdf = this.isPdf();
    const isValidFile = expectsPdf
      ? file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
      : expectsVideo
        ? file.type.startsWith('video/')
        : file.type.startsWith('image/');
    if (!isValidFile) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      if (!result) {
        return;
      }

      this.configChange.emit({
        ...this.resolvedConfig(),
        sourceMode: 'upload',
        uploadedImageDataUrl: expectsVideo || expectsPdf ? '' : result,
        uploadedVideoDataUrl: expectsVideo ? result : '',
        uploadedPdfDataUrl: expectsPdf ? result : '',
      });
    };
    reader.readAsDataURL(file);

    if (input) {
      input.value = '';
    }
  }

  zoomIn(event: MouseEvent): void {
    event.stopPropagation();
    this.imageZoomScale.update((value) => Math.min(value + 0.25, 3));
    this.clampImageOffset();
  }

  zoomOut(event: MouseEvent): void {
    event.stopPropagation();
    this.imageZoomScale.update((value) => {
      const nextValue = Math.max(value - 0.25, 1);
      if (nextValue === 1) {
        this.imageOffsetX.set(0);
        this.imageOffsetY.set(0);
      } else {
        this.clampImageOffset(nextValue);
      }
      return nextValue;
    });
  }

  resetZoom(event: MouseEvent): void {
    event.stopPropagation();
    this.imageZoomScale.set(1);
    this.imageOffsetX.set(0);
    this.imageOffsetY.set(0);
  }

  startImageDrag(event: MouseEvent): void {
    if (!this.canDragImage()) {
      return;
    }

    event.stopPropagation();
    event.preventDefault();
    this.isDraggingImage.set(true);
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;
    this.dragOriginX = this.imageOffsetX();
    this.dragOriginY = this.imageOffsetY();
  }

  onImageDrag(event: MouseEvent): void {
    if (!this.isDraggingImage()) {
      return;
    }

    event.preventDefault();
    const nextOffsetX = this.dragOriginX + (event.clientX - this.dragStartX);
    const nextOffsetY = this.dragOriginY + (event.clientY - this.dragStartY);
    const { x, y } = this.getClampedOffset(nextOffsetX, nextOffsetY);
    this.imageOffsetX.set(x);
    this.imageOffsetY.set(y);
  }

  endImageDrag(): void {
    this.isDraggingImage.set(false);
  }

  toggleVideoExpanded(event: MouseEvent): void {
    event.stopPropagation();
    this.isVideoExpanded.update((value) => !value);
  }

  downloadPdf(event: MouseEvent): void {
    event.stopPropagation();
    const source = this.currentPdfSource();
    if (!source) {
      return;
    }

    const anchor = document.createElement('a');
    anchor.href = source;
    anchor.download = `${this.resolvedConfig().title.trim() || 'document'}.pdf`;
    anchor.target = '_blank';
    anchor.rel = 'noopener';
    anchor.click();
  }

  printPdf(event: MouseEvent): void {
    event.stopPropagation();
    const source = this.currentPdfSource();
    if (!source) {
      return;
    }

    const previewWindow = window.open(source, '_blank', 'noopener');
    previewWindow?.focus();
    setTimeout(() => previewWindow?.print(), 500);
  }

  private clampImageOffset(scale = this.imageZoomScale()): void {
    const { x, y } = this.getClampedOffset(this.imageOffsetX(), this.imageOffsetY(), scale);
    this.imageOffsetX.set(x);
    this.imageOffsetY.set(y);
  }

  private getClampedOffset(offsetX: number, offsetY: number, scale = this.imageZoomScale()): { x: number; y: number } {
    const viewport = this.imageViewport()?.nativeElement;
    if (!viewport || scale <= 1) {
      return { x: 0, y: 0 };
    }

    const maxOffsetX = (viewport.clientWidth * (scale - 1)) / 2;
    const maxOffsetY = (viewport.clientHeight * (scale - 1)) / 2;

    return {
      x: this.clamp(offsetX, -maxOffsetX, maxOffsetX),
      y: this.clamp(offsetY, -maxOffsetY, maxOffsetY),
    };
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  private resolveConfigBindingToString(value: string): string {
    const trimmed = value.trim();
    if (!trimmed) {
      return '';
    }

    return resolvePageBuilderExpressionToString(trimmed).trim();
  }

  private resolveDatasourceRow(): Record<string, unknown> | null {
    const rows = this.datasourceRows();
    if (rows.length) {
      const recordId = this.resolvedConfig().recordId.trim();
      if (!recordId) {
        return rows[0] ?? null;
      }

      return rows.find((row) => String(row['id']) === recordId) ?? rows[0] ?? null;
    }

    if (this.resolvedConfig().datasourceId.trim() && !this.resolvedConfig().queryId.trim()) {
      return null;
    }

    return getPageBuilderRuntimeRow(
      this.resolvedConfig().datasourceId,
      this.resolvedConfig().recordId,
      this.resolvedConfig().queryId,
    );
  }

  private coerceResolvedValueToRows(resolved: unknown): Array<Record<string, unknown>> {
    if (Array.isArray(resolved)) {
      return this.normalizeResolvedRows(resolved);
    }

    if (resolved && typeof resolved === 'object') {
      const candidate = resolved as Record<string, unknown>;
      if (Array.isArray(candidate['data'])) {
        return this.normalizeResolvedRows(candidate['data']);
      }

      return this.normalizeResolvedRows([candidate]);
    }

    return [];
  }

  private normalizeResolvedRows(rows: unknown[]): Array<Record<string, unknown>> {
    return rows.filter((row): row is Record<string, unknown> => !!row && typeof row === 'object');
  }

  private tryParseJsonRows(binding: string): Array<Record<string, unknown>> {
    const trimmed = binding.trim();
    if (!trimmed || (!trimmed.startsWith('{') && !trimmed.startsWith('['))) {
      return [];
    }

    try {
      const parsed = JSON.parse(trimmed) as unknown;

      if (Array.isArray(parsed)) {
        return this.normalizeResolvedRows(parsed);
      }

      if (parsed && typeof parsed === 'object') {
        const data = (parsed as Record<string, unknown>)['data'];
        if (Array.isArray(data)) {
          return this.normalizeResolvedRows(data);
        }

        return this.normalizeResolvedRows([parsed]);
      }
    } catch {
      return [];
    }

    return [];
  }
}
