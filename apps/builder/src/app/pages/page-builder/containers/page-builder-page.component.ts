import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageBuilderPageComponent as FeaturePageBuilderPageComponent } from '@builder/features/page-builder/containers/page-builder-page.component';

@Component({
  selector: 'app-page-builder-route-page',
  standalone: true,
  imports: [FeaturePageBuilderPageComponent],
  template: `<app-page-builder-page></app-page-builder-page>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageBuilderRoutePageComponent {}
