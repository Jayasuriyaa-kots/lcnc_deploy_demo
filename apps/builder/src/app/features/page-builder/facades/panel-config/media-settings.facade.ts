import { computed, effect, Injectable, signal } from '@angular/core';
import { resolvePageBuilderExpression } from '@builder/features/page-builder/services/page-builder-expression-resolver.service';
import { getPageBuilderMockDatasourceOptions, getPageBuilderMockQueryOptions } from '@builder/features/page-builder/services/page-builder-mock-datasource.service';
import {
  createDefaultMediaWidgetConfig,
  MediaWidgetConfig,
  MediaWidgetSourceMode,
  MediaWidgetType,
} from '@builder/features/page-builder/models/page-builder-canvas.model';
import { SelectOption } from '@qo/ui-components';

@Injectable()
export class MediaSettingsFacade {
  readonly config = signal<MediaWidgetConfig>(createDefaultMediaWidgetConfig());
  readonly configChange = signal<((c: MediaWidgetConfig) => void) | null>(null);

  readonly bindingRootKeys = computed(() => {
    const datasourceId = this.config().datasourceId?.trim();
    if (!datasourceId) {
      return [];
    }

    return getPageBuilderMockQueryOptions()
      .filter((option) => option.datasourceId === datasourceId)
      .map((option) => option.value);
  });

  readonly resolvedBindingRows = computed(() => {
    return this.resolveBindingRows(this.config().queryBinding);
  });

  readonly datasourceOptions = computed(() => getPageBuilderMockDatasourceOptions());

  readonly recordOptions = computed(() => {
    const rows = this.resolvedBindingRows();
    if (!rows.length) {
      return [];
    }

    return rows.map((row) => ({
      value: String(row.id),
      label: this.getRowLabel(row),
    }));
  });

  readonly queryOptions = computed(() => {
    const datasourceId = this.config().datasourceId;
    if (!datasourceId) {
      return [];
    }

    return getPageBuilderMockQueryOptions()
      .filter((option) => option.datasourceId === datasourceId)
      .map((option) => ({
        value: option.value,
        label: option.label,
      }));
  });

  readonly fieldOptions = computed(() => {
    const rows = this.resolvedBindingRows();
    const keys = Object.keys(rows[0] ?? {});

    return keys.map((key) => ({
      value: key,
      label: key,
    }));
  });

  supportsDatasourceBinding(): boolean {
    return (
      this.config().mediaType === 'image' ||
      this.config().mediaType === 'video' ||
      this.config().mediaType === 'pdf'
    );
  }

  isDatasourceMode(): boolean {
    return this.supportsDatasourceBinding() && this.config().sourceMode === 'datasource';
  }

