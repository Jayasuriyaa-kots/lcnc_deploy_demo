import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { injectFormBuilderTranslate } from '@builder/features/form-builder/services/form-builder-i18n.service';
import { QoBadgeComponent, QoButtonComponent, QoEmptyStateComponent, QoModalComponent } from '@qo/ui-components';
import { FormSubmissionBucket } from '@builder/features/form-builder/services/form-builder-submission-storage.service';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-form-submission-viewer-modal',
  standalone: true,
  imports: [CommonModule, QoBadgeComponent, QoButtonComponent, QoEmptyStateComponent, QoModalComponent, TranslocoPipe],
  templateUrl: './form-submission-viewer-modal.component.html',
  styleUrl: './form-submission-viewer-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormSubmissionViewerModalComponent {
  protected readonly t = injectFormBuilderTranslate();

  readonly formName = input('');
  readonly submissions = input<FormSubmissionBucket | null>(null);

  readonly closed = output<void>();
  readonly cleared = output<void>();

  readonly selectedSubmissionId = signal<string | null>(null);

  readonly records = computed(() => this.submissions()?.records ?? []);
  // Falls back to the first stored submission when none is explicitly selected.
  readonly selectedRecord = computed(() => {
    const records = this.records();
    const selectedId = this.selectedSubmissionId();
    return records.find((record) => record.submissionId === selectedId) ?? records[0] ?? null;
  });

  // Closes the submission viewer modal.
  close(): void {
    this.closed.emit();
  }

  // Requests clearing all local preview submissions for the form.
  clear(): void {
    this.cleared.emit();
  }

  // Selects one submission record for detail view.
  selectSubmission(submissionId: string): void {
    this.selectedSubmissionId.set(submissionId);
  }

  // Tracks submission rows by stable id.
  trackRecord(index: number, record: NonNullable<FormSubmissionBucket>['records'][number]): string {
    return record.submissionId || String(index);
  }

  // Pretty-prints a submission record for inspection.
  formatSubmission(record: NonNullable<FormSubmissionBucket>['records'][number] | null): string {
    if (!record) {
      return '';
    }
    return JSON.stringify(record, null, 2);
  }
}
