export type TextBlockVariant =
  | 'none'
  | 'text'
  | 'number'
  | 'email'
  | 'password'
  | 'url'
  | 'file'
  | 'currency'
  | 'date'
  | 'richtext'
  | 'labeltext';

export interface TextBlockWidgetPreset {
  variant: TextBlockVariant;
  label: string;
  placeholder: string;
}

export const TEXT_BLOCK_WIDGET_PRESETS: readonly TextBlockWidgetPreset[] = [
  {
    variant: 'text',
    label: 'Input Type Text',
    placeholder: 'Enter text',
  },
  {
    variant: 'number',
    label: 'Input Type Phone Number',
    placeholder: 'Enter phone number',
  },
  {
    variant: 'file',
    label: 'File Picker',
    placeholder: 'No file chosen',
  },
  {
    variant: 'date',
    label: 'Input Type Date',
    placeholder: 'dd/mm/yyyy hh:mm',
  },
  {
    variant: 'currency',
    label: 'Input Type Currency',
    placeholder: 'Enter amount',
  },
  {
    variant: 'richtext',
    label: 'Input Type Rich Text',
    placeholder: 'Start writing...',
  },
  {
    variant: 'labeltext',
    label: 'Label Text Widget',
    placeholder: 'Sample text content',
  },
] as const;

export function getTextBlockWidgetPreset(variant: TextBlockVariant): TextBlockWidgetPreset {
  return (
    TEXT_BLOCK_WIDGET_PRESETS.find((preset) => preset.variant === variant) ??
    TEXT_BLOCK_WIDGET_PRESETS[0]
  );
}
