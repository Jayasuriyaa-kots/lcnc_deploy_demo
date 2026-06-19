import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageBuilderFormPreviewPageComponent as FeaturePageBuilderFormPreviewPageComponent } from '@builder/features/page-builder/containers/page-builder-form-preview-page.component';

@Component({
  selector: 'app-page-builder-form-preview-route-page',
  standalone: true,
  imports: [FeaturePageBuilderFormPreviewPageComponent],
  template: `<app-page-builder-form-preview-page></app-page-builder-form-preview-page>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageBuilderFormPreviewRoutePageComponent {}
