import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { BuilderModuleLink } from '@builder/core/models/builder-shell.model';
import { DeploymentFacadeService } from '@builder/features/deployment/facades/deployment.facade';
import { FormBuilderFacadeService } from '@builder/features/form-builder/services/form-builder-facade.service';
import { PageBuilderFacade } from '@builder/features/page-builder/facades/page-builder.facade';
import { ReportBuilderFacade } from '@builder/features/report-builder/facades/report-builder.facade';
import { QoButtonComponent, QoIconComponent, QoToastService } from '@qo/ui-components';

@Component({
  selector: 'app-builder-topbar',
  standalone: true,
  imports: [RouterModule, QoButtonComponent, QoIconComponent],
  templateUrl: './builder-topbar.component.html',
  styleUrl: './builder-topbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BuilderTopbarComponent {
  private readonly deploymentFacade = inject(DeploymentFacadeService);

  readonly modules = input.required<BuilderModuleLink[]>();
  readonly activeRoute = input.required<string>();
  readonly applicationName = input('');
  readonly deploymentSaveState = this.deploymentFacade.saveState;
  readonly deploymentSaveLabel = this.deploymentFacade.saveButtonLabel;

  constructor(
    private readonly router: Router,
    private readonly formBuilderState: FormBuilderFacadeService,
    private readonly pageBuilderFacade: PageBuilderFacade,
    private readonly reportBuilderState: ReportBuilderFacade,
    private readonly toast: QoToastService,
  ) {}

  save(): void {
    const activeRoute = this.activeRoute();

    if (activeRoute.startsWith('/deployment')) {
      this.deploymentFacade.saveDeploymentLayout();
      return;
    }

    if (activeRoute.startsWith('/form-builder')) {
      this.formBuilderState.saveFormsState();
      this.toast.success('Form saved');
      return;
    }

    if (!activeRoute.startsWith('/page-builder/edit')) {
      this.toast.info('Nothing to save on this screen');
      return;
    }

    this.pageBuilderFacade.saveDraft();
    this.toast.success('Page draft saved');
    void this.router.navigate(['/page-builder']);
  }

  preview(): void {
    const activeRoute = this.activeRoute();

    if (activeRoute.startsWith('/deployment')) {
      this.deploymentFacade.openPreview();
      return;
    }

    if (activeRoute.startsWith('/form-builder')) {
      if (this.formBuilderState.createWizardOpen()) {
        this.toast.info('Finish or cancel form creation before previewing');
        return;
      }

      const activeForm = this.formBuilderState.selectedForm();
      if (!activeForm) {
        this.toast.info('Select a form to preview');
        return;
      }

      this.formBuilderState.openPreview();
      return;
    }

    if (activeRoute.startsWith('/report-builder')) {
      const activeReport = this.reportBuilderState.selectedReport();
      if (!activeReport) {
        this.toast.info('Select a report to preview');
        return;
      }

      this.reportBuilderState.openPreview();
      return;
    }

    if (activeRoute.startsWith('/page-builder')) {
      const selectedPageId = this.pageBuilderFacade.selectedPageId();
      if (!selectedPageId) {
        this.toast.info('Select a page to preview');
        return;
      }

      const previewMode = activeRoute.startsWith('/page-builder/edit') ? 'draft' : 'published';
      if (previewMode === 'draft') {
        this.pageBuilderFacade.setDraftWidgets(this.pageBuilderFacade.canvasWidgets());
      }
      const previewUrl = this.router.serializeUrl(
        this.router.createUrlTree(['/page-builder/preview'], {
          queryParams: {
            page: selectedPageId,
            preview: previewMode,
          },
        }),
      );

      window.open(previewUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    this.toast.info('Preview is not available from this screen yet');
  }

  deploy(): void {
    const activeRoute = this.activeRoute();

    if (activeRoute.startsWith('/deployment/mobile')) {
      this.deploymentFacade.saveDeploymentLayout(false);
      void this.router.navigate(['/mobile-preview']);
      return;
    }

    if (activeRoute.startsWith('/deployment')) {
      this.deploymentFacade.saveDeploymentLayout(false);
      this.deploymentFacade.openDeployedApp();
      return;
    }

    if (activeRoute.startsWith('/form-builder')) {
      const activeForm = this.formBuilderState.selectedForm();
      if (!activeForm) {
        this.toast.info('Select a form to deploy');
        return;
      }

      if (activeForm.status === 'live') {
        this.toast.info('Form is already live');
        return;
      }

      this.formBuilderState.publishForm(activeForm.id);
      this.toast.success('Form deployed');
      return;
    }

    this.toast.info('Deploy is not available from this screen yet');
  }
}

