import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import {
  createDefaultPanelWidgetConfig,
  PanelWidgetConfig,
} from '@builder/features/page-builder/models/page-builder-canvas.model';
import { UiPanelWidgetComponent } from '@builder/features/page-builder/components/widget-showcase/panel/ui-panel/ui-panel-widget.component';

const PANEL_ACCENT_CORAL = 'var(--qo-color-danger-500)';
const PANEL_ACCENT_SUCCESS = 'var(--qo-color-success-500)';
const PANEL_ACCENT_INFO = 'var(--qo-color-info-500)';
const PANEL_ACCENT_INFO_SOFT = 'var(--qo-color-info-100)';
const PANEL_ACCENT_WARNING = 'var(--qo-color-warning-500)';
const PANEL_ICON_FOREGROUND = 'var(--qo-color-neutral-0)';

export interface PanelShowcaseDragItem {
  label: string;
  panelConfig: PanelWidgetConfig;
}

interface PanelShowcasePreset {
  readonly id: string;
  readonly label: string;
  readonly panelConfig: PanelWidgetConfig;
}

@Component({
  selector: 'app-panel-showcase',
  standalone: true,
  imports: [UiPanelWidgetComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './panel-showcase.component.html',
  styleUrl: './panel-showcase.component.scss',
})
export class PanelShowcaseComponent {
  readonly previewDragStart = output<PanelShowcaseDragItem>();
  readonly previewDragEnd = output<void>();

  readonly presets: PanelShowcasePreset[] = [
    {
      id: 'panel-01',
      label: 'New employees this month',
      panelConfig: {
        ...createDefaultPanelWidgetConfig(),
        title: 'New employees this month',
        subtitle: 'New employees this month',
        value: '385',
        valueColor: PANEL_ACCENT_CORAL,
        layoutVariant: 'simple-value-top',
      },
    },
    {
      id: 'panel-02',
      label: 'New employees this month',
      panelConfig: {
        ...createDefaultPanelWidgetConfig(),
        title: 'New employees this month',
        subtitle: 'New employees this month',
        value: '385',
        valueColor: PANEL_ACCENT_CORAL,
        layoutVariant: 'simple-value-bottom',
      },
    },
    {
      id: 'panel-03',
      label: 'Open tickets today',
      panelConfig: {
        ...createDefaultPanelWidgetConfig(),
        title: 'Open tickets today',
        subtitle: 'Open tickets today',
        value: '120',
        iconSymbol: 'confirmation_number',
        iconBackgroundColor: PANEL_ACCENT_SUCCESS,
        iconColor: PANEL_ICON_FOREGROUND,
        valueColor: PANEL_ACCENT_SUCCESS,
        layoutVariant: 'icon-center-value-top',
      },
    },
    {
      id: 'panel-04',
      label: 'Open tickets today',
      panelConfig: {
        ...createDefaultPanelWidgetConfig(),
        title: 'Open tickets today',
        subtitle: 'Open tickets today',
        value: '120',
        iconSymbol: 'confirmation_number',
        iconBackgroundColor: PANEL_ACCENT_SUCCESS,
        iconColor: PANEL_ICON_FOREGROUND,
        valueColor: PANEL_ACCENT_SUCCESS,
        layoutVariant: 'icon-center-value-bottom',
      },
    },
    {
      id: 'panel-05',
      label: 'Deals won',
      panelConfig: {
        ...createDefaultPanelWidgetConfig(),
        title: 'Deals won',
        value: '943',
        subtitle: 'Deals won',
        iconSymbol: 'groups',
        iconBackgroundColor: PANEL_ACCENT_INFO,
        iconColor: PANEL_ICON_FOREGROUND,
        valueColor: PANEL_ACCENT_INFO,
        layoutVariant: 'icon-left-value-top',
      },
    },
    {
      id: 'panel-06',
      label: 'Deals won',
      panelConfig: {
        ...createDefaultPanelWidgetConfig(),
        title: 'Deals won',
        value: '943',
        subtitle: 'Deals won',
        iconSymbol: 'groups',
        iconBackgroundColor: PANEL_ACCENT_INFO,
        iconColor: PANEL_ICON_FOREGROUND,
        valueColor: PANEL_ACCENT_INFO,
        layoutVariant: 'icon-left-value-bottom',
      },
    },
    {
      id: 'panel-07',
      label: 'All requests',
      panelConfig: {
        ...createDefaultPanelWidgetConfig(),
        title: 'All requests',
        value: '248',
        subtitle: 'All requests',
        iconSymbol: 'mail',
        iconBackgroundColor: PANEL_ACCENT_INFO_SOFT,
        iconColor: PANEL_ICON_FOREGROUND,
        valueColor: PANEL_ACCENT_INFO_SOFT,
        layoutVariant: 'icon-right-value-top',
      },
    },
    {
      id: 'panel-08',
      label: 'All requests',
      panelConfig: {
        ...createDefaultPanelWidgetConfig(),
        title: 'All requests',
        value: '248',
        subtitle: 'All requests',
        iconSymbol: 'mail',
        iconBackgroundColor: PANEL_ACCENT_INFO_SOFT,
        iconColor: PANEL_ICON_FOREGROUND,
        valueColor: PANEL_ACCENT_INFO_SOFT,
        layoutVariant: 'icon-right-value-bottom',
      },
    },
    {
      id: 'panel-09',
      label: 'Region performance in this quarter',
      panelConfig: {
        ...createDefaultPanelWidgetConfig(),
        title: 'Region performance in this quarter',
        value: '15%',
        subtitle: 'Region performance in this quarter',
        iconSymbol: 'monitoring',
        iconBackgroundColor: PANEL_ACCENT_WARNING,
        iconColor: PANEL_ICON_FOREGROUND,
        valueColor: PANEL_ACCENT_WARNING,
        layoutVariant: 'icon-inline-center-title-top',
      },
    },
    {
      id: 'panel-10',
      label: 'Region performance in this quarter',
      panelConfig: {
        ...createDefaultPanelWidgetConfig(),
        title: 'Region performance in this quarter',
        value: '15%',
        subtitle: 'Region performance in this quarter',
        iconSymbol: 'monitoring',
        iconBackgroundColor: PANEL_ACCENT_WARNING,
        iconColor: PANEL_ICON_FOREGROUND,
        valueColor: PANEL_ACCENT_WARNING,
        layoutVariant: 'icon-inline-center-title-bottom',
      },
    },
    {
      id: 'panel-11',
      label: 'Total visitors',
      panelConfig: {
        ...createDefaultPanelWidgetConfig(),
        title: 'Total visitors',
        value: '10',
        subtitle: 'Total visitors',
        iconSymbol: 'person_add',
        iconBackgroundColor: PANEL_ACCENT_CORAL,
        iconColor: PANEL_ICON_FOREGROUND,
        valueColor: PANEL_ACCENT_CORAL,
        layoutVariant: 'icon-inline-split-title-top',
      },
    },
    {
      id: 'panel-12',
      label: 'Total visitors',
      panelConfig: {
        ...createDefaultPanelWidgetConfig(),
        title: 'Total visitors',
        value: '10',
        subtitle: 'Total visitors',
        iconSymbol: 'person_add',
        iconBackgroundColor: PANEL_ACCENT_CORAL,
        iconColor: PANEL_ICON_FOREGROUND,
        valueColor: PANEL_ACCENT_CORAL,
        layoutVariant: 'icon-inline-split-title-bottom',
      },
    },
  ];

  startDrag(event: DragEvent, preset: PanelShowcasePreset): void {
    const payload: PanelShowcaseDragItem = {
      label: preset.label,
      panelConfig: {
        ...preset.panelConfig,
      },
    };

    this.previewDragStart.emit(payload);
    event.dataTransfer?.setData('text/plain', JSON.stringify(payload));
  }

  endDrag(): void {
    this.previewDragEnd.emit();
  }
}
