import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'qo-workflow-page-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './workflow-page-header.component.html',
  styleUrl: './workflow-page-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QoWorkflowPageHeaderComponent {
  breadcrumb = input<string>('Workflow Builder');
  title = input.required<string>();
  subtitle = input<string>('');
}
