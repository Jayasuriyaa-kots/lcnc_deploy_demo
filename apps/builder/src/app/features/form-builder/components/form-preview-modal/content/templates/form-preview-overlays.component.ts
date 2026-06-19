import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  ViewChild,
  ViewEncapsulation,
  effect,
  inject,
} from '@angular/core';
import { injectFormBuilderTranslate } from '@builder/features/form-builder/services/form-builder-i18n.service';
import { FormPreviewContentBase } from '@builder/features/form-builder/components/form-preview-modal/content/base/form-preview-content.base';
import {
  FORM_PREVIEW_OVERLAY_UI_IMPORTS,
  injectFormPreviewHost,
} from '@builder/features/form-builder/components/form-preview-modal/content/templates/form-preview-template.utils';

@Component({
  selector: 'app-form-preview-overlays',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: FORM_PREVIEW_OVERLAY_UI_IMPORTS,
  templateUrl: './form-preview-overlays.component.html',
  styleUrl: './form-preview-overlays.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class FormPreviewOverlaysComponent implements AfterViewChecked {
  protected readonly ctx = injectFormPreviewHost();
  protected readonly t = injectFormBuilderTranslate();
  private readonly cdr = inject(ChangeDetectorRef);

  @ViewChild('imageCaptureVideo') private imageCaptureVideo?: ElementRef<HTMLVideoElement>;
  @ViewChild('audioWaveformCanvas') private audioWaveformCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('videoCapturePreview') private videoCapturePreview?: ElementRef<HTMLVideoElement>;

  constructor() {
    effect(() => {
      this.ctx.overlayViewRevision();
      this.cdr.markForCheck();
    });
  }

  ngAfterViewChecked(): void {
    (this.ctx as FormPreviewContentBase).registerOverlayCaptureElements({
      imageCaptureVideo: this.imageCaptureVideo?.nativeElement ?? null,
      audioWaveformCanvas: this.audioWaveformCanvas?.nativeElement ?? null,
      videoCapturePreview: this.videoCapturePreview?.nativeElement ?? null,
    });
  }
}
