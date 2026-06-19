import { BuilderField, BuilderFieldProperties } from '@builder/features/form-builder/models/form-builder.models';

export function slugifyBuilderBinding(value: string): string {
  return (value || 'field')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'field';
}

export function cloneBuilderFieldProperties(properties: BuilderFieldProperties): BuilderFieldProperties {
  return {
    ...properties,
    options: [...properties.options],
    choices: Array.isArray(properties.choices)
      ? properties.choices.map((choice) => typeof choice === 'string' ? choice : ({ ...choice }))
      : [],
    allowedDays: [...properties.allowedDays],
    dateTimeAllowedDays: [...(properties.dateTimeAllowedDays ?? [])],
    prefixChoices: [...properties.prefixChoices],
    suffixChoices: [...properties.suffixChoices],
    displayFieldsName: properties.displayFieldsName ? { ...properties.displayFieldsName } : undefined,
    displayFieldsAddress: properties.displayFieldsAddress ? { ...properties.displayFieldsAddress } : undefined,
    richTextToolbar: properties.richTextToolbar ? { ...properties.richTextToolbar } : undefined,
  };
}

export function cloneBuilderField(field: BuilderField): BuilderField {
  return {
    ...field,
    properties: cloneBuilderFieldProperties(field.properties),
  };
}

export function mapBuilderMaterialIcon(icon: string): string {
  const iconMap: Record<string, string> = {
    person: 'list',
    mail: 'external-link',
    home: 'database',
    call: 'external-link',
    short_text: 'list',
    subject: 'list',
    pin: 'list',
    calendar_month: 'info',
    schedule: 'info',
    arrow_drop_down_circle: 'chevron-down',
    radio_button_checked: 'check',
    checklist: 'check',
    check_box: 'check',
    toggle_on: 'check',
    link: 'external-link',
    percent: 'info',
    calculate: 'database',
    draw: 'palette',
    format_size: 'list',
    image: 'palette',
    payments: 'database',
    event: 'info',
    search_off: 'search',
    close: 'x',
    delete: 'trash',
    tune: 'info',
  };

  return iconMap[icon] ?? 'info';
}
