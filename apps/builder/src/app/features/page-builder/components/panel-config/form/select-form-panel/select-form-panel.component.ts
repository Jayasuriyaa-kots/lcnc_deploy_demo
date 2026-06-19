import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { QoButtonComponent } from '@qo/ui-components';

export interface FormItem {
  id: string;
  name: string;
}

@Component({
  selector: 'app-select-form-panel',
  standalone: true,
  imports: [CommonModule, QoButtonComponent],
  templateUrl: './select-form-panel.component.html',
  styleUrl: './select-form-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectFormPanelComponent {
  readonly formSelected = output<FormItem>();
  readonly selectedFormId = input<string | null>(null);
  readonly selectedFormIdChange = output<string | null>();
  readonly forms = input<FormItem[]>([]);
  readonly title = input('Select form');
  readonly footerText = input('Showing all forms in Punith app.');
  readonly footerLinkLabel = input('Change app');

  selectForm(id: string): void {
    this.selectedFormIdChange.emit(id);
    const selectedForm = this.forms().find((form) => form.id === id);
    if (selectedForm) {
      this.formSelected.emit(selectedForm);
    }
  }
}
