import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostListener, inject } from '@angular/core';
import {
  FormActionButtonsComponent,
  FormFieldLibraryComponent,
  FormFieldsListComponent,
  FormPreviewModalComponent,
  FormSettingsModalComponent,
  FormSubmissionViewerModalComponent,
} from '@builder/features/form-builder/components';
import {
  FormCreateWizardComponent,
  FormFieldInspectorComponent,
} from '@builder/features/form-builder/containers';
import { FormBuilderPageFacade } from '@builder/features/form-builder/facades/form-builder-page.facade';
import { injectFormBuilderTranslate } from '@builder/features/form-builder/services/form-builder-i18n.service';
import {
  QoBadgeComponent,
  QoButtonComponent,
  QoConfirmDialogComponent,
  QoEmptyStateComponent,
  QoFormFieldComponent,
  QoInputComponent,
} from '@qo/ui-components';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-form-builder-page',
  standalone: true,
  providers: [FormBuilderPageFacade],
  imports: [
    CommonModule,
    FormFieldsListComponent,
    FormFieldLibraryComponent,
    FormFieldInspectorComponent,
    FormActionButtonsComponent,
    FormCreateWizardComponent,
    FormPreviewModalComponent,
    FormSettingsModalComponent,
    FormSubmissionViewerModalComponent,
    QoBadgeComponent,
    QoButtonComponent,
    QoConfirmDialogComponent,
    QoEmptyStateComponent,
    QoFormFieldComponent,
    QoInputComponent,
    TranslocoPipe,
  ],
  templateUrl: './form-builder-page.component.html',
  styleUrl: './form-builder-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormBuilderPageComponent {
  protected readonly t = injectFormBuilderTranslate();
  protected readonly page = inject(FormBuilderPageFacade);

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.page.onEscape();
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.page.onWindowResize();
  }
}
