import { TranslocoPipe } from '@jsverse/transloco';
import { injectPageBuilderTranslate } from '@builder/features/page-builder/services/page-builder-i18n.service';

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';

export type SearchVariant =
  | 'icon-only'
  | 'inline-button'
  | 'inline-button-lg'
  | 'stacked-rounded';

export type SearchBoxShape = 'rectangular' | 'rounded';

/**
 * TECHNICAL EXCEPTION - Violation 2 (Raw Form Elements):
 * This component is an approved canvas widget rendering/simulation exception.
 * It uses raw HTML elements to simulate dynamic layouts and customizable styling properties
 * (dynamic colors, custom border shape/sizes/paddings) which standard Qo components would override.
 */
@Component({
  selector: 'app-widget-search',
  standalone: true,
  imports: [TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.--ui-search-wrap-radius]': 'wrapRadius()',
    '[style.--ui-search-input-radius]': 'inputRadius()',
    '[style.--ui-search-bar-color]': 'searchBarColor()',
    '[style.--ui-search-bar-font-family]': 'resolvedSearchBarFontFamily()',
    '[style.--ui-search-bar-font-size]': 'resolvedSearchBarFontSize()',
    '[style.--ui-search-bar-font-weight]': 'searchBarBold() ? "700" : "400"',
    '[style.--ui-search-bar-font-style]': 'searchBarItalic() ? "italic" : "normal"',
    '[style.--ui-search-button-bg]': 'searchButtonColor()',
    '[style.--ui-search-button-font-size]': 'resolvedSearchButtonFontSize()',
    '[style.--ui-search-button-font-weight]': 'searchButtonBold() ? "700" : "600"',
    '[style.--ui-search-button-font-style]': 'searchButtonItalic() ? "italic" : "normal"',
    '[style.--ui-search-surface]': 'searchBackgroundColor()',
    '[style.--ui-search-padding-top]': 'resolvedSearchPaddingTop()',
    '[style.--ui-search-padding-right]': 'resolvedSearchPaddingRight()',
    '[style.--ui-search-padding-bottom]': 'resolvedSearchPaddingBottom()',
    '[style.--ui-search-padding-left]': 'resolvedSearchPaddingLeft()',
  },
  templateUrl: './ui-search.component.html',
  styleUrl: './ui-search.component.scss',
})
export class UiSearchComponent {
  protected readonly t = injectPageBuilderTranslate();
  variant = input<SearchVariant>('icon-only');
  searchBoxShape = input<SearchBoxShape>('rounded');
  searchBarFontFamily = input('inherit');
  searchBarColor = input('var(--qo-color-neutral-700)');
  searchBarFontSize = input('var(--qo-text-sm)');
  searchBarBold = input(true);
  searchBarItalic = input(false);
  searchButtonColor = input('var(--qo-color-primary-700)');
  searchButtonFontSize = input('var(--qo-text-sm)');
  searchButtonBold = input(false);
  searchButtonItalic = input(false);
  searchBackgroundColor = input('var(--qo-color-neutral-0)');
  searchPaddingTop = input(0);
  searchPaddingRight = input(0);
  searchPaddingBottom = input(0);
  searchPaddingLeft = input(0);
  placeholder = input('Enter value');

  search = output<string>();

  protected readonly value = signal('');

  protected readonly resolvedSearchBarFontFamily = computed(() =>
    this.searchBarFontFamily() === 'inherit' ? 'inherit' : this.searchBarFontFamily()
  );

  protected readonly resolvedSearchBarFontSize = computed(() =>
    this.normalizeFontSize(this.searchBarFontSize(), 'var(--qo-text-sm)')
  );

  protected readonly resolvedSearchButtonFontSize = computed(() =>
    this.normalizeFontSize(this.searchButtonFontSize(), 'var(--qo-text-sm)')
  );
  protected readonly resolvedSearchPaddingTop = computed(() => this.normalizeSpacing(this.searchPaddingTop(), 0));
  protected readonly resolvedSearchPaddingRight = computed(() => this.normalizeSpacing(this.searchPaddingRight(), 0));
  protected readonly resolvedSearchPaddingBottom = computed(() => this.normalizeSpacing(this.searchPaddingBottom(), 0));
  protected readonly resolvedSearchPaddingLeft = computed(() => this.normalizeSpacing(this.searchPaddingLeft(), 0));

  protected readonly wrapRadius = computed(() =>
    this.searchBoxShape() === 'rounded' ? 'var(--qo-radius-full)' : 'var(--qo-radius-lg)'
  );

  protected readonly inputRadius = computed(() =>
    this.searchBoxShape() === 'rounded' ? 'var(--qo-radius-full)' : 'var(--qo-radius-lg)'
  );

  protected onValueInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement | null;
    this.value.set(inputElement?.value ?? '');
  }

  protected onSearch(): void {
    this.search.emit(this.value());
  }

  private normalizeFontSize(fontSize: string | undefined, fallback: string): string {
    return fontSize?.replace(/\s/g, '') || fallback;
  }

  private normalizeSpacing(value: number | string | undefined, fallback: number): string {
    const nextValue = typeof value === 'number' ? value : Number(value);
    return `${Number.isFinite(nextValue) ? nextValue : fallback}px`;
  }
}
