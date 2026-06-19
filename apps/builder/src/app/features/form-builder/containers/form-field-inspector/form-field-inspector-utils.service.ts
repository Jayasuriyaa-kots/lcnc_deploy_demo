import { Injectable } from '@angular/core';
import { BuilderField, BuilderFieldProperties } from '@builder/features/form-builder/models/form-builder.models';

// Stateless utility service for inspector property sync and cloning.
@Injectable({ providedIn: 'root' })
export class FormFieldInspectorUtilsService {

  // Keeps aliased property pairs in sync when one is updated.
  syncCompatProperties(
    field: BuilderField,
    key: keyof BuilderFieldProperties,
    value: string | number | boolean | string[]
  ): void {
    if (key === 'required' || key === 'mandatory') {
      field.properties.required = !!value;
      field.properties.mandatory = !!value;
    }
    if (key === 'unique' || key === 'noDuplicateValues') {
      field.properties.unique = !!value;
      field.properties.noDuplicateValues = !!value;
    }
    if (key === 'width' || key === 'fieldSize') {
      field.properties.width = value as BuilderFieldProperties['width'];
      field.properties.fieldSize = value as BuilderFieldProperties['width'];
    }
    if (key === 'defaultValue' || key === 'initialValue') {
      field.properties.defaultValue = String(value ?? '');
      field.properties.initialValue = String(value ?? '');
    }
    if (key === 'descriptionMode' || key === 'descriptionShow') {
      field.properties.descriptionMode = value as BuilderFieldProperties['descriptionMode'];
      field.properties.descriptionShow = value as BuilderFieldProperties['descriptionShow'];
    }
    if (key === 'phoneCountryCode' || key === 'defaultCountryCode') {
      field.properties.phoneCountryCode = String(value ?? '');
      field.properties.defaultCountryCode = String(value ?? '');
    }
    if (key === 'namePrefixEnabled' || key === 'nameLastEnabled' || key === 'nameSuffixEnabled') {
      field.properties.displayFieldsName = {
        ...(field.properties.displayFieldsName ?? {}),
        prefix: key === 'namePrefixEnabled' ? !!value : (field.properties.displayFieldsName?.prefix ?? field.properties.namePrefixEnabled),
        firstName: true,
        lastName: key === 'nameLastEnabled' ? !!value : (field.properties.displayFieldsName?.lastName ?? field.properties.nameLastEnabled),
        suffix: key === 'nameSuffixEnabled' ? !!value : (field.properties.displayFieldsName?.suffix ?? field.properties.nameSuffixEnabled)
      };
    }
    if (
      key === 'addressLine1Enabled' || key === 'addressLine2Enabled' ||
      key === 'cityEnabled' || key === 'stateEnabled' ||
      key === 'postalCodeEnabled' || key === 'countryEnabled'
    ) {
      field.properties.displayFieldsAddress = {
        ...(field.properties.displayFieldsAddress ?? {}),
        line1: key === 'addressLine1Enabled' ? !!value : (field.properties.displayFieldsAddress?.line1 ?? field.properties.addressLine1Enabled),
        line2: key === 'addressLine2Enabled' ? !!value : (field.properties.displayFieldsAddress?.line2 ?? field.properties.addressLine2Enabled),
        city: key === 'cityEnabled' ? !!value : (field.properties.displayFieldsAddress?.city ?? field.properties.cityEnabled),
        state: key === 'stateEnabled' ? !!value : (field.properties.displayFieldsAddress?.state ?? field.properties.stateEnabled),
        postalCode: key === 'postalCodeEnabled' ? !!value : (field.properties.displayFieldsAddress?.postalCode ?? field.properties.postalCodeEnabled),
        country: key === 'countryEnabled' ? !!value : (field.properties.displayFieldsAddress?.country ?? field.properties.countryEnabled)
      };
    }
    // Legacy string options must stay mirrored as structured choices for preview/runtime.
    if (key === 'options') {
      field.properties.choices = field.properties.options.map((option) => ({ label: option, value: option }));
    }
    if (key === 'allowMultipleFiles' || key === 'fileUploadType') {
      const multiple = key === 'allowMultipleFiles' ? !!value : String(value) === 'Multiple files';
      field.properties.allowMultipleFiles = multiple;
      field.properties.fileUploadType = multiple ? 'Multiple files' : 'Single file';
    }
    if (key === 'imageUploadType') {
      field.properties.allowMultipleFiles = String(value) === 'Multiple images';
    }
    if (key === 'acceptedFileTypes' || key === 'fileUploadTypes') {
      field.properties.acceptedFileTypes = String(value ?? '');
      field.properties.fileUploadTypes = String(value ?? '');
    }
    // Rolls minute/second inputs into one max-duration value stored on the field.
    if (key === 'audioDurationMins' || key === 'audioDurationSecs' || key === 'audioMaxDurationSec') {
      const seconds = key === 'audioMaxDurationSec'
        ? Number(value ?? 0)
        : ((field.properties.audioDurationMins ?? 0) * 60) + (field.properties.audioDurationSecs ?? 0);
      field.properties.audioMaxDurationSec = String(Math.max(Number.isFinite(seconds) ? seconds : 0, 0));
    }
    // Same duration rollup as audio, but for video capture limits.
    if (key === 'videoDurationMins' || key === 'videoDurationSecs' || key === 'videoMaxDurationSec') {
      const seconds = key === 'videoMaxDurationSec'
        ? Number(value ?? 0)
        : ((field.properties.videoDurationMins ?? 0) * 60) + (field.properties.videoDurationSecs ?? 0);
      field.properties.videoMaxDurationSec = String(Math.max(Number.isFinite(seconds) ? seconds : 0, 0));
    }
  }

  // Deep-clones a BuilderField so inspector edits cannot mutate parent state directly.
  cloneField(field: BuilderField): BuilderField {
    return {
      ...field,
      properties: {
        ...field.properties,
        options: [...field.properties.options],
        choices: Array.isArray(field.properties.choices)
          ? field.properties.choices.map((choice) =>
              typeof choice === 'string' ? choice : ({ ...choice })
            )
          : [],
        allowedDays: [...field.properties.allowedDays],
        dateTimeAllowedDays: [...(field.properties.dateTimeAllowedDays ?? [])],
        prefixChoices: [...field.properties.prefixChoices],
        suffixChoices: [...field.properties.suffixChoices],
        displayFieldsName: field.properties.displayFieldsName
          ? { ...field.properties.displayFieldsName }
          : undefined,
        displayFieldsAddress: field.properties.displayFieldsAddress
          ? { ...field.properties.displayFieldsAddress }
          : undefined,
        richTextToolbar: field.properties.richTextToolbar
          ? { ...field.properties.richTextToolbar }
          : undefined
      }
    };
  }

  // Converts a label into a binding-safe identifier.
  slugify(value: string): string {
    return (value || 'field')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '') || 'field';
  }
}
