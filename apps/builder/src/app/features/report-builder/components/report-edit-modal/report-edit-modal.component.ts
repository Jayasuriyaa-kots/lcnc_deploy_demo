import { ChangeDetectionStrategy, Component, input, output, inject } from '@angular/core';
import { QoButtonComponent, QoIconComponent, QoInputComponent } from '@qo/ui-components';


export interface EditModalField { id: string; label: string; value: string; }

export interface EditModalState {
  reportLabel: string;
  fields: EditModalField[];
}

// Command pattern — all user interactions emitted as a typed union
export type EditModalEvent =
  | { type: 'close' }
  | { type: 'save' }
  | { type: 'fieldChange'; fieldId: string; value: string };

/**
 * Dumb component — accepts state input, emits typed Command events.
 * No service injection. No internal mutable state.
 */
import { ReportBuilderI18nService } from '../../services/report-builder-i18n.service';
@Component({
  selector: 'app-report-edit-modal',
  standalone: true,
  imports: [QoButtonComponent, QoIconComponent, QoInputComponent],
  templateUrl: './report-edit-modal.component.html',
  styleUrl: './report-edit-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportEditModalComponent {
  private readonly i18n = inject(ReportBuilderI18nService);
  protected readonly t = this.i18n.t.bind(this.i18n);
  protected readonly common = this.i18n.common.bind(this.i18n);
  state = input.required<EditModalState>();
  event = output<EditModalEvent>();
}
