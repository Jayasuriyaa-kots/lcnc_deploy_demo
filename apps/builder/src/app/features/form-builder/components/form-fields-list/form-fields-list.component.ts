import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { CdkDragDrop, CdkDrag, CdkDropList, CdkDragHandle, CdkDragPreview, CdkDragPlaceholder } from '@angular/cdk/drag-drop';
import { QoButtonComponent } from '@qo/ui-components';
import { BuilderField } from '@builder/features/form-builder/models/form-builder.models';
import { injectFormBuilderTranslate } from '@builder/features/form-builder/services/form-builder-i18n.service';

export interface FieldDropEvent {
  previousIndex: number;
  currentIndex: number;
}

type FieldFlagKey = 'required' | 'optional' | 'unique' | 'lookup';

@Component({
  selector: 'app-form-fields-list',
  standalone: true,
  imports: [CommonModule, CdkDropList, CdkDrag, CdkDragHandle, CdkDragPreview, CdkDragPlaceholder, QoButtonComponent],
  templateUrl: './form-fields-list.component.html',
  styleUrl: './form-fields-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormFieldsListComponent {
  protected readonly t = injectFormBuilderTranslate();

  readonly fields = input<BuilderField[]>([]);
  readonly selectedFieldId = input<string | null>(null);
  readonly draggedIndex = signal<number | null>(null);
  readonly dropTargetIndex = signal<number | null>(null);

  readonly fieldSelected = output<BuilderField>();
  readonly fieldInspect = output<BuilderField>();
  readonly fieldDeleted = output<string>();
  readonly fieldMoved = output<{ fieldId: string; direction: -1 | 1 }>();
  readonly fieldDropped = output<FieldDropEvent>();
  readonly addFieldClicked = output<void>();

  // Emits the selected field for canvas/inspector selection.
  selectField(field: BuilderField): void {
    this.fieldSelected.emit(field);
  }

  // Opens inspector without triggering row selection bubbling.
  openInspector(field: BuilderField, event: Event): void {
    event.stopPropagation();
    this.fieldInspect.emit(field);
  }

  // Emits field deletion request without triggering row selection bubbling.
  deleteField(fieldId: string, event: Event): void {
    event.stopPropagation();
    this.fieldDeleted.emit(fieldId);
  }

  // Emits keyboard/button reorder request.
  moveField(fieldId: string, direction: -1 | 1, event: Event): void {
    event.stopPropagation();
    this.fieldMoved.emit({ fieldId, direction });
  }

  startDrag(index: number, event: DragEvent): void {
    this.draggedIndex.set(index);
    this.dropTargetIndex.set(null);

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', String(index));
    }
  }

  dragOver(index: number, event: DragEvent): void {
    const draggedIndex = this.draggedIndex();

    if (draggedIndex === null || draggedIndex === index) {
      return;
    }

    event.preventDefault();
    this.dropTargetIndex.set(index);

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  onDrop(targetIndex: number, event: DragEvent): void {
    event.preventDefault();

    const previousIndex = this.draggedIndex();
    if (previousIndex === null || previousIndex === targetIndex) {
      this.clearDragState();
      return;
    }

    this.fieldDropped.emit({
      previousIndex,
      currentIndex: targetIndex,
    });
    this.clearDragState();
  }

  clearDragState(): void {
    this.draggedIndex.set(null);
    this.dropTargetIndex.set(null);
  }

  // Builds small status flags shown on each field row.
  getFlags(field: BuilderField): FieldFlagKey[] {
    const flags: FieldFlagKey[] = [];
    flags.push(field.properties.required ? 'required' : 'optional');
    if (field.properties.unique) flags.push('unique');
    if (field.properties.lookup) flags.push('lookup');
    return flags;
  }

}

