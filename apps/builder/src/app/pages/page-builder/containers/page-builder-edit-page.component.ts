import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageBuilderEditPageComponent as FeaturePageBuilderEditPageComponent } from '@builder/features/page-builder/containers/page-builder-edit-page.component';

@Component({
  selector: 'app-page-builder-edit-route-page',
  standalone: true,
  imports: [FeaturePageBuilderEditPageComponent],
  template: `<app-page-builder-edit-page></app-page-builder-edit-page>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageBuilderEditRoutePageComponent {}
