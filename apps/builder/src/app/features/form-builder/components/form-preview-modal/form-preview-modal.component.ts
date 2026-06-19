import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { BuilderAction, BuilderField } from '@builder/features/form-builder/models/form-builder.models';
import { FormPreviewContentComponent } from '@builder/features/form-builder/containers/form-preview-content/form-preview-content.component';
import { injectFormBuilderTranslate } from '@builder/features/form-builder/services/form-builder-i18n.service';
import { FormSettings } from '@builder/features/form-builder/components/form-preview-modal/models/form-preview-modal.models';

export type { FormSettings } from '@builder/features/form-builder/components/form-preview-modal/models/form-preview-modal.models';

@Component({
  selector: 'app-form-preview-modal',
  standalone: true,
  imports: [FormPreviewContentComponent],
  templateUrl: './form-preview-modal.component.html',
  styleUrl: './form-preview-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormPreviewModalComponent {
  protected readonly t = injectFormBuilderTranslate();
  readonly formNameInput = input('', { alias: 'formName' });
  readonly formDescriptionInput = input('', { alias: 'formDescription' });
  readonly formIdInput = input('', { alias: 'formId' });
  readonly datasourceIdInput = input('', { alias: 'datasourceId' });
  readonly datasourceLabelInput = input('', { alias: 'datasourceLabel' });
  readonly queryIdInput = input('', { alias: 'queryId' });
  readonly queryLabelInput = input('', { alias: 'queryLabel' });
  readonly queryTextInput = input('', { alias: 'queryText' });
  readonly userIdInput = input('', { alias: 'userId' });
  readonly jwtTokenInput = input('', { alias: 'jwtToken' });
  readonly fieldsInput = input<BuilderField[]>([], { alias: 'fields' });
  readonly actionsInput = input<BuilderAction[]>([], { alias: 'actions' });
  readonly settingsInput = input<FormSettings>({
    formLayout: 'Single Column',
    labelPlacement: 'Top',
    showSectionBorders: false,
    submitBehavior: 'Show Message',
    redirectUrl: '',
    duplicateDetection: 'None'
  }, { alias: 'settings' });

  readonly closed = output<void>();

  // Emits close to the parent page; preview content owns the form behavior.
  close(): void {
    this.closed.emit();
  }
}
