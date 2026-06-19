import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageBuilderReportPreviewPageComponent as FeaturePageBuilderReportPreviewPageComponent } from '@builder/features/page-builder/containers/page-builder-report-preview-page.component';

@Component({
  selector: 'app-page-builder-report-preview-route-page',
  standalone: true,
  imports: [FeaturePageBuilderReportPreviewPageComponent],
  template: `<app-page-builder-report-preview-page></app-page-builder-report-preview-page>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageBuilderReportPreviewRoutePageComponent {}
