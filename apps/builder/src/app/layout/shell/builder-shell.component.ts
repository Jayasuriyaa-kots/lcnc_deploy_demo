import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterModule, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { BuilderContextFacadeService } from '@qo/api-client';
import { BuilderContext } from '@qo/models';
import { BUILDER_MODULE_CONFIG, BUILDER_MODULE_LINKS } from '@builder/shared/constants/builder-shell.data';
import { BuilderSidebarComponent } from '@builder/layout/sidebar/builder-sidebar.component';
import { BuilderStatusbarComponent } from '../statusbar/builder-statusbar.component';
import { BuilderTopbarComponent } from '@builder/layout/topbar/builder-topbar.component';

@Component({
  selector: 'app-builder-shell',
  standalone: true,
  imports: [
    RouterModule,
    RouterOutlet,
    BuilderTopbarComponent,
    BuilderSidebarComponent,
    BuilderStatusbarComponent,
  ],
  templateUrl: './builder-shell.component.html',
  styleUrl: './builder-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BuilderShellComponent {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly builderContextFacade = inject(BuilderContextFacadeService);

  readonly moduleLinks = BUILDER_MODULE_LINKS;
  readonly currentRoute = signal('/form-builder');
  readonly builderContext = this.builderContextFacade.context;
  readonly activeModule = computed(() => {
    if (this.currentRoute().startsWith('/page-builder/edit')) {
      return BUILDER_MODULE_CONFIG['page-builder-edit'];
    }

    const activeLink = this.moduleLinks.find((moduleLink) => this.currentRoute().startsWith(moduleLink.route));
    return activeLink ? BUILDER_MODULE_CONFIG[activeLink.id] : BUILDER_MODULE_CONFIG['form-builder'];
  });

  constructor() {
    this.currentRoute.set(this.router.url === '/' ? '/form-builder' : this.router.url);
    this.syncBuilderContext();

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.currentRoute.set(this.router.url);
        this.syncBuilderContext();
      });
  }

  private syncBuilderContext(): void {
    const queryParamMap = this.activatedRoute.snapshot.queryParamMap;
    const applicationId = queryParamMap.get('applicationId');
    const organisationId = queryParamMap.get('organisationId');
    const applicationName = queryParamMap.get('applicationName');

    if (applicationId && organisationId && applicationName) {
      const builderContext: BuilderContext = {
        applicationId,
        organisationId,
        applicationName
      };

      this.builderContextFacade.setContext(builderContext);
      return;
    }

    this.builderContextFacade.loadContext();
  }
}
