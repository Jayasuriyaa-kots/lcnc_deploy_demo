import { ChangeDetectionStrategy, Component, effect, inject, input } from '@angular/core';
import { createDefaultTextBlockWidgetConfig, TextBlockWidgetConfig } from '@builder/features/page-builder/models/page-builder-canvas.model';
import { TextBlockVariant } from '@builder/features/page-builder/components/widget-showcase/text-block/text-block-widget.config';
import { UiTextBlockRendererComponent } from './ui-text-block-renderer.component';
import { UiTextBlockFacade } from './ui-text-block.facade';

/**
 * TECHNICAL EXCEPTION - Violation 2 (Raw Form Elements):
 * This component is an approved canvas widget rendering/simulation exception.
 * It uses raw HTML elements to simulate dynamic layouts and customizable styling properties
 * (dynamic colors, custom border shape/sizes/paddings) which standard Qo components would override.
 */
@Component({
  selector: 'app-text-block',
  standalone: true,
  imports: [UiTextBlockRendererComponent],
  providers: [UiTextBlockFacade],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ui-text-block.component.html',
})
export class UiTextBlockComponent {
  protected readonly facade = inject(UiTextBlockFacade);

  readonly variant = input<TextBlockVariant>('text');
  readonly config = input<TextBlockWidgetConfig | undefined>(undefined);

  constructor() {
    effect(() => {
      this.facade.variant.set(this.variant());
    });

    effect(() => {
      this.facade.config.set(this.config());
    });
  }
}

