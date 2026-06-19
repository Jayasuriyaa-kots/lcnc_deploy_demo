import { Injectable, signal } from '@angular/core';

/** Holds overlay capture elements registered by the preview overlays template. */
@Injectable()
export class FormPreviewOverlayElements {
  readonly revision = signal(0);

  imageCaptureVideo: HTMLVideoElement | null = null;
  audioWaveformCanvas: HTMLCanvasElement | null = null;
  videoCapturePreview: HTMLVideoElement | null = null;

  notifyChange(): void {
    this.revision.update((value) => value + 1);
  }
}
