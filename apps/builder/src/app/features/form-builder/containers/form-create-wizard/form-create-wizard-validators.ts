import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

// Pure validator factory functions - no Angular services, no DI.

// Requires a non-empty value after trimming whitespace.
export function trimmedRequiredValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = typeof control.value === 'string' ? control.value.trim() : '';
    return value ? null : { trimmedRequired: true };
  };
}

// Blocks names that already exist after whitespace/case normalization.
export function duplicateNameValidator(existingNames: string[]): ValidatorFn {
  const normalizedExisting = new Set(
    existingNames.map((name) => normalizeName(name)).filter(Boolean)
  );
  return (control: AbstractControl): ValidationErrors | null => {
    const value = normalizeName(typeof control.value === 'string' ? control.value : '');
    if (!value) return null;
    return normalizedExisting.has(value) ? { duplicateName: true } : null;
  };
}

// Bundles all validators needed by the create form wizard name control.
export function wizardNameValidators(existingNames: string[]): ValidatorFn[] {
  return [Validators.required, trimmedRequiredValidator(), duplicateNameValidator(existingNames)];
}

// Normalizes form names so duplicate checks are user-friendly.
function normalizeName(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}
