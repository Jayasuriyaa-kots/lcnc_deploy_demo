import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'qo-builder-statusbar',
  standalone: true,
  templateUrl: './builder-statusbar.component.html',
  styleUrl: './builder-statusbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QoBuilderStatusbarComponent {
  readonly statusLabel = input('System Live');
  readonly region = input('ap-south-1');
  readonly tenant = input('Acme Corporation');
  readonly environment = input('Production');
  readonly syncLabel = input('Last sync 2m ago');
  readonly collaboratorsLabel = input('3 collaborators');
}

