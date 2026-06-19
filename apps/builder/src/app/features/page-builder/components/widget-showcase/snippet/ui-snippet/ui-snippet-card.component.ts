
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import {
  getSnippetWidgetPreset,
  SnippetVariant,
} from '@builder/features/page-builder/components/widget-showcase/snippet/snippet-widget.config';
import {
  createDefaultSnippetWidgetConfig,
  SnippetWidgetConfig,
} from '@builder/features/page-builder/models/page-builder-canvas.model';

import { injectPageBuilderTranslate } from '@builder/features/page-builder/services/page-builder-i18n.service';

@Component({
  selector: 'app-snippet-card',
  standalone: true,
  imports: [
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ui-snippet-card.component.html',
  styleUrl: './ui-snippet-card.component.scss',
})
export class UiSnippetCardComponent {
  protected readonly t = injectPageBuilderTranslate();
  private readonly sanitizer = inject(DomSanitizer);

  readonly variant = input<SnippetVariant>('html');
  readonly selected = input(false);
  readonly config = input<SnippetWidgetConfig | null>(null);

  readonly resolvedPreset = computed(() => getSnippetWidgetPreset(this.variant()));
  readonly resolvedConfig = computed(() => ({
    ...createDefaultSnippetWidgetConfig(this.variant()),
    ...(this.config() ?? {}),
  }));
  readonly rendersLiveMarkup = computed(
    () => (this.variant() === 'html' || this.variant() === 'embed') && !!this.config(),
  );
  readonly renderedMarkup = computed<SafeHtml>(() =>
    this.sanitizer.bypassSecurityTrustHtml(this.resolvedConfig().markup),
  );
}
