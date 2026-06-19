import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { QoButtonComponent, QoInputComponent } from '@qo/ui-components';
import { DeploymentFacadeService } from '../facades/deployment.facade';

@Component({
  selector: 'app-preferences-page',
  standalone: true,
  imports: [QoButtonComponent, QoInputComponent],
  templateUrl: './preferences-page.component.html',
  styleUrl: './preferences-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreferencesPageComponent {
  private readonly facade = inject(DeploymentFacadeService);

  readonly colourTokens = this.facade.colourTokens;
  readonly behaviourSettings = this.facade.behaviourSettings;
}
