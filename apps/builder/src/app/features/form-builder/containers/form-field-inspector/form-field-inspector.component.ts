import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation, effect, inject, input, output, signal } from '@angular/core';
import { QoButtonComponent, QoIconComponent } from '@qo/ui-components';
import { BuilderField } from '@builder/features/form-builder/models/form-builder.models';
import { FormFieldInspectorUtilsService } from './form-field-inspector-utils.service';
import { FormBuilderFieldPolicyService } from '@builder/features/form-builder/services/field-policy/form-builder-field-policy.service';
import { FormBuilderI18nService } from '@builder/features/form-builder/services/form-builder-i18n.service';
import { FormFieldInspectorDateMediaSectionComponent } from './sections/form-field-inspector-date-media-section.component';
import { FormFieldInspectorIdentitySectionComponent } from './sections/form-field-inspector-identity-section.component';
import { FormFieldInspectorSecuritySectionComponent } from './sections/form-field-inspector-security-section.component';
import { FormFieldInspectorHandlers } from './form-field-inspector.handlers';
import {
  INSPECTOR_VISIBILITY_OPTIONS,
  INSPECTOR_WIDTH_OPTIONS,
  INSPECTOR_COUNTRY_CODES,
  INSPECTOR_EDITOR_DISPLAY_OPTIONS,
  INSPECTOR_DECISION_INITIAL_OPTIONS,
  INSPECTOR_DATE_INITIAL_MODE_OPTIONS,
  INSPECTOR_IMAGE_SOURCE_OPTIONS,
  INSPECTOR_IMAGE_UPLOAD_TYPE_OPTIONS,
  INSPECTOR_FILE_UPLOAD_TYPE_OPTIONS,
  INSPECTOR_URL_TARGET_OPTIONS,
  INSPECTOR_DESCRIPTION_MODE_OPTIONS,
  INSPECTOR_FIELD_LAYOUT_OPTIONS,
  INSPECTOR_TOOLBAR_OPTION_KEYS,
  INSPECTOR_WEEKDAY_OPTIONS,
} from './form-field-inspector.config';

@Component({
  selector: 'app-form-field-inspector',
  standalone: true,
  imports: [
    CommonModule,
    QoButtonComponent,
    QoIconComponent,
    FormFieldInspectorIdentitySectionComponent,
    FormFieldInspectorDateMediaSectionComponent,
    FormFieldInspectorSecuritySectionComponent
  ],
  templateUrl: './form-field-inspector.component.html',
  styleUrl: './form-field-inspector.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class FormFieldInspectorComponent {
  private readonly utils = inject(FormFieldInspectorUtilsService);
  private readonly fieldPolicy = inject(FormBuilderFieldPolicyService);
  private readonly i18n = inject(FormBuilderI18nService);

  protected readonly t = this.i18n.t.bind(this.i18n);
  readonly inspectorContext: FormFieldInspectorHandlers;
  readonly field = input<BuilderField | null>(null);
  readonly closed = output<void>();
  readonly fieldChanged = output<BuilderField>();
  readonly activeField = signal<BuilderField | null>(null);
  readonly visibilityOptions = INSPECTOR_VISIBILITY_OPTIONS;
  readonly widthOptions = INSPECTOR_WIDTH_OPTIONS;
  readonly countryCodes = INSPECTOR_COUNTRY_CODES;
  readonly editorDisplayOptions = INSPECTOR_EDITOR_DISPLAY_OPTIONS;
  readonly decisionInitialOptions = INSPECTOR_DECISION_INITIAL_OPTIONS;
  readonly dateInitialModeOptions = INSPECTOR_DATE_INITIAL_MODE_OPTIONS;
  readonly imageSourceOptions = INSPECTOR_IMAGE_SOURCE_OPTIONS;
  readonly imageUploadTypeOptions = INSPECTOR_IMAGE_UPLOAD_TYPE_OPTIONS;
  readonly fileUploadTypeOptions = INSPECTOR_FILE_UPLOAD_TYPE_OPTIONS;
  readonly urlTargetOptions = INSPECTOR_URL_TARGET_OPTIONS;
  readonly descriptionModeOptions = INSPECTOR_DESCRIPTION_MODE_OPTIONS;
  readonly fieldLayoutOptions = INSPECTOR_FIELD_LAYOUT_OPTIONS;
  readonly toolbarOptionKeys = INSPECTOR_TOOLBAR_OPTION_KEYS;
  readonly weekdayOptions = INSPECTOR_WEEKDAY_OPTIONS;

  constructor() {
    this.inspectorContext = new FormFieldInspectorHandlers(
      this.utils,
      this.fieldPolicy,
      this.i18n,
      (field) => this.fieldChanged.emit(field),
      {
        visibilityOptions: this.visibilityOptions,
        widthOptions: this.widthOptions,
        countryCodes: this.countryCodes,
        editorDisplayOptions: this.editorDisplayOptions,
        decisionInitialOptions: this.decisionInitialOptions,
        dateInitialModeOptions: this.dateInitialModeOptions,
        imageSourceOptions: this.imageSourceOptions,
        imageUploadTypeOptions: this.imageUploadTypeOptions,
        fileUploadTypeOptions: this.fileUploadTypeOptions,
        urlTargetOptions: this.urlTargetOptions,
        descriptionModeOptions: this.descriptionModeOptions,
        fieldLayoutOptions: this.fieldLayoutOptions,
        toolbarOptionKeys: this.toolbarOptionKeys,
        weekdayOptions: this.weekdayOptions,
      },
    );

    effect(() => {
      const incoming = this.field();
      const current = this.activeField();
      if (!incoming) { this.activeField.set(null); return; }
      if (!current || current.id !== incoming.id) {
        this.activeField.set(this.utils.cloneField(incoming));
      }
    });
  }

  close(): void { this.closed.emit(); }

  getFieldIconName(icon: string): string {
    return this.inspectorContext.getFieldIconName(icon);
  }
}
