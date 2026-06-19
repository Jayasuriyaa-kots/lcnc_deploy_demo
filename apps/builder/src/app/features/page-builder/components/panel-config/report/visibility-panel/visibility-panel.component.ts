import { ChangeDetectionStrategy, Component, effect, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { QoCardComponent, QoToggleComponent } from '@qo/ui-components';

export interface VisibilityItem {
  label: string;
  key: string;
  value: boolean;
}

export interface VisibilitySection {
  title: string;
  items: VisibilityItem[];
}

import { injectPageBuilderTranslate } from '@builder/features/page-builder/services/page-builder-i18n.service';

@Component({
  selector: 'app-visibility-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, QoCardComponent, QoToggleComponent],
  templateUrl: './visibility-panel.component.html',
  styleUrl: './visibility-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VisibilityPanelComponent {
  protected readonly t = injectPageBuilderTranslate();
  readonly sections = input<VisibilitySection[]>([]);
  readonly allowPublicAccess = input(false);
  readonly visibilityChange = output<{ key: string; value: boolean }>();
  readonly allowPublicAccessChange = output<boolean>();
  private readonly controls = new Map<string, FormControl<boolean>>();
  readonly publicAccessControl = new FormControl(false, { nonNullable: true });

  constructor() {
    effect(() => {
      this.controls.clear();
      this.publicAccessControl.setValue(this.allowPublicAccess(), { emitEvent: false });

      for (const section of this.sections()) {
        for (const item of section.items) {
          this.controls.set(
            item.key,
            new FormControl(item.value, { nonNullable: true })
          );
        }
      }
    });
  }

  toggle(item: VisibilityItem, value: boolean): void {
    this.controlFor(item).setValue(value, { emitEvent: false });
    this.visibilityChange.emit({ key: item.key, value });
  }

  togglePublicAccess(value: boolean): void {
    this.allowPublicAccessChange.emit(value);
  }

  controlFor(item: VisibilityItem): FormControl<boolean> {
    const control = this.controls.get(item.key);

    if (control) {
      return control;
    }

    const nextControl = new FormControl(item.value, { nonNullable: true });
    this.controls.set(item.key, nextControl);
    return nextControl;
  }
}
