import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { QoButtonComponent, QoInputComponent, QoSelectComponent, SelectOption } from '@qo/ui-components';
import { ButtonStyleConfig, createDefaultButtonStyleConfig } from '@builder/features/page-builder/models/page-builder-canvas.model';
import { ButtonStylePanelComponent } from '@builder/features/page-builder/components/panel-config/button/button-style-panel';
import { PropertiesTab } from '@builder/features/page-builder/models/page-builder-panel-state.model';
import { injectPageBuilderTranslate } from '@builder/features/page-builder/services/page-builder-i18n.service';

type ActionType = 'open-url' | 'open-form' | 'open-report' | 'open-page';
type OpenInTarget = 'new-window' | 'same-window';

@Component({
  selector: 'app-properties-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonStylePanelComponent, QoButtonComponent, QoInputComponent, QoSelectComponent, TranslocoPipe],
  templateUrl: './properties-panel.component.html',
  styleUrl: './properties-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertiesPanelComponent {
  protected readonly t = injectPageBuilderTranslate();
  readonly label = input('Button');
  readonly styleConfig = input<ButtonStyleConfig>(createDefaultButtonStyleConfig());
  readonly activeTab = input<PropertiesTab>('display');
  readonly initialTab = input<PropertiesTab | undefined>(undefined);
  readonly showTabs = input(true);
  readonly isButtonGroup = input(false);
  readonly buttonGroupLabels = input<string[]>([]);

  readonly labelChange = output<string>();
  readonly styleConfigChange = output<ButtonStyleConfig>();
  readonly buttonGroupLabelsChange = output<string[]>();
  readonly deleteRequested = output<void>();
  readonly activeTabChange = output<PropertiesTab>();

  private readonly formBuilder = inject(FormBuilder);
  readonly actionForm = this.formBuilder.nonNullable.group({
    label: 'Button',
    actionType: 'open-form' as ActionType,
    url: '',
    form: 'Staff In',
    report: 'Staff In Report',
    page: 'Dashboard',
    queryParams: '',
    openIn: 'new-window' as OpenInTarget,
  });

  readonly formOptions: SelectOption[] = [
    { value: 'Staff In', label: 'Staff In' },
    { value: 'Employee Leave Application Form', label: 'Employee Leave Application Form' },
    { value: 'Attendance Form', label: 'Attendance Form' },
    { value: 'fdfsd', label: 'fdfsd' },
  ];
  readonly reportOptions: SelectOption[] = [
    { value: 'Staff In Report', label: 'Staff In Report' },
    { value: 'All Employee Leave Applications', label: 'All Employee Leave Applications' },
    { value: 'All Attendances', label: 'All Attendances' },
  ];
  readonly pageOptions: SelectOption[] = [
    { value: 'Dashboard', label: 'Dashboard' },
    { value: 'Attendance Summary', label: 'Attendance Summary' },
    { value: 'Leave Overview', label: 'Leave Overview' },
  ];
  readonly actionTargetLabel = computed<'Form' | 'Report' | 'Page'>(() => {
    switch (this.actionForm.controls.actionType.value) {
      case 'open-report':
        return 'Report';
      case 'open-page':
        return 'Page';
      default:
        return 'Form';
    }
  });

  readonly actionTargetOptions = computed<SelectOption[]>(() => {
    switch (this.actionForm.controls.actionType.value) {
      case 'open-report':
        return this.reportOptions;
      case 'open-page':
        return this.pageOptions;
      default:
        return this.formOptions;
    }
  });

  constructor() {
    effect(() => {
      this.actionForm.controls.label.setValue(this.label() || 'Button', { emitEvent: false });
    }, { allowSignalWrites: true });

    effect(() => {
      const nextTab = this.initialTab();
      if (nextTab && nextTab !== this.activeTab()) {
        this.activeTabChange.emit(nextTab);
      }
    }, { allowSignalWrites: true });
  }

  buttonGroupItems(): string[] {
    const labels = this.buttonGroupLabels().filter((label) => label.trim().length > 0);
    return labels.length ? labels : ['Button 1', 'Button 2'];
  }

  currentActionTargetControl(): FormControl<string> {
    switch (this.actionForm.controls.actionType.value) {
      case 'open-report':
        return this.actionForm.controls.report;
      case 'open-page':
        return this.actionForm.controls.page;
      default:
        return this.actionForm.controls.form;
    }
  }

  localStyleConfig(): ButtonStyleConfig {
    return this.styleConfig();
  }

  actionTypeOptions(): SelectOption[] {
    return [
      { value: 'open-url', label: this.t('panelConfig.openUrl') },
      { value: 'open-form', label: this.t('panelConfig.openForm') },
      { value: 'open-report', label: this.t('panelConfig.openReport') },
      { value: 'open-page', label: this.t('panelConfig.openPage') },
    ];
  }

  openInOptions(): SelectOption[] {
    return [
      { value: 'new-window', label: this.t('common.newWindow') },
      { value: 'same-window', label: this.t('common.sameWindow') },
    ];
  }

  setTab(tab: PropertiesTab): void {
    this.activeTabChange.emit(tab);
  }

  updateLabel(value: string): void {
    const nextValue = value.trim() || 'Button';
    this.actionForm.controls.label.setValue(nextValue, { emitEvent: false });
    this.labelChange.emit(nextValue);
  }

  onActionTypeChange(value: string | number): void {
    this.actionForm.controls.actionType.setValue(value as ActionType);
  }

  onActionTargetChange(value: string | number): void {
    const nextValue = String(value);

    switch (this.actionForm.controls.actionType.value) {
      case 'open-report':
        this.actionForm.controls.report.setValue(nextValue);
        break;
      case 'open-page':
        this.actionForm.controls.page.setValue(nextValue);
        break;
      default:
        this.actionForm.controls.form.setValue(nextValue);
        break;
    }
  }

  updateStyleConfig(config: ButtonStyleConfig): void {
    this.styleConfigChange.emit(config);
  }

  updateButtonGroupLabel(index: number, value: string): void {
    const nextLabels = [...this.buttonGroupItems()];
    nextLabels[index] = value.trim() || `Button ${index + 1}`;
    this.buttonGroupLabelsChange.emit(nextLabels);
  }

  addButtonGroupLabel(): void {
    const nextLabels = [...this.buttonGroupItems(), `Button ${this.buttonGroupItems().length + 1}`];
    this.buttonGroupLabelsChange.emit(nextLabels);
  }

  removeButtonGroupLabel(index: number): void {
    const nextLabels = this.buttonGroupItems().filter((_, itemIndex) => itemIndex !== index);
    this.buttonGroupLabelsChange.emit(nextLabels.length ? nextLabels : ['Button 1']);
  }

  deleteElement(): void {
    this.deleteRequested.emit();
  }
}
