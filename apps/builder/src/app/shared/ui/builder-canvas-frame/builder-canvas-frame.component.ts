import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { BuilderPreviewService } from '@builder/core/services/builder-preview.service';

@Component({
  selector: 'app-builder-canvas-frame',
  standalone: true,
  template: `
    <div class="canvas-stage" [attr.data-mode]="preview.mode()">
      <div
        class="canvas-frame"
        [attr.data-mode]="preview.mode()"
        [style.width]="preview.config().width"
        [style.maxWidth]="preview.config().maxWidth || null"
        [style.transform]="'scale(' + preview.config().scale + ')'"
      >
        <div class="canvas-frame__content">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    .canvas-stage {
      display: flex;
      justify-content: center;
      width: 100%;
      min-height: 100%;
      overflow: auto;
      padding: 24px 0 6px;
      box-sizing: border-box;
    }

    .canvas-frame {
      transform-origin: top center;
      transition: width 180ms ease, transform 180ms ease;
    }

    .canvas-frame__content {
      min-height: max(960px, calc(100dvh - 220px));
      background: var(--qo-color-neutral-0);
      border: 1px solid var(--qo-border-color);
      box-shadow: 0 14px 32px rgba(15, 23, 42, 0.08);
    }

    .canvas-frame[data-mode='mobile'] .canvas-frame__content,
    .canvas-frame[data-mode='tablet'] .canvas-frame__content {
      border-radius: 18px;
    }

    .canvas-frame[data-mode='desktop'] .canvas-frame__content,
    .canvas-frame[data-mode='auto'] .canvas-frame__content {
      border-radius: 6px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BuilderCanvasFrameComponent {
  readonly preview = inject(BuilderPreviewService);
}

