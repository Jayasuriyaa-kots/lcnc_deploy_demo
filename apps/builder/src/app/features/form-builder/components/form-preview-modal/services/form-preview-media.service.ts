import { Injectable } from '@angular/core';
import type { FormPreviewOverlayElements } from './form-preview-overlay-elements.service';

export interface FormPreviewOverlayCaptureElements {
  imageCaptureVideo: HTMLVideoElement | null;
  audioWaveformCanvas: HTMLCanvasElement | null;
  videoCapturePreview: HTMLVideoElement | null;
}

@Injectable()
export class FormPreviewMediaService {
  registerOverlayCaptureElements(
    overlayElements: FormPreviewOverlayElements,
    elements: FormPreviewOverlayCaptureElements,
    syncCaptureOverlays: () => void
  ): void {
    overlayElements.imageCaptureVideo = elements.imageCaptureVideo;
    overlayElements.audioWaveformCanvas = elements.audioWaveformCanvas;
    overlayElements.videoCapturePreview = elements.videoCapturePreview;
    syncCaptureOverlays();
  }
}
