export type SnippetVariant = 'html' | 'embed';

export interface SnippetWidgetPreset {
  id: string;
  variant: SnippetVariant;
  title: string;
  description: string;
  badge: string;
  highlighted?: boolean;
}

export const SNIPPET_WIDGET_PRESETS: readonly SnippetWidgetPreset[] = [
  {
    id: 'html',
    variant: 'html',
    title: 'HTML snippet',
    description: 'Create custom views with HTML and Deluge optimised for web.',
    badge: 'HTML',
  },
  {
    id: 'embed',
    variant: 'embed',
    title: 'Embed',
    description: 'Defines a container for any external link.',
    badge: '</>',
  },
] as const;

export function getSnippetWidgetPreset(variant: SnippetVariant): SnippetWidgetPreset {
  return (
    SNIPPET_WIDGET_PRESETS.find((preset) => preset.variant === variant) ??
    SNIPPET_WIDGET_PRESETS[0]
  );
}
