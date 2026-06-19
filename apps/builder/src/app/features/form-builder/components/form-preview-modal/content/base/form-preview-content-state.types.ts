export interface AddressGeoCoordinates {
  lat: number;
  lng: number;
  accuracy?: number;
}

export interface AddressGeoEditorState {
  open: boolean;
  lat: string;
  lng: string;
}

export interface PhoneScanEditorState {
  open: boolean;
  mode: 'qr' | 'barcode';
  value: string;
  detectedValue?: string;
  cameraError?: string;
  cameraActive?: boolean;
}

export interface PhoneBarcodeScanResult {
  rawValue: string;
}

export interface SelectOption {
  value: string | number | boolean;
  label: string;
  disabled?: boolean;
}

export interface PhoneBarcodeScanDetector {
  detect(video: HTMLVideoElement): Promise<PhoneBarcodeScanResult[]>;
}
