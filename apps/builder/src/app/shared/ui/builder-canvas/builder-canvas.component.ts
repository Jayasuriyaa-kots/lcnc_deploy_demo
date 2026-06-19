import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

interface BuilderFieldRow {
  name: string;
  type: string;
  binding: string;
  flags: string;
}

@Component({
  selector: 'app-builder-canvas',
  standalone: true,
  imports: [],
  templateUrl: './builder-canvas.component.html',
  styleUrl: './builder-canvas.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BuilderCanvasComponent {
  readonly eyebrow = input.required<string>();
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly datasource = input('qo_hrms_prod · employees');
  readonly sectionLabel = input('Form Fields');
  readonly primaryAction = input('Save & Publish');
  readonly secondaryAction = input('Preview');
  readonly rows = input<BuilderFieldRow[]>([]);
}
