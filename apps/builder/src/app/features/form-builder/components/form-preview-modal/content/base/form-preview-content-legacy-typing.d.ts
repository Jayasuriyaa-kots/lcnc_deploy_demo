import type {
  BuilderAction as BuilderActionModel,
  BuilderField as BuilderFieldModel
} from '@builder/features/form-builder/models/form-builder.models';

export {};

declare global {
  type BuilderAction = BuilderActionModel;
  type BuilderField = BuilderFieldModel;

  interface SelectOption {
    value: string | number | boolean;
    label: string;
    disabled?: boolean;
  }

  interface AddressGeoCoordinates {
    lat: number;
    lng: number;
    accuracy?: number;
  }

  interface PhoneBarcodeScanResult {
    rawValue: string;
    format?: string;
  }

  interface PhoneBarcodeScanDetector {
    detect(video: HTMLVideoElement): Promise<PhoneBarcodeScanResult[]>;
  }
}

