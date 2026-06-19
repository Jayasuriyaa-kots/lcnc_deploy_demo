
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import { BuilderModuleLink } from '@qo/ui-components/lib/shell/builder-shell.models';

@Component({
  selector: 'qo-builder-topbar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './builder-topbar.component.html',
  styleUrl: './builder-topbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QoBuilderTopbarComponent {
  readonly modules = input.required<BuilderModuleLink[]>();
  readonly activeRoute = input.required<string>();
}
