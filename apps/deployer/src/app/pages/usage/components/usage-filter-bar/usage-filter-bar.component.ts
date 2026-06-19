import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { QoButtonComponent } from '@qo/ui-components';

@Component({
  selector: 'app-usage-filter-bar',
  standalone: true,
  imports: [QoButtonComponent],
  
  templateUrl: './usage-filter-bar.component.html',
  styleUrl: './usage-filter-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsageFilterBarComponent {
  readonly filters = input.required<readonly string[]>();
}
