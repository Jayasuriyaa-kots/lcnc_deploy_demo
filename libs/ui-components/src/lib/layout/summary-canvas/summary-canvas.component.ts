import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export interface QoSummaryCanvasRow {
  name: string;
  type: string;
  binding: string;
  flags: string;
}

@Component({
  selector: 'qo-summary-canvas',
  standalone: true,
  templateUrl: './summary-canvas.component.html',
  styleUrl: './summary-canvas.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QoSummaryCanvasComponent {
  readonly eyebrow = input.required<string>();
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly datasource = input('qo_hrms_prod Ã‚Â· employees');
  readonly sectionLabel = input('Form Fields');
  readonly primaryAction = input('Save & Publish');
  readonly secondaryAction = input('Preview');
  readonly rows = input<QoSummaryCanvasRow[]>([]);
}
