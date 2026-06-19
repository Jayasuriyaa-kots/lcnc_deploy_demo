import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type QoCanvasMode = 'auto' | 'desktop' | 'tablet' | 'mobile';

export interface QoCanvasFrameConfig {
  width: string;
  maxWidth?: string;
  scale: number;
}

@Component({
  selector: 'qo-canvas-frame',
  standalone: true,
  template: `
    <div class="canvas-stage" [attr.data-mode]="mode()">
      <div
        class="canvas-frame"
        [attr.data-mode]="mode()"
        [style.width]="config().width"
        [style.maxWidth]="config().maxWidth || null"
        [style.transform]="'scale(' + config().scale + ')'">
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
export class QoCanvasFrameComponent {
  mode = input<QoCanvasMode>('desktop');
  config = input<QoCanvasFrameConfig>({
    width: '100%',
    maxWidth: '100%',
    scale: 1,
  });
}
