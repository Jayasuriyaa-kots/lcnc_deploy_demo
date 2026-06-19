import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ExternalApisDashboardComponent } from '@builder/features/datasources/containers/external-apis-dashboard/external-apis-dashboard.component';
import { ExternalApisConnectorsComponent } from '@builder/features/datasources/containers/external-apis-connectors/external-apis-connectors.component';
import { ExternalApisSetupComponent } from '@builder/features/datasources/containers/external-apis-setup/external-apis-setup.component';
import { ExternalApisFacadeService } from '@builder/features/datasources/services/external-apis-facade.service';

@Component({
  selector: 'app-external-apis-page',
  standalone: true,
  imports: [ExternalApisDashboardComponent, ExternalApisConnectorsComponent, ExternalApisSetupComponent],
  templateUrl: './external-apis-page.component.html',
  styleUrl: './external-apis-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExternalApisPageComponent {
  readonly store = inject(ExternalApisFacadeService);
}
