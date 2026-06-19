import type { FormPreviewMixinIndex } from '../form-preview-content.mixin-index';
import { Directive } from '@angular/core';
import { FormPreviewContentValidationBase } from './form-preview-content-validation.base';

@Directive()
export abstract class FormPreviewContentIoSignatureBase extends FormPreviewContentValidationBase {
  [key: string]: FormPreviewMixinIndex;

// Reads a selected File as a data URL for preview state.
  protected readAsDataUrl(file: File): Promise<string> {
    return this.browserMedia.readAsDataUrl(file);
  }

  // Reads a recorded Blob as a data URL for preview state.
  protected readBlobAsDataUrl(blob: Blob): Promise<string> {
    return this.browserMedia.readAsDataUrl(blob);
  }

  // Delegates recorder MIME detection to the browser media service.
  protected getSupportedRecorderMimeType(kind: 'audio' | 'video'): string | null {
    return this.browserMedia.getSupportedRecorderMimeType(kind);
  }

  // Builds a friendly recorded media filename from the MIME type.
  protected getRecordedFileName(kind: 'audio' | 'video', mimeType: string): string {
    const normalized = mimeType.toLowerCase();
    if (normalized.includes('mp4')) {
      return kind === 'audio' ? this.t('preview.recordedAudio', { extension: 'mp4' }) : this.t('preview.recordedVideo', { extension: 'mp4' });
    }
    if (normalized.includes('ogg')) {
      return kind === 'audio' ? this.t('preview.recordedAudio', { extension: 'ogg' }) : this.t('preview.recordedVideo', { extension: 'ogg' });
    }
    return kind === 'audio' ? this.t('preview.recordedAudio', { extension: 'webm' }) : this.t('preview.recordedVideo', { extension: 'webm' });
  }

  // Stops the waveform animation and closes the audio context.
  protected stopAudioVisualization(): void {
    if (this.audioVisualAnimationId !== null) {
      cancelAnimationFrame(this.audioVisualAnimationId);
      this.audioVisualAnimationId = null;
    }
    if (this.audioAnalyserContext) {
      this.audioAnalyserContext.close().catch(() => undefined);
      this.audioAnalyserContext = null;
    }
  }

  // Draws a lightweight waveform while audio recording is active.
  protected startAudioFrequencyVisualization(stream: MediaStream): void {
    const canvas = this.getAudioWaveformCanvas();
    if (!canvas) {
      return;
    }

    try {
      const AudioContextClass = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) {
        return;
      }

      const context = new AudioContextClass();
      this.audioAnalyserContext = context;
      const source = context.createMediaStreamSource(stream);
      const analyser = context.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.8;
      analyser.minDecibels = -90;
      analyser.maxDecibels = -10;
      source.connect(analyser);
      const dataArray = new Uint8Array(analyser.fftSize);
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return;
      }

      context.resume().catch(() => undefined);

      const draw = (): void => {
        if (!this.audioRecordingInModal || !this.audioAnalyserContext) {
          return;
        }
        analyser.getByteTimeDomainData(dataArray);
        const width = canvas.width = canvas.offsetWidth;
        const height = canvas.height = canvas.offsetHeight;
        ctx.fillStyle = 'rgb(245, 245, 245)';
        ctx.fillRect(0, 0, width, height);
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgb(117, 117, 117)';
        ctx.beginPath();
        const sliceWidth = width / dataArray.length;
        let x = 0;
        let maxDeviation = 0;
        for (let index = 0; index < dataArray.length; index += 1) {
          const centered = (dataArray[index] - 128) / 24;
          const y = Math.max(0, Math.min(height, (height / 2) + centered));
          const deviation = Math.abs(dataArray[index] - 128);
          if (deviation > maxDeviation) {
            maxDeviation = deviation;
          }
          if (index === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }
        ctx.stroke();

        if (maxDeviation < 6) {
          ctx.clearRect(0, 0, width, height);
          ctx.fillStyle = 'rgb(245, 245, 245)';
          ctx.fillRect(0, 0, width, height);
          ctx.fillStyle = 'rgb(199, 199, 199)';
          ctx.fillRect(0, (height / 2) - 1, width, 2);
        }

        this.audioVisualAnimationId = requestAnimationFrame(draw);
      };

      draw();
    } catch {
      this.stopAudioVisualization();
    }
  }

  // Finds the audio waveform canvas used by the record modal.
  protected getAudioWaveformCanvas(): HTMLCanvasElement | null {
    return this.overlayElements.audioWaveformCanvas;
  }

