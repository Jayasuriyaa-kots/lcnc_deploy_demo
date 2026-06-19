import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { distinctUntilChanged } from 'rxjs/operators';
import { QoButtonComponent, QoInputComponent } from '@quanta-ops/ui-components';

@Component({
  selector: 'qo-workflow-toolbar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, QoButtonComponent, QoInputComponent],
  templateUrl: './workflow-toolbar.component.html',
  styleUrl: './workflow-toolbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QoWorkflowToolbarComponent {
  createLabel = input<string>('Create');
  searchPlaceholder = input<string>('Search...');
  countLabel = input<string>('');
  searchValue = input<string>('');
  disableCreate = input<boolean>(false);

  create = output<void>();
  searchChange = output<string>();

  protected readonly searchControl = new FormControl('', { nonNullable: true });

  constructor() {
    this.searchControl.valueChanges
      .pipe(distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((value) => {
        this.searchChange.emit(value);
      });

    effect(() => {
      const value = this.searchValue();
      if (this.searchControl.value !== value) {
        this.searchControl.setValue(value, { emitEvent: false });
      }
    });
  }
}
