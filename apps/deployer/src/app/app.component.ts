import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DeployerThemeFacadeService } from './core/theme/services/deployer-theme-facade.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  private readonly themeFacade = inject(DeployerThemeFacadeService);

  title = 'deployer';

  constructor() {
    this.themeFacade.loadTheme();
  }
}

