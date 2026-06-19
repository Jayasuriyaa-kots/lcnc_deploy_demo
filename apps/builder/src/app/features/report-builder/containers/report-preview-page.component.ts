import { ChangeDetectionStrategy, Component, ViewChild, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReportBuilderAsset, ReportBuilderColumn, ReportBuilderFacade } from '@builder/features/report-builder/facades/report-builder.facade';
import { PreviewRecord } from '@builder/features/report-builder/models/report-builder.models';
import { ReportPreviewModalComponent } from '@builder/features/report-builder/components/report-preview-modal/report-preview-modal.component';
import { QoButtonComponent } from '@qo/ui-components';


import { ReportBuilderI18nService } from '../services/report-builder-i18n.service';
@Component({
  selector: 'app-report-preview-page',
  standalone: true,
  imports: [ReportPreviewModalComponent, QoButtonComponent],
  templateUrl: './report-preview-page.component.html',
  styleUrl: './report-preview-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * Standalone preview page (opened in a new tab). Loads the report snapshot handed
 * off via a one-time storage key, renders it through the preview modal as a page,
 * and offers a desktop/tablet/mobile viewport toggle.
 */
export class ReportPreviewPageComponent {
  private readonly i18n = inject(ReportBuilderI18nService);
  protected readonly t = this.i18n.t.bind(this.i18n);
  protected readonly common = this.i18n.common.bind(this.i18n);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly facade = inject(ReportBuilderFacade);

  @ViewChild(ReportPreviewModalComponent)
  private previewModal?: ReportPreviewModalComponent;

  readonly selectedViewport = signal<'desktop' | 'tablet' | 'mobile'>('desktop');

  private readonly viewportWidths: Record<'desktop' | 'tablet' | 'mobile', number> = {
    desktop: 1280,
    tablet: 820,
    mobile: 390,
  };

  /** Fixed canvas width for tablet/mobile (null = fluid desktop). */
  readonly viewportWidth = computed(() => {
    const vp = this.selectedViewport();
    return vp === 'desktop' ? null : this.viewportWidths[vp];
  });

  readonly report = signal<ReportBuilderAsset | null>(null);
  readonly pageSize = signal<number>(20);
  /** Visible columns of the previewed report. */
  readonly visibleColumns = computed<ReportBuilderColumn[]>(() =>
    (this.report()?.columns ?? []).filter((column) => column.visible)
  );
  /** Preview rows built for the previewed report. */
  readonly records = computed<PreviewRecord[]>(() =>
    this.facade.buildPreviewRecords(this.report())
  );

  constructor() {
    // Read page size + the report snapshot handed off via query params / storage.
    const parsedPageSize = Number(this.route.snapshot.queryParamMap.get('pageSize') ?? '20');
    if (Number.isFinite(parsedPageSize) && parsedPageSize > 0) {
      this.pageSize.set(Math.floor(parsedPageSize));
    }

    const stateKey = this.route.snapshot.queryParamMap.get('stateKey');
    if (stateKey && /^report-preview-[a-zA-Z0-9_-]+-[a-f0-9-]{36}$/.test(stateKey)) {
      const raw = localStorage.getItem(stateKey);
      if (!raw) {
        return;
      }

      try {
        this.report.set(JSON.parse(raw) as ReportBuilderAsset);
      } finally {
        localStorage.removeItem(stateKey);
      }
    }
  }

  /** Navigates back to the report builder edit view. */
  goToBuilder(): void {
    void this.router.navigate(['/report-builder']);
  }

  /** Closes the preview tab (or first dismisses an open overlay in the modal). */
  closeTab(): void {
    if (this.previewModal?.dismissOpenOverlay()) {
      return;
    }

    const returnTo = this.route.snapshot.queryParamMap.get('returnTo');

    if (returnTo) {
      void this.router.navigateByUrl(returnTo);
      return;
    }

    window.close();
    void this.router.navigate(['/report-builder']);
  }
}
