import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { QoIconComponent } from '../../primitives/icon/icon.component';

@Component({
  selector: 'qo-file-upload',
  standalone: true,
  imports: [QoIconComponent],
  template: `
    <label class="qo-file-upload" [class.qo-file-upload-disabled]="disabled()">
      <span class="qo-file-upload-icon" aria-hidden="true">
        <qo-icon [name]="icon()" size="sm"></qo-icon>
      </span>
      <span class="qo-file-upload-label">{{ label() }}</span>
      <input
        class="qo-file-upload-input"
        type="file"
        [accept]="accept()"
        [multiple]="multiple()"
        [disabled]="disabled()"
        (change)="onFileChange($event)"
      />
    </label>
  `,
  styleUrl: './file-upload.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QoFileUploadComponent {
  readonly accept = input('*');
  readonly multiple = input(false);
  readonly maxSizeMb = input(10);
  readonly disabled = input(false);
  readonly label = input('Choose file');
  readonly icon = input('plus');

  readonly filesSelected = output<File[]>();
  readonly uploadError = output<string>();

  onFileChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement | null;
    const files = Array.from(inputElement?.files ?? []);
    const maxSizeBytes = this.maxSizeMb() * 1024 * 1024;
    const oversizedFile = files.find((file) => file.size > maxSizeBytes);

    if (oversizedFile) {
      this.uploadError.emit(`${oversizedFile.name} exceeds the ${this.maxSizeMb()} MB limit.`);
      inputElement!.value = '';
      return;
    }

    this.filesSelected.emit(files);
  }
}
