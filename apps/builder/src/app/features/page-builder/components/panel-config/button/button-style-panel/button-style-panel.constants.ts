export type ButtonStyleToggle = 'bold' | 'italic' | 'underline';
export type ButtonTone = 'filled' | 'outlined' | 'ghost';
export type ButtonBoxType = 'rectangular' | 'rounded';
export type NumericStyleField =
  | 'cornerRadius'
  | 'strokeWidth'
  | 'paddingTop'
  | 'paddingRight'
  | 'paddingBottom'
  | 'paddingLeft'
  | 'marginTop'
  | 'marginRight'
  | 'marginBottom'
  | 'marginLeft';

export interface StyleSelectOption {
  label: string;
  value: string;
}

export const fontFamilyOptions: StyleSelectOption[] = [
  { label: 'Plus Jakarta Sans', value: 'var(--qo-font-family-sans)' },
  { label: 'JetBrains Mono', value: 'var(--qo-font-family-mono)' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Helvetica', value: 'Helvetica, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Times New Roman', value: '"Times New Roman", serif' },
];

export const fontSizeOptions: StyleSelectOption[] = [
  { label: '12 px', value: 'var(--qo-text-xs)' },
  { label: '14 px', value: 'var(--qo-text-sm)' },
  { label: '16 px', value: 'var(--qo-text-base)' },
  { label: '18 px', value: 'var(--qo-text-lg)' },
  { label: '20 px', value: 'var(--qo-text-xl)' },
  { label: '24 px', value: 'var(--qo-text-2xl)' },
];

export const colorPickerPalette = [
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
  'var(--qo-color-warning-100)',
  'var(--qo-color-success-500)',
  'var(--qo-color-info-500)',
  'var(--qo-color-info-100)',
  'var(--qo-color-primary-100)',
  'var(--qo-color-primary-500)',
  'var(--qo-color-primary-100)',
];
