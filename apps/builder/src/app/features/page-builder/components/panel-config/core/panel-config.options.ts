import { SelectOption } from '@qo/ui-components';

export const PANEL_CONFIG_COLOR_PICKER_PALETTE = [
  'var(--qo-color-neutral-0)',
  'var(--qo-color-neutral-50)',
  'var(--qo-color-neutral-200)',
  'var(--qo-color-neutral-400)',
  'var(--qo-color-neutral-500)',
  'var(--qo-color-neutral-600)',
  'var(--qo-color-neutral-800)',
  'var(--qo-color-neutral-900)',
  'var(--qo-color-warning-100)',
  'var(--qo-color-danger-100)',
  'var(--qo-color-warning-500)',
  'var(--qo-color-success-500)',
  'var(--qo-color-info-500)',
  'var(--qo-color-info-100)',
  'var(--qo-color-primary-100)',
  'var(--qo-color-primary-500)',
  'var(--qo-color-primary-700)',
] as const;

export const PANEL_CONFIG_TEXT_PRESETS = [
  { label: '345', color: 'var(--qo-color-danger-500)' },
  { label: '120', color: 'var(--qo-color-success-500)' },
  { label: '943', color: 'var(--qo-color-info-500)' },
  { label: '248', color: 'var(--qo-color-info-100)' },
] as const;

export const PANEL_CONFIG_TEXT_STYLES = [
  { label: 'Heading 1', fontWeight: 'bold', fontSize: 'var(--qo-text-2xl)' },
  { label: 'Heading 2', fontWeight: '600', fontSize: 'var(--qo-text-lg)' },
  { label: 'Normal Text', fontWeight: 'normal', fontSize: 'var(--qo-text-sm)' },
  { label: 'Bold Text', fontWeight: 'bold', fontSize: 'var(--qo-text-sm)' },
] as const;

export const PANEL_CONFIG_REPORT_OPERATOR_OPTIONS = [
  { value: '', label: '- Select Operator -' },
  { value: 'equals', label: 'is' },
  { value: 'notEquals', label: 'is not' },
  { value: 'contains', label: 'contains' },
] as const;

export const PANEL_CONFIG_ROW_CLICK_ACTION_OPTIONS: SelectOption[] = [
  { value: 'none', label: 'None' },
  { value: 'open-form', label: 'Open form' },
  { value: 'open-report', label: 'Open dataframe' },
  { value: 'open-page', label: 'Open page' },
];

export const PANEL_CONFIG_TEXT_BLOCK_FONT_FAMILY_OPTIONS = [
  { value: 'system-ui, sans-serif', label: 'System Default' },
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: '"Times New Roman", serif', label: 'Times New Roman' },
  { value: '"Courier New", monospace', label: 'Monospace' },
] as const;

export const PANEL_CONFIG_TEXT_BLOCK_LINE_HEIGHT_OPTIONS = [
  { value: '1.2', label: 'Tight    1.2' },
  { value: '1.5', label: 'Normal    1.5' },
  { value: '1.8', label: 'Relaxed    1.8' },
  { value: '2', label: 'Loose    2.0' },
] as const;

export const PANEL_CONFIG_TEXT_BLOCK_LETTER_SPACING_OPTIONS = [
  { value: '-0.05em', label: 'Tighter    -0.05em' },
  { value: '-0.025em', label: 'Tight    -0.025em' },
  { value: 'normal', label: 'Normal    normal' },
  { value: '0.05em', label: 'Wide    0.05em' },
  { value: '0.1em', label: 'Wider    0.1em' },
] as const;

export const PANEL_CONFIG_WINDOW_TARGET_OPTIONS: SelectOption[] = [
  { value: 'new-window', label: 'New window' },
  { value: 'same-window', label: 'Same window' },
  { value: 'popup', label: 'Popup' },
];

export const PANEL_CONFIG_FUNCTION_OPTIONS: SelectOption[] = [
  { value: 'validateForm()', label: 'validateForm()' },
  { value: 'sendEmail()', label: 'sendEmail()' },
  { value: 'saveData()', label: 'saveData()' },
];

export const PANEL_CONFIG_BOARD_LAYOUT_OPTIONS: SelectOption[] = [
  { value: 'list', label: 'List' },
  { value: 'grid', label: 'Grid' },
];

export const PANEL_CONFIG_BOARD_IMAGE_SOURCE_OPTIONS: SelectOption[] = [
  { value: 'none', label: 'None' },
  { value: 'my-library', label: 'My library' },
  { value: 'web-link', label: 'Web link' },
];

export const PANEL_CONFIG_ACTION_OPTIONS = [
  { id: 'none', label: 'None', description: 'No action configured', icon: '' },
  { id: 'open-url', label: 'Open url', description: 'Opens the specified url', icon: '' },
  { id: 'open-form', label: 'Open form', description: 'Opens the selected form', icon: '' },
  { id: 'open-report', label: 'Open dataframe', description: 'Opens the selected dataframe', icon: '' },
  { id: 'open-page', label: 'Open page', description: 'Opens the selected page', icon: '' },
] as const;
