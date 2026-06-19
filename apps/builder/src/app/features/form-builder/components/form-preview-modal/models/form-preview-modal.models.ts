export interface FormSettings {
  formLayout: 'Single Column' | 'Two Column' | 'Multi Section';
  labelPlacement: 'Top' | 'Left' | 'Placeholder Only';
  showSectionBorders: boolean;
  submitBehavior: 'Show Message' | 'Redirect';
  redirectUrl?: string;
  duplicateDetection: 'None' | 'Warn' | 'Block';
}

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
