import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { injectFormBuilderTranslate } from '@builder/features/form-builder/services/form-builder-i18n.service';
import { QoButtonComponent, QoIconComponent, QoInputComponent } from '@qo/ui-components';
import { LibraryField } from '@builder/features/form-builder/models/form-builder.models';
import { mapBuilderMaterialIcon } from '@builder/features/form-builder/utils/form-builder-field.util';
import {
  FORM_BUILDER_ADVANCED_FIELDS,
  FORM_BUILDER_BASIC_FIELDS
} from '@builder/features/form-builder/config/form-builder.config';
@Component({
  selector: 'app-form-field-library',
  standalone: true,
  imports: [CommonModule, QoButtonComponent, QoIconComponent, QoInputComponent],
  templateUrl: './form-field-library.component.html',
  styleUrl: './form-field-library.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormFieldLibraryComponent {
  protected readonly t = injectFormBuilderTranslate();

  readonly searchQuery = input('');
  readonly fieldAdded = output<LibraryField>();
  readonly closed = output<void>();

  readonly basicFields = FORM_BUILDER_BASIC_FIELDS;
  readonly advancedFields = FORM_BUILDER_ADVANCED_FIELDS;
  readonly searchTerm = signal('');

  readonly filteredBasic = computed(() => this.filterFields(this.basicFields));
  readonly filteredAdvanced = computed(() => this.filterFields(this.advancedFields));

  // Updates search text from a native input event.
  updateSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  // Updates search text from Qo input value output.
  updateSearchValue(value: string): void {
    this.searchTerm.set(value);
  }

  // Emits the selected library field to the page container.
  addField(field: LibraryField): void {
    this.fieldAdded.emit(field);
  }

  // Closes the field library side panel.
  close(): void {
    this.closed.emit();
  }

  // Maps Material icon names into the shared Qo icon set.
  getFieldIconName(icon: string): string {
    return mapBuilderMaterialIcon(icon);
  }

  // Filters library fields by label or field type.
  private filterFields(fields: LibraryField[]): LibraryField[] {
    const query = (this.searchTerm() || this.searchQuery()).trim().toLowerCase();
    if (!query) return fields;
    const q = query.toLowerCase();
    return fields.filter(f => f.label.toLowerCase().includes(q) || f.type.toLowerCase().includes(q));
  }
}

