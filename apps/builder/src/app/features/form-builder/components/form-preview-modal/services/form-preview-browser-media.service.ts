import { DOCUMENT, Injectable, inject } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FormPreviewBrowserMediaService {
  private readonly document = inject(DOCUMENT);
  // Checks whether the browser can request camera/microphone streams.
  hasUserMedia(): boolean {
    return typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;
  }

  // Requests a camera/microphone stream from the browser.
  getUserMedia(constraints: MediaStreamConstraints): Promise<MediaStream> {
    return navigator.mediaDevices.getUserMedia(constraints);
  }

  // Checks whether browser geolocation is available.
  hasGeolocation(): boolean {
    return typeof navigator !== 'undefined' && !!navigator.geolocation;
  }

  // Wraps geolocation callback API in a Promise.
  getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  }

  // Creates a canvas element for image capture.
  createCanvas(): HTMLCanvasElement {
    return this.document.createElement('canvas');
  }

  // Creates an audio or video element for metadata/preview handling.
  createMediaElement(kind: 'audio' | 'video'): HTMLMediaElement {
    return this.document.createElement(kind);
  }

  // Creates a recorder with an optional supported MIME type.
  createMediaRecorder(stream: MediaStream, mimeType: string | null): MediaRecorder {
    return mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
  }

  // Finds the first supported recorder MIME type for audio/video capture.
  getSupportedRecorderMimeType(kind: 'audio' | 'video'): string | null {
    if (typeof MediaRecorder === 'undefined' || typeof MediaRecorder.isTypeSupported !== 'function') {
      return null;
    }

    const candidates = kind === 'audio'
      ? ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus']
      : ['video/webm;codecs=vp8,opus', 'video/webm;codecs=vp9,opus', 'video/webm', 'video/mp4'];

    return candidates.find((candidate) => MediaRecorder.isTypeSupported(candidate)) ?? null;
  }

  // Reads a Blob/File as a data URL for preview storage.
  readAsDataUrl(source: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ''));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(source);
    });
  }
}
