import { TranslocoPipe } from '@jsverse/transloco';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  output,
} from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  QoButtonComponent,
  QoInputComponent,
  QoSelectComponent,
  SelectOption,
} from '@qo/ui-components';

export type SearchCriteriaJoiner = 'AND' | 'OR';

export interface SearchCriteriaRow {
  id: string;
  field: string;
  operator: string;
  value: string;
  joiner: SearchCriteriaJoiner;
}

type SearchCriteriaRowFormGroup = FormGroup<{
  id: FormControl<string>;
  field: FormControl<string>;
  operator: FormControl<string>;
  value: FormControl<string>;
  joiner: FormControl<SearchCriteriaJoiner>;
}>;

import { injectPageBuilderTranslate } from '@builder/features/page-builder/services/page-builder-i18n.service';

@Component({
  selector: 'app-search-criteria-modal',
  standalone: true,
  imports: [CommonModule,
    ReactiveFormsModule,
    QoButtonComponent,
    QoInputComponent,
    QoSelectComponent,
    TranslocoPipe,
  ],
  templateUrl: './search-criteria-modal.component.html',
  styleUrl: './search-criteria-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchCriteriaModalComponent {
  protected readonly t = injectPageBuilderTranslate();
  readonly title = input('Selected records');
  readonly rows = input<SearchCriteriaRow[]>([]);
  readonly fieldOptions = input<SelectOption[]>([]);
  readonly operatorOptions = input<SelectOption[]>([]);

  readonly rowsChange = output<SearchCriteriaRow[]>();
  readonly closed = output<void>();
  readonly done = output<SearchCriteriaRow[]>();

  readonly criteriaForm = new FormGroup({
    rows: new FormArray<SearchCriteriaRowFormGroup>([]),
  });
  constructor() {
    effect(() => {
      this.replaceRows(this.normalizeRows(this.rows()));
    });
  }

  get criteriaRows(): SearchCriteriaRow[] {
    return this.rulesArray.controls.map((rowGroup) => ({
      id: rowGroup.controls.id.value,
      field: rowGroup.controls.field.value,
      operator: rowGroup.controls.operator.value,
      value: rowGroup.controls.value.value,
      joiner: rowGroup.controls.joiner.value,
    }));
  }

  get rulesArray(): FormArray<SearchCriteriaRowFormGroup> {
    return this.criteriaForm.controls.rows;
  }

  close(): void {
    this.closed.emit();
  }

  submit(): void {
    this.done.emit(this.cloneRows(this.criteriaRows));
  }

  addCriteriaRow(): void {
    this.updateRows((rows) => [...rows, this.createCriteriaRow('AND')]);
  }

  addCriteriaRowWithJoiner(joiner: SearchCriteriaJoiner): void {
    this.updateRows((rows) => [...rows, this.createCriteriaRow(joiner)]);
  }

  removeCriteriaRow(rowId: string): void {
    this.updateRows((rows) => {
      if (rows.length === 1) {
        return [this.createCriteriaRow('AND', rows[0].id)];
      }

      return rows.filter((row) => row.id !== rowId);
    });
  }

  updateCriteriaField(rowId: string, field: string): void {
    this.updateCriteriaRow(rowId, { field });
  }

  updateCriteriaOperator(rowId: string, operator: string): void {
    this.updateCriteriaRow(rowId, { operator });
  }

  updateCriteriaValue(rowId: string, value: string): void {
    this.updateCriteriaRow(rowId, { value });
  }

  setCriteriaJoiner(rowId: string, joiner: SearchCriteriaJoiner): void {
    this.updateCriteriaRow(rowId, { joiner });
  }

  private updateCriteriaRow(rowId: string, patch: Partial<SearchCriteriaRow>): void {
    this.updateRows((rows) =>
      rows.map((row) => (row.id === rowId ? { ...row, ...patch } : row)),
    );
  }

  private updateRows(updater: (rows: SearchCriteriaRow[]) => SearchCriteriaRow[]): void {
    const nextRows = updater(this.criteriaRows);
    const normalizedRows = this.normalizeRows(nextRows);
    this.replaceRows(normalizedRows);
    this.rowsChange.emit(this.cloneRows(normalizedRows));
  }

  private normalizeRows(rows: SearchCriteriaRow[]): SearchCriteriaRow[] {
    if (!rows.length) {
      return [this.createCriteriaRow('AND')];
    }

    return this.cloneRows(rows);
  }

  private cloneRows(rows: SearchCriteriaRow[]): SearchCriteriaRow[] {
    return rows.map((row) => ({ ...row }));
  }

  private replaceRows(rows: SearchCriteriaRow[]): void {
    this.rulesArray.clear();

    for (const row of rows) {
      this.rulesArray.push(
        new FormGroup({
          id: new FormControl(row.id, { nonNullable: true }),
          field: new FormControl(row.field, { nonNullable: true }),
          operator: new FormControl(row.operator, { nonNullable: true }),
          value: new FormControl(row.value, { nonNullable: true }),
          joiner: new FormControl(row.joiner, { nonNullable: true }),
        })
      );
    }
  }

  private createCriteriaRow(
    joiner: SearchCriteriaJoiner,
    id = `criteria-${Math.random().toString(36).slice(2, 10)}`,
  ): SearchCriteriaRow {
    return {
      id,
      field: '',
      operator: '',
      value: '',
      joiner,
    };
  }
}
