import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PageBuilderFormMockService } from '@builder/features/page-builder/services/page-builder-form-mock.service';
import { injectPageBuilderTranslate } from '@builder/features/page-builder/services/page-builder-i18n.service';
import { MockSchemaService } from '@builder/core/services/mock-schema.service';
import { FormWidgetConfig, FormWidgetFieldPreview } from '@builder/features/page-builder/models/page-builder-canvas.model';
import { QoButtonComponent } from '@qo/ui-components';

@Component({
  selector: 'app-page-builder-form-preview-page',
  standalone: true,
  imports: [CommonModule, QoButtonComponent],
  templateUrl: './page-builder-form-preview-page.component.html',
  styleUrl: './page-builder-form-preview-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageBuilderFormPreviewPageComponent {
  protected readonly t = injectPageBuilderTranslate();
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly mockSchemaService = inject(MockSchemaService);
  private readonly formMock = inject(PageBuilderFormMockService);

  readonly formId = computed(() => this.route.snapshot.queryParamMap.get('formId') ?? '');
  readonly widgetId = computed(() => `page-builder-form-preview-${this.formId()}`);
  readonly formConfig = computed<FormWidgetConfig | null>(() =>
    this.mockSchemaService.formConfigs().find((config) => config.formId === this.formId()) ?? null,
  );

  trackFormField(index: number, field: FormWidgetFieldPreview): string {
    return field.id || `${index}`;
  }

  getFieldValue(field: FormWidgetFieldPreview): string {
    return this.formMock.getFieldValue(this.widgetId(), field.id);
  }

  onFieldInput(field: FormWidgetFieldPreview, event: Event): void {
    const target = event.target as HTMLInputElement | HTMLSelectElement | null;
    this.formMock.updateFieldValue(this.widgetId(), field.id, target?.value ?? '');
  }

  submitForm(event: Event, formConfig: FormWidgetConfig): void {
    event.preventDefault();
    this.formMock.submitForm(this.widgetId(), formConfig);
  }

  resetForm(event: Event, formConfig: FormWidgetConfig): void {
    event.preventDefault();
    this.formMock.resetDraft(this.widgetId(), formConfig);
  }

  getFormSubmissionCount(formConfig: FormWidgetConfig): number {
    return this.formMock.getSubmissionCount(formConfig.formId);
  }

  showSuccessMessage(formConfig: FormWidgetConfig): boolean {
    return this.formMock.wasLastSubmitted(this.widgetId()) && !!formConfig.submitConfig.successMessage.trim();
  }

  getFormInputType(field: FormWidgetFieldPreview): string {
    switch (field.type) {
      case 'email':
        return 'email';
      case 'date':
        return 'date';
      case 'number':
      case 'currency':
        return 'number';
      case 'password':
        return 'password';
      case 'url':
        return 'url';
      default:
        return 'text';
    }
  }

  isSelectLikeField(field: FormWidgetFieldPreview): boolean {
    return field.type === 'dropdown' || field.options.length > 0;
  }

  closeTab(): void {
    const pageId = this.route.snapshot.queryParamMap.get('page')?.trim() ?? '';
    const previewMode = this.route.snapshot.queryParamMap.get('preview')?.trim() ?? '';
    const returnTo = this.route.snapshot.queryParamMap.get('returnTo')?.trim() ?? '';

    if (window.opener) {
      window.close();
      return;
    }

    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    if (returnTo) {
      window.location.assign(returnTo);
      return;
    }

    if (pageId) {
      void this.router.navigate(['/page-builder/preview'], {
        queryParams: {
          page: pageId,
          ...(previewMode ? { preview: previewMode } : {}),
        },
      });
      return;
    }

    void this.router.navigate(['/page-builder']);
  }
}