// Sizes and initializes every signature canvas after preview render.
  protected syncSignatureCanvases(): void {
    this.getSignatureCanvases().forEach((canvas) => {
      const fieldId = canvas.dataset['fieldId'];
      if (!fieldId) {
        return;
      }

      const width = Math.max(Math.floor(canvas.getBoundingClientRect().width), 220);
      const height = Math.max(Math.floor(canvas.getBoundingClientRect().height), 140);
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return;
      }

      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = 'rgb(31, 31, 31)';
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      this.drawSignatureGuides(canvas, ctx);

      const value = this.values[fieldId];
      if (typeof value === 'string' && value.startsWith('data:image/')) {
        const image = new Image();
        image.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          this.drawSignatureGuides(canvas, ctx);
          ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        };
        image.src = value;
      }

      this.signatureDrawing[fieldId] = {
        ctx,
        drawing: false,
        lastX: 0,
        lastY: 0
      };
    });
  }

  // Finds the signature canvas for one field id.
  protected getSignatureCanvas(fieldId: string): HTMLCanvasElement | undefined {
    return this.getSignatureCanvases().find((canvas) => canvas.dataset['fieldId'] === fieldId);
  }

  // Lists all rendered signature canvases under the preview root.
  protected getSignatureCanvases(): HTMLCanvasElement[] {
    return Array.from(this.previewRoot?.nativeElement.querySelectorAll<HTMLCanvasElement>('.preview-signature__canvas') ?? []);
  }

  // Draws the signature baseline and guide styling.
  protected override drawSignatureGuides(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void {
    this.signatureService.drawSignatureGuides(canvas, ctx);
  }

  // Converts mouse/touch coordinates into canvas-local drawing points.
  protected override getSignaturePoint(event: MouseEvent | TouchEvent, canvas: HTMLCanvasElement): { x: number; y: number } | null {
    return this.signatureService.getSignaturePoint(event, canvas);
  }

  // Saves a mock preview submission with datasource metadata.
  protected saveMockSubmission(): void {
    this.previewFacade.saveSubmission(
      {
        formId: this.formId,
        formName: this.formName,
        datasourceId: this.datasourceId,
        datasourceLabel: this.datasourceLabel,
        queryId: this.queryId,
        queryLabel: this.queryLabel,
        queryText: this.queryText,
        userId: this.userId,
        jwtToken: this.jwtToken
      },
      this.buildSubmissionPayload()
    );
  }

  // Builds the submission payload keyed by field binding/link name.
  protected buildSubmissionPayload(): Record<string, unknown> {
    return this.fields.reduce<Record<string, unknown>>((acc, field) => {
      const key = field.binding || field.properties.fieldLinkName || field.id;
      acc[key] = this.serializeFieldValue(field);
      return acc;
    }, {});
  }

  // Converts preview-only values into persisted submission values.
  protected serializeFieldValue(field: BuilderField): unknown {
    if (field.type === 'File Upload' || field.type === 'Image' || field.type === 'Audio' || field.type === 'Video') {
      const names = this.getMediaNames(field.id);
      return this.allowsMultipleFiles(field) ? [...names] : (names[0] ?? '');
    }

    if (field.type === 'Signature') {
      return this.hasMediaValue(field.id) ? this.t('preview.capturedSignature') : '';
    }

    const value = this.values[field.id];
    if (Array.isArray(value)) {
      return [...value];
    }

    if (value && typeof value === 'object') {
      try {
        return JSON.parse(JSON.stringify(value));
      } catch {
        return null;
      }
    }

    return value ?? '';
  }

}