  normalizePositiveInteger(value: string | number, fallback: number): number {
    const parsed = Number.parseInt(String(value), 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }

  localFileHint(): string {
    switch (this.config().mediaType) {
      case 'video':
        return 'You can also click the video widget preview or canvas widget to choose a local video.';
      case 'pdf':
        return 'You can also click the PDF widget preview or canvas widget to choose a local PDF file.';
      case 'image':
        return 'You can also click the image widget preview or canvas widget to choose a local image.';
      default:
        return '';
    }
  }

  sourceLabel(): string {
    switch (this.config().mediaType) {
      case 'video':
        return 'Video URL';
      case 'pdf':
        return 'PDF URL';
      default:
        return 'Image URL';
    }
  }

  datasourceFieldLabel(): string {
    if (this.config().mediaType === 'video') {
      return 'Video field';
    }
    if (this.config().mediaType === 'pdf') {
      return 'PDF field';
    }
    return 'Image field';
  }

  sourcePlaceholder(): string {
    switch (this.config().mediaType) {
      case 'video':
        return 'Enter video URL';
      case 'pdf':
        return 'Enter PDF URL';
      default:
        return 'Enter image URL';
    }
  }

  toggleVisible(): void {
    this.patchConfig({ visible: !this.config().visible });
  }

  updateMediaType(value: string | number): void {
    const mediaType = String(value) as MediaWidgetType;
    const defaults = createDefaultMediaWidgetConfig(mediaType);
    this.patchConfig({
      mediaType,
      sourceMode: this.config().sourceMode,
      backgroundColor: defaults.backgroundColor,
      title: defaults.title,
      caption: defaults.caption,
      sourceUrl: this.config().sourceUrl,
      datasourceId: this.config().datasourceId,
      queryBinding: this.config().queryBinding,
      recordId: this.config().recordId,
      imageField: this.config().imageField,
      titleField: this.config().titleField,
      captionField: this.config().captionField,
      uploadedImageDataUrl: this.config().uploadedImageDataUrl,
      uploadedVideoDataUrl: this.config().uploadedVideoDataUrl,
      uploadedPdfDataUrl: this.config().uploadedPdfDataUrl,
      autoPlay: this.config().autoPlay,
      pdfDefaultPage: this.config().pdfDefaultPage,
      pdfShowToolbar: this.config().pdfShowToolbar,
      pdfAllowDownload: this.config().pdfAllowDownload,
      pdfAllowPrint: this.config().pdfAllowPrint,
      pdfZoomLevel: this.config().pdfZoomLevel,
      pdfFitToWidth: this.config().pdfFitToWidth,
      pdfDisabled: this.config().pdfDisabled,
      pdfLoadingState: this.config().pdfLoadingState,
    });
  }

  updateSourceMode(value: string | number): void {
    const sourceMode = String(value) as MediaWidgetSourceMode;
    this.patchConfig({
      sourceMode,
      sourceUrl: sourceMode === 'static-url' ? this.config().sourceUrl : '',
      datasourceId: sourceMode === 'datasource' ? this.config().datasourceId : '',
      queryId: '',
      queryBinding: '',
      recordId: sourceMode === 'datasource' ? this.config().recordId : '',
      imageField: sourceMode === 'datasource' ? this.config().imageField : '',
      titleField: sourceMode === 'datasource' ? this.config().titleField : '',
      captionField: sourceMode === 'datasource' ? this.config().captionField : '',
      uploadedImageDataUrl: sourceMode === 'upload' ? this.config().uploadedImageDataUrl : '',
      uploadedVideoDataUrl: sourceMode === 'upload' ? this.config().uploadedVideoDataUrl : '',
      uploadedPdfDataUrl: sourceMode === 'upload' ? this.config().uploadedPdfDataUrl : '',
    });
  }

  updateTitle(value: string): void {
    this.patchConfig({ title: value });
  }

  updateCaption(value: string): void {
    this.patchConfig({ caption: value });
  }

  updateSourceUrl(value: string): void {
    const trimmedValue = value.trim();
    this.patchConfig({
      sourceUrl: trimmedValue,
      uploadedImageDataUrl:
        this.config().mediaType === 'image' && trimmedValue ? '' : this.config().uploadedImageDataUrl,
      uploadedVideoDataUrl:
        this.config().mediaType === 'video' && trimmedValue ? '' : this.config().uploadedVideoDataUrl,
      uploadedPdfDataUrl:
        this.config().mediaType === 'pdf' && trimmedValue ? '' : this.config().uploadedPdfDataUrl,
    });
  }

  updateDatasource(value: string | number): void {
    const datasourceId = String(value);
    this.patchConfig({
      datasourceId,
      queryId: '',
      queryBinding: '',
      recordId: '',
      imageField: '',
      titleField: '',
      captionField: '',
    });
  }

  updateQueryId(value: string | number): void {
    const queryId = String(value);
    const binding = this.buildQueryBinding(this.config().datasourceId, queryId);
    const rows = this.resolveBindingRows(binding);
    const firstRow = rows[0];
    const mediaType = this.config().mediaType;
    const keys = Object.keys(firstRow ?? {});

    this.patchConfig({
      queryId,
      queryBinding: binding,
      recordId: firstRow ? String(firstRow.id) : '',
      imageField: this.pickPreferredField(keys, this.mediaFieldCandidates(mediaType)),
      titleField: this.pickPreferredField(keys, ['name', 'title', 'full_name']),
      captionField: this.pickPreferredField(keys, ['caption', 'description', 'role']),
    });
  }

  updateQueryBinding(value: string): void {
    const datasourceId = this.extractDatasourceIdFromBinding(value) || this.config().datasourceId;
    const queryId = this.extractQueryIdFromBinding(value, datasourceId);
    const rows = this.resolveBindingRows(value);
    const firstRow = rows[0];
    const keys = Object.keys(firstRow ?? {});
    if (!queryId) {
      this.patchConfig({
        datasourceId,
        queryBinding: value,
        queryId: '',
        recordId: firstRow ? String(firstRow.id) : '',
        imageField: this.pickPreferredField(keys, this.mediaFieldCandidates(this.config().mediaType)),
        titleField: this.pickPreferredField(keys, ['name', 'title', 'full_name']),
        captionField: this.pickPreferredField(keys, ['caption', 'description', 'role']),
      });
      return;
    }

    this.patchConfig({
      datasourceId,
      queryBinding: value,
      queryId,
      recordId: firstRow ? String(firstRow.id) : '',
      imageField: this.pickPreferredField(keys, this.mediaFieldCandidates(this.config().mediaType)),
      titleField: this.pickPreferredField(keys, ['name', 'title', 'full_name']),
      captionField: this.pickPreferredField(keys, ['caption', 'description', 'role']),
    });
  }

  updateRecordId(value: string | number): void {
    this.patchConfig({ recordId: String(value) });
  }

  updateImageField(value: string | number): void {
    this.patchConfig({ imageField: String(value) });
  }

  updateTitleField(value: string | number): void {
    this.patchConfig({ titleField: String(value) });
  }

  updateCaptionField(value: string | number): void {
    this.patchConfig({ captionField: String(value) });
  }

  toggleShowTitle(): void {
    this.patchConfig({ showTitle: !this.config().showTitle });
  }

  toggleShowCaption(): void {
    this.patchConfig({ showCaption: !this.config().showCaption });
  }

  toggleAutoPlay(): void {
    this.patchConfig({ autoPlay: !this.config().autoPlay });
  }

  updatePdfDefaultPage(value: string): void {
    this.patchConfig({ pdfDefaultPage: this.normalizePositiveInteger(value, 1) });
  }

  togglePdfShowToolbar(): void {
    this.patchConfig({ pdfShowToolbar: !this.config().pdfShowToolbar });
  }

  togglePdfAllowDownload(): void {
    this.patchConfig({ pdfAllowDownload: !this.config().pdfAllowDownload });
  }

  togglePdfAllowPrint(): void {
    this.patchConfig({ pdfAllowPrint: !this.config().pdfAllowPrint });
  }

  updatePdfZoomLevel(value: string): void {
    const zoomLevel = this.normalizePositiveInteger(value, 100);
    this.patchConfig({ pdfZoomLevel: Math.min(Math.max(zoomLevel, 25), 400) });
  }

  togglePdfFitToWidth(): void {
    this.patchConfig({ pdfFitToWidth: !this.config().pdfFitToWidth });
  }

  togglePdfDisabled(): void {
    this.patchConfig({ pdfDisabled: !this.config().pdfDisabled });
  }

  togglePdfLoadingState(): void {
    this.patchConfig({ pdfLoadingState: !this.config().pdfLoadingState });
  }

  private patchConfig(partial: Partial<MediaWidgetConfig>): void {
    const nextConfig = {
      ...this.config(),
      ...partial,
    };
    this.config.set(nextConfig);
    const fn = this.configChange();
    if (fn) {
      fn(nextConfig);
    }
  }

  private buildQueryBinding(datasourceId: string, queryId: string): string {
    return datasourceId && queryId ? `{{datasources.${datasourceId}.queries.${queryId}}}` : '';
  }

  private extractDatasourceIdFromBinding(binding: string): string {
    const trimmed = binding.trim();
    const exactExpression = trimmed.match(/^\{\{\s*([^}]+?)\s*\}\}$/);
    const path = exactExpression ? (exactExpression[1] ?? '').trim() : trimmed;
    const datasourceMatch = path.match(/^datasources\.([^.]+)\.queries\./);
    return datasourceMatch?.[1] ?? '';
  }

