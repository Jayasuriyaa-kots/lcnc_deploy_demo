import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export interface QoBreadcrumbItem {
  label: string;
}

@Component({
  selector: 'qo-breadcrumb',
  standalone: true,
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QoBreadcrumbComponent {
  readonly items = input<readonly QoBreadcrumbItem[]>([]);
}
