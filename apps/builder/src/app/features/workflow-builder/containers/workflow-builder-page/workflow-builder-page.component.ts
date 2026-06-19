import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-workflow-builder-page',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './workflow-builder-page.component.html',
  styleUrl: './workflow-builder-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkflowBuilderPageComponent {}
