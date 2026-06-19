import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormPreviewModalComponent } from '@builder/features/form-builder/components';
import { FormBuilderAsset } from '@builder/features/form-builder/services/form-builder-facade.service';
import { injectFormBuilderTranslate } from '@builder/features/form-builder/services/form-builder-i18n.service';
import { provideTranslocoScope } from '@jsverse/transloco';

@Component({
  selector: 'app-form-preview-page',
  standalone: true,
  providers: provideTranslocoScope('form-builder'),
  imports: [CommonModule, FormPreviewModalComponent],
  template: `
    <div class="form-preview-page">
      @if (form()) {
        <app-form-preview-modal
          [formId]="form()!.id"
          [formName]="form()!.name"
          [formDescription]="form()!.description"
          [datasourceId]="form()!.datasourceId"
          [datasourceLabel]="form()!.datasourceLabel"
          [queryId]="form()!.queryId"
          [queryLabel]="form()!.queryLabel"
          [queryText]="form()!.queryText"
          [userId]="form()!.userId"
          [jwtToken]="form()!.jwtToken"
          [fields]="form()!.fields"
          [actions]="form()!.actions"
          [settings]="form()!.settings"
          (closed)="closeTab()">
        </app-form-preview-modal>
      } @else {
        <div class="form-preview-page__empty">
          {{ t('previewPage.stateNotFound') }}
        </div>
      }
    </div>
  `,
  styles: [`
    .form-preview-page {
      min-height: 100vh;
      background: var(--qo-color-neutral-100);
    }

    .form-preview-page__empty {
      padding: 20px;
      color: var(--qo-color-neutral-700);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormPreviewPageComponent {
  protected readonly t = injectFormBuilderTranslate();
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly form = signal<FormBuilderAsset | null>(null);

  constructor() {
    const stateKey = this.route.snapshot.queryParamMap.get('stateKey');
    if (stateKey && /^form-preview-[a-zA-Z0-9_-]+-[a-f0-9-]{36}$/.test(stateKey)) {
      const raw = localStorage.getItem(stateKey);
      if (!raw) {
        return;
      }

      try {
        this.form.set(JSON.parse(raw) as FormBuilderAsset);
      } finally {
        localStorage.removeItem(stateKey);
      }
    }
  }

  closeTab(): void {
    const returnTo = this.route.snapshot.queryParamMap.get('returnTo');

    if (returnTo) {
      void this.router.navigateByUrl(returnTo);
      return;
    }

    window.close();
    void this.router.navigate(['/form-builder']);
  }
}
