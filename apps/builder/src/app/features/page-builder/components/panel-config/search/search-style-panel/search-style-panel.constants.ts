import { SearchImageSource } from '@builder/features/page-builder/models/page-builder-panel-state.model';

export const fontFamilyOptions = ['Default font', 'Arial', 'Helvetica', 'Georgia', 'Times New Roman', 'Verdana', 'Trebuchet MS'];

export const fontSizeOptions = ['12 px', '13 px', '14 px', '15 px', '16 px', '18 px', '20 px'];

export interface ImageSourceOption {
  value: SearchImageSource;
  label: string;
  description: string;
  icon: string;
}

export const imageSourceOptions: ImageSourceOption[] = [
  { value: 'my-library', label: 'My library', description: 'Upload your own image', icon: 'photo_library' },
  { value: 'web-link', label: 'Web link', description: 'An image url', icon: 'link' },
  { value: 'none', label: 'None', description: 'No background image', icon: 'hide_image' },
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
