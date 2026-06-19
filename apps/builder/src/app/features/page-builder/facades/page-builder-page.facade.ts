import { computed, effect, inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { BuilderPreviewService } from '@builder/core/services/builder-preview.service';
import { FormBuilderAsset, FormBuilderFacadeService } from '@builder/features/form-builder/services/form-builder-facade.service';
import { ReportBuilderAsset, ReportBuilderFacade } from '@builder/features/report-builder/facades/report-builder.facade';
import { PageBuilderFacade } from '@builder/features/page-builder/facades/page-builder.facade';
import { PageBuilderViewport } from '@builder/features/page-builder/models/page-builder-page.model';
import {
  ButtonActionConfig,
  ButtonActionOpenIn,
  CanvasWidget,
  createDefaultButtonStyleConfig,
  createDefaultButtonActionConfig,
  createDefaultSelectWidgetConfig,
  createDefaultTableWidgetConfig,
  SelectWidgetConfig,
  TableWidgetConfig,
} from '@builder/features/page-builder/models/page-builder-canvas.model';

export type RenderedPreviewWidget = CanvasWidget & {
  renderHeight: number;
  renderScale: number;
  scaledHeight: number;
};

@Injectable()
export class PageBuilderPageFacade {
  private readonly document = inject(DOCUMENT);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly pageBuilderFacade = inject(PageBuilderFacade);
  private readonly formBuilderFacade = inject(FormBuilderFacadeService);
  private readonly reportBuilderFacade = inject(ReportBuilderFacade);
  private readonly builderPreview = inject(BuilderPreviewService);

  private readonly canvasBaseHeight = 560;
  private readonly canvasBottomPadding = 20;
  private readonly canvasHorizontalPadding = 24;
  private readonly desktopViewportCanvasWidth = 1280 - this.canvasHorizontalPadding * 2;
  private readonly viewportSurfaceWidths: Record<'desktop' | 'tablet' | 'mobile', number> = {
    desktop: 1280,
    tablet: 820,
    mobile: 560,
  };

  readonly pages = this.pageBuilderFacade.pages;
  readonly selectedPage = this.pageBuilderFacade.selectedPage;
  readonly selectedViewport = this.pageBuilderFacade.selectedPageViewport;
  readonly panelResolutions = this.pageBuilderFacade.panelResolutions;
  readonly publishedPages = computed(() => this.pages().filter((page) => page.status === 'live'));

  private readonly routeData = toSignal(this.route.data, {
    initialValue: this.route.snapshot.data,
  });
  private readonly queryPageId = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });

  readonly isStandalonePreviewMode = computed(() => !!this.routeData()['standalonePreview']);
  readonly isDraftPreviewMode = computed(() => this.queryPageId().get('preview') === 'draft');

  readonly savedWidgets = computed(() => {
    if (this.isStandalonePreviewMode()) {
      return this.isDraftPreviewMode() ? this.pageBuilderFacade.draftWidgets() : this.pageBuilderFacade.publishedWidgets();
    }
    return this.selectedPage()?.status === 'draft'
      ? this.pageBuilderFacade.draftWidgets()
      : this.pageBuilderFacade.publishedWidgets();
  });

  readonly viewportSurfaceWidth = computed(() => this.viewportSurfaceWidths[this.selectedViewport()]);
  readonly viewportCanvasWidth = computed(() =>
    Math.max(0, this.viewportSurfaceWidth() - this.canvasHorizontalPadding * 2),
  );
  readonly viewportWidthScale = computed(() => {
    const rawScale = Math.min(1, this.viewportCanvasWidth() / this.desktopViewportCanvasWidth);
    return this.selectedViewport() === 'mobile' ? Math.max(0.68, rawScale) : rawScale;
  });

  readonly previewWidgets = computed<RenderedPreviewWidget[]>(() => {
    const boundsWidth = this.viewportCanvasWidth();
    const widthScale = this.viewportWidthScale();

    return this.savedWidgets().map((widget) => {
      const renderHeight = this.getPreviewWidgetHeight(widget);
      const width = Math.min(Math.max(1, Math.round(widget.width * widthScale)), boundsWidth);
      const height = Math.max(1, Math.round(renderHeight * widthScale));
      const x = this.clamp(Math.round(widget.x * widthScale), 0, Math.max(0, boundsWidth - width));

      return {
        ...widget,
        x,
        height,
        renderHeight,
        renderScale: widthScale,
        scaledHeight: height,
        width,
      };
    });
  });

  readonly renderedCanvasPreviewHeight = computed(() =>
    Math.max(this.canvasBaseHeight, this.canvasPreviewHeight()),
  );

  readonly canvasPreviewHeight = computed(() => {
    const widgets = this.previewWidgets();
    if (!widgets.length) {
      return this.canvasBaseHeight;
    }
    const lowestEdge = Math.max(...widgets.map((widget) => widget.y + widget.height));
    return Math.max(this.canvasBaseHeight, lowestEdge + this.canvasBottomPadding);
  });

  constructor() {
    effect(() => {
      const pageId = this.queryPageId().get('page');
      const availablePages = this.isStandalonePreviewMode() ? this.publishedPages() : this.pages();
      if (pageId && availablePages.some((page) => page.id === pageId) && this.pageBuilderFacade.selectedPageId() !== pageId) {
        this.pageBuilderFacade.selectPage(pageId);
        return;
      }

      if (
        this.isStandalonePreviewMode() &&
        !pageId &&
        this.publishedPages().length &&
        this.pageBuilderFacade.selectedPageId() !== this.publishedPages()[0].id
      ) {
        this.pageBuilderFacade.selectPage(this.publishedPages()[0].id);
        void this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {
            page: this.publishedPages()[0].id,
            preview: 'published',
          },
          queryParamsHandling: 'merge',
        });
      }
    }, { allowSignalWrites: true });

    effect(() => {
      this.builderPreview.setMode(this.selectedViewport());
    });

    effect((onCleanup) => {
      if (!this.isStandalonePreviewMode()) {
        return;
      }

      const htmlElement = this.document.documentElement;
      const bodyElement = this.document.body;

      htmlElement.classList.add('page-builder-preview-mode');
      bodyElement.classList.add('page-builder-preview-mode');

      onCleanup(() => {
        htmlElement.classList.remove('page-builder-preview-mode');
        bodyElement.classList.remove('page-builder-preview-mode');
      });
    });
  }

  getWidgetTableConfig(widget: { widgetProps?: { tableConfig?: TableWidgetConfig } }): TableWidgetConfig {
    return {
      ...createDefaultTableWidgetConfig(),
      ...(widget.widgetProps?.tableConfig ?? {}),
    };
  }

  getWidgetButtonStyles(widget: CanvasWidget): Record<string, string> {
    const config = {
      ...createDefaultButtonStyleConfig(),
      ...(widget.buttonStyleConfig ?? {}),
    };

    return {
      borderRadius: `${config.cornerRadius}px`,
      fontFamily: config.fontFamily,
      fontSize: this.normalizeFontSize(config.fontSize),
      fontWeight: config.bold ? '700' : '500',
      fontStyle: config.italic ? 'italic' : 'normal',
      textDecoration: config.underline ? 'underline' : 'none',
      textTransform: config.textCase === 'uppercase' ? 'uppercase' : config.textCase === 'lowercase' ? 'lowercase' : 'none',
      color: config.color,
      backgroundColor: config.fillColor,
      borderColor: config.strokeColor,
      borderWidth: `${config.strokeWidth}px`,
      borderStyle: config.strokeWidth > 0 ? 'solid' : 'none',
      padding: `${config.paddingTop}px ${config.paddingRight}px ${config.paddingBottom}px ${config.paddingLeft}px`,
      margin: `${config.marginTop}px ${config.marginRight}px ${config.marginBottom}px ${config.marginLeft}px`,
    };
  }

  getWidgetSelectConfig(widget: { widgetProps?: { selectConfig?: SelectWidgetConfig } }): SelectWidgetConfig {
    const config = widget.widgetProps?.selectConfig;
    return {
      ...createDefaultSelectWidgetConfig(),
      ...(config ?? {}),
      options: (config?.options ?? createDefaultSelectWidgetConfig().options).map((option) => ({ ...option })),
    };
  }

  hasPages(): boolean {
    return this.isStandalonePreviewMode() ? this.publishedPages().length > 0 : this.pages().length > 0;
  }

  navigateToEditPage(): void {
    const pageId = this.selectedPage()?.id;
    void this.router.navigate(['/page-builder/edit'], {
      queryParams: pageId ? { page: pageId } : {},
    });
  }

  setViewport(viewport: PageBuilderViewport): void {
    this.pageBuilderFacade.setSelectedPageViewport(viewport);
  }

  openPreviewPage(): void {
    const pageId = this.selectedPage()?.id;
    if (!pageId) {
      return;
    }

    const previewUrl = this.router.serializeUrl(
      this.router.createUrlTree(['/page-builder/preview'], {
        queryParams: {
          page: pageId,
          preview: 'published',
        },
      }),
    );
    window.open(previewUrl, '_blank', 'noopener,noreferrer');
  }

  openPublishedPreviewPage(pageId: string): void {
    this.pageBuilderFacade.selectPage(pageId);
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: pageId,
        preview: 'published',
      },
      queryParamsHandling: 'merge',
    });
  }

  closeStandalonePreview(): void {
    if (!this.isStandalonePreviewMode()) {
      return;
    }

    const pageId = this.selectedPage()?.id ?? this.queryPageId().get('page') ?? '';
    if (typeof window !== 'undefined') {
      const currentWindow = window;
      currentWindow.close();

      setTimeout(() => {
        if (!currentWindow.closed) {
          void this.router.navigate(['/page-builder'], {
            queryParams: pageId ? { page: pageId } : {},
          });
        }
      }, 120);
      return;
    }

    void this.router.navigate(['/page-builder'], {
      queryParams: pageId ? { page: pageId } : {},
    });
  }

  publishSelectedPage(): void {
    const pageId = this.selectedPage()?.id;
    if (!pageId) {
      return;
    }
    this.pageBuilderFacade.selectPage(pageId);
    this.pageBuilderFacade.publishDraft();
  }

  handleButtonAction(event: MouseEvent, widget: CanvasWidget, actionConfig?: ButtonActionConfig | null): void {
    event.preventDefault();
    event.stopPropagation();

    const config = {
      ...createDefaultButtonActionConfig(),
      ...(actionConfig ?? widget.widgetProps?.buttonActionConfig ?? {}),
    };

    switch (config.type) {
      case 'open-url': {
        const url = this.normalizeActionUrl(config.url);
        if (url) {
          this.openActionUrl(url, config.openIn);
        }
        return;
      }
      case 'open-form': {
        const url = this.buildFormPreviewActionUrl(config.formId, config.queryParams);
        if (url) {
          this.openActionUrl(url, config.openIn);
        }
        return;
      }
      case 'open-report': {
        const url = this.buildReportPreviewActionUrl(config.reportId, config.queryParams);
        if (url) {
          this.openActionUrl(url, config.openIn);
        }
        return;
      }
      case 'open-page': {
        const pageId = config.pageId.trim();
        if (pageId) {
          this.navigateToPageBuilderPage(pageId, config.openIn, config.queryParams);
        }
        return;
      }
      case 'execute-function':
        return;
      case 'none':
      default:
        return;
    }
  }

  private getPreviewWidgetHeight(widget: CanvasWidget): number {
    if (widget.type === 'form-embed') {
      const fieldCount = widget.widgetProps?.formConfig?.fields.length ?? 0;
      return Math.max(widget.height, 188 + fieldCount * 78);
    }

    if (widget.type === 'report-embed') {
      const rowCount = widget.widgetProps?.reportConfig?.rows.length ?? 0;
      return Math.max(widget.height, 136 + rowCount * 38);
    }

    if (widget.type === 'select-showcase') {
      const config = this.getWidgetSelectConfig(widget);
      if (config.variant === 'multiselect') {
        return Math.max(widget.height, 152);
      }
      if (config.variant === 'radio') {
        return Math.max(widget.height, 136);
      }
    }

    if (widget.type === 'text-block-showcase') {
      const variant = widget.textBlockVariant ?? widget.widgetProps?.textBlockConfig?.inputType ?? 'text';
      if (variant === 'richtext') {
        return Math.max(widget.height, 220);
      }
    }

    return widget.height;
  }

  private normalizeFontSize(value: string): string {
    return value.startsWith('var(') ? value : value.replace(/\s+/g, '');
  }

  private normalizeActionUrl(value: string): string {
    const trimmedValue = value.trim();
    if (!trimmedValue) {
      return '';
    }

    if (
      trimmedValue.startsWith('http://') ||
      trimmedValue.startsWith('https://') ||
      trimmedValue.startsWith('/') ||
      trimmedValue.startsWith('#') ||
      trimmedValue.startsWith('mailto:') ||
      trimmedValue.startsWith('tel:')
    ) {
      return trimmedValue;
    }

    return `https://${trimmedValue}`;
  }

  private buildFormPreviewActionUrl(formId: string, queryParams: string): string {
    const form = this.resolveFormPreviewAsset(formId);
    if (!form) {
      return '';
    }

    const stateKey = this.persistPreviewState('form-preview', form);
    const previewUrl = this.router.serializeUrl(
      this.router.createUrlTree(['/form-builder/preview'], {
        queryParams: {
          stateKey,
          ...this.buildPreviewContextQueryParams(),
        },
      }),
    );
    return this.appendQueryParams(previewUrl, queryParams);
  }

  private buildReportPreviewActionUrl(reportId: string, queryParams: string): string {
    const report = this.resolveReportPreviewAsset(reportId);
    if (!report) {
      return '';
    }

    const stateKey = this.persistPreviewState('report-preview', report);
    const previewUrl = this.router.serializeUrl(
      this.router.createUrlTree(['/report-builder/preview'], {
        queryParams: {
          stateKey,
          pageSize: 20,
          ...this.buildPreviewContextQueryParams(),
        },
      }),
    );
    return this.appendQueryParams(previewUrl, queryParams);
  }

  private buildPreviewContextQueryParams(): Record<string, string> {
    const selectedPageId = this.selectedPage()?.id?.trim();
    const previewMode = this.isStandalonePreviewMode() ? (this.isDraftPreviewMode() ? 'draft' : 'published') : '';
    const returnTo = this.router.serializeUrl(
      this.router.createUrlTree([this.isStandalonePreviewMode() ? '/page-builder/preview' : '/page-builder'], {
        queryParams: {
          ...(selectedPageId ? { page: selectedPageId } : {}),
          ...(previewMode ? { preview: previewMode } : {}),
        },
      }),
    );

    return {
      ...(selectedPageId ? { page: selectedPageId } : {}),
      ...(previewMode ? { preview: previewMode } : {}),
      ...(returnTo ? { returnTo } : {}),
    };
  }

  private persistPreviewState(prefix: 'form-preview' | 'report-preview', asset: FormBuilderAsset | ReportBuilderAsset): string {
    const stateKey = `${prefix}-${asset.id}-${crypto.randomUUID()}`;
    localStorage.setItem(stateKey, JSON.stringify(asset));
    return stateKey;
  }

  private resolveFormPreviewAsset(value: string): FormBuilderAsset | null {
    const normalizedValue = value.trim().toLowerCase();
    if (!normalizedValue) {
      return null;
    }

    return this.formBuilderFacade.forms().find((candidate) =>
      candidate.id.trim().toLowerCase() === normalizedValue ||
      candidate.name.trim().toLowerCase() === normalizedValue ||
      candidate.shortCode.trim().toLowerCase() === normalizedValue,
    ) ?? null;
  }

  private resolveReportPreviewAsset(value: string): ReportBuilderAsset | null {
    const normalizedValue = value.trim().toLowerCase();
    if (!normalizedValue) {
      return null;
    }

    return this.reportBuilderFacade.reports().find((candidate) =>
      candidate.id.trim().toLowerCase() === normalizedValue ||
      candidate.name.trim().toLowerCase() === normalizedValue ||
      candidate.shortCode.trim().toLowerCase() === normalizedValue,
    ) ?? null;
  }

  private navigateToPageBuilderPage(pageId: string, openIn: ButtonActionOpenIn, queryParams: string): void {
    const basePath = this.isStandalonePreviewMode() ? '/page-builder/preview' : '/page-builder';
    const baseQueryParams: Record<string, string> = {
      page: pageId,
      ...this.parseQueryParams(queryParams),
    };

    if (this.isStandalonePreviewMode()) {
      baseQueryParams['preview'] = this.isDraftPreviewMode() ? 'draft' : 'published';
    }

    const queryString = this.appendQueryParams(
      `${basePath}?page=${encodeURIComponent(pageId)}${this.isStandalonePreviewMode() ? `&preview=${encodeURIComponent(baseQueryParams['preview'])}` : ''}`,
      queryParams,
    );

    if (openIn === 'same-window') {
      this.pageBuilderFacade.selectPage(pageId);
      void this.router.navigate([basePath], {
        queryParams: baseQueryParams,
      });
      return;
    }

    if (openIn === 'popup') {
      window.open(queryString, 'page-builder-action', 'noopener,noreferrer,width=960,height=720');
      return;
    }

    window.open(queryString, '_blank', 'noopener,noreferrer');
  }

  private appendQueryParams(url: string, queryParams: string): string {
    const trimmedParams = queryParams.trim();
    if (!trimmedParams) {
      return url;
    }

    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}${trimmedParams.replace(/^\?/, '')}`;
  }

  private parseQueryParams(queryParams: string): Record<string, string> {
    const trimmedParams = queryParams.trim().replace(/^\?/, '');
    if (!trimmedParams) {
      return {};
    }

    return trimmedParams.split('&').reduce<Record<string, string>>((acc, pair) => {
      const [rawKey, rawValue = ''] = pair.split('=');
      const key = decodeURIComponent(rawKey ?? '').trim();
      if (!key) {
        return acc;
      }

      acc[key] = decodeURIComponent(rawValue);
      return acc;
    }, {});
  }

  private openActionUrl(url: string, openIn: ButtonActionOpenIn): void {
    if (openIn === 'same-window') {
      window.location.assign(url);
      return;
    }

    if (openIn === 'popup') {
      window.open(url, 'page-builder-action', 'noopener,noreferrer,width=960,height=720');
      return;
    }

    window.open(url, '_blank', 'noopener,noreferrer');
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }
}
