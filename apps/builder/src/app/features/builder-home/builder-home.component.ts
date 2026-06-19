import { Component, ChangeDetectionStrategy } from '@angular/core';
import { QoSummaryCanvasComponent } from '@qo/ui-components';

@Component({
  selector: 'app-builder-home',
  standalone: true,
  imports: [QoSummaryCanvasComponent],
  template: `
    <qo-summary-canvas
      eyebrow="Builder Home"
      title="QuantaOps Builder Base"
      description="This is the new standalone shell where the form, report, and page builders will be migrated."
      sectionLabel="Next Steps"
      primaryAction="Start Building"
      secondaryAction="Review Layout"
      [rows]="rows"
    ></qo-summary-canvas>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BuilderHomeComponent {
  readonly rows = [
    { name: 'Shell Layout', type: 'Foundation', binding: 'layout/topbar/sidebar/statusbar', flags: 'ready' },
    { name: 'Form Builder', type: 'Migration', binding: 'DashboardApp forms module', flags: 'next' },
    { name: 'Report Builder', type: 'Migration', binding: 'DashboardApp reports module', flags: 'queued' },
    { name: 'Page Builder', type: 'Migration', binding: 'DashboardApp pages module', flags: 'queued' }
  ];
}