  private extractQueryIdFromBinding(binding: string, datasourceId: string): string {
    const allowedQueryIds = getPageBuilderMockQueryOptions()
      .filter((option) => option.datasourceId === datasourceId)
      .map((option) => option.value);
    const trimmed = binding.trim();
    const exactExpression = trimmed.match(/^\{\{\s*([^}]+?)\s*\}\}$/);
    const path = exactExpression ? (exactExpression[1] ?? '').trim() : trimmed;

    if (!path) {
      return '';
    }

    const datasourceMatch = path.match(/^datasources\.([^.]+)\.queries\.([^.[]+)/);
    if (datasourceMatch && datasourceMatch[1] === datasourceId && allowedQueryIds.includes(datasourceMatch[2] ?? '')) {
      return datasourceMatch[2] ?? '';
    }

    const topLevelQueryId = path.split(/[.[\]]/, 1)[0] ?? '';
    return allowedQueryIds.includes(topLevelQueryId) ? topLevelQueryId : '';
  }

  private pickPreferredField(keys: string[], candidates: string[]): string {
    return candidates.find((candidate) => keys.includes(candidate)) ?? keys[0] ?? '';
  }

  private mediaFieldCandidates(mediaType: MediaWidgetType): string[] {
    if (mediaType === 'video') {
      return ['video_url', 'video', 'media_url', 'url'];
    }

    if (mediaType === 'pdf') {
      return ['pdf_url', 'pdf', 'document_url', 'file_url', 'url'];
    }

    return ['image_url', 'photo_url', 'image', 'photo'];
  }

  private resolveBindingRows(binding: string): Array<Record<string, unknown>> {
    const trimmed = binding.trim();
    if (!trimmed) {
      return [];
    }

    const jsonRows = this.tryParseJsonRows(trimmed);
    if (jsonRows.length) {
      return jsonRows;
    }

    const resolved = resolvePageBuilderExpression(trimmed);

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

  private getRowLabel(row: Record<string, unknown>): string {
    const title =
      (typeof row['name'] === 'string' && row['name']) ||
      (typeof row['title'] === 'string' && row['title']) ||
      (typeof row['full_name'] === 'string' && row['full_name']) ||
      '';

    return title ? `${row['id']} - ${title}` : String(row['id'] ?? '');
  }
}
