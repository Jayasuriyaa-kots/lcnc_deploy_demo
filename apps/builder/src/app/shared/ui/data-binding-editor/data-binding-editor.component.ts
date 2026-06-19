import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DataBindingConfig } from '@builder/features/page-builder/models/data-binding.model';
import { BindableInputComponent } from '@builder/shared/ui/bindable-input/bindable-input.component';
import { QoInputComponent } from '@qo/ui-components';

@Component({
  selector: 'app-data-binding-editor',
  standalone: true,
  imports: [CommonModule, BindableInputComponent, QoInputComponent],
  templateUrl: './data-binding-editor.component.html',
  styleUrl: './data-binding-editor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataBindingEditorComponent {
  readonly binding = input.required<DataBindingConfig>();
  readonly bindingRootKeys = input<string[]>([]);

  readonly bindingChange = output<DataBindingConfig>();

  readonly helperExamples = [
    'Active Users',
    '{{datasources.builder_runtime_demo.queries.asset_inventory_table.data[0].occupancy_pct}}',
    '{{widgets.table_1.selectedRow.city}}',
    '{{page.currentUser.name}}',
    '{{count(datasources.builder_runtime_demo.queries.asset_inventory_table.data)}}',
    '{{average(datasources.builder_runtime_demo.queries.asset_inventory_table.data, "occupancy_pct")}}',
  ];

  updateField<K extends keyof DataBindingConfig>(field: K, value: DataBindingConfig[K]): void {
    this.bindingChange.emit({
      ...this.binding(),
      [field]: value,
    });
  }

  updateBindingInput(value: string): void {
    this.bindingChange.emit({
      ...this.binding(),
      expression: value,
      staticValue: value,
    });
  }

  applyExample(example: string): void {
    this.updateBindingInput(example);
  }

  bindingInputValue(): string {
    const binding = this.binding();
    return binding.expression || binding.staticValue || '';
  }
}
