import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { injectFormBuilderTranslate } from '@builder/features/form-builder/services/form-builder-i18n.service';

@Component({
  selector: 'app-file-upload-field-renderer',
  standalone: true,
  template: `<input class="preview-field__control" type="file" [accept]="accept()" [multiple]="multiple()" (change)="fileSelected.emit($event)" />`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileUploadFieldRendererComponent {
  protected readonly t = injectFormBuilderTranslate();
  readonly accept = input('');
  readonly multiple = input(false);
  readonly fileSelected = output<Event>();
}
