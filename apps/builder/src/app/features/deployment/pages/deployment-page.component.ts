import { Component, ChangeDetectionStrategy } from '@angular/core';
import { QoSummaryCanvasComponent } from '@qo/ui-components';

@Component({
  selector: 'app-deployment-page',
  standalone: true,
  imports: [QoSummaryCanvasComponent],
  template: `
    <qo-summary-canvas
      eyebrow="Deployment"
      title="Release Control"
      description="Prepare environment settings, publishing rules, and release checkpoints for the Builder project."
      sectionLabel="Release Checklist"
      primaryAction="Deploy Build"
      [rows]="rows"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeploymentPageComponent {
  readonly rows = [
    { name: 'Production Target', type: 'Environment', binding: 'ap-south-1', flags: 'live' },
    { name: 'Asset Version', type: 'Release', binding: 'builder-v1', flags: 'current' },
    { name: 'Approval Gate', type: 'Rule', binding: 'release_signoff', flags: 'required' }
  ];
}

