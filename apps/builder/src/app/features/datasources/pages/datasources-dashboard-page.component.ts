import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DatasourcesPageComponent } from '@builder/features/datasources/containers/datasources-page.component';

@Component({
  selector: 'app-datasources-dashboard-page',
  standalone: true,
  imports: [DatasourcesPageComponent],
  template: `<app-datasources-page></app-datasources-page>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatasourcesDashboardPageComponent {}
