import { TranslocoPipe } from '@jsverse/transloco';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostListener, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { QoButtonComponent, QoColorPickerComponent, QoInputComponent } from '@qo/ui-components';
import { CanvasWidget } from '@builder/features/page-builder/models/page-builder-canvas.model';
import { SearchBoxShape, SearchImageSource, SearchStyleState } from '@builder/features/page-builder/models/page-builder-panel-state.model';
import {
  fontFamilyOptions,
  fontSizeOptions,
  imageSourceOptions,
  colorPickerPalette,
} from './search-style-panel.constants';

import { injectPageBuilderTranslate } from '@builder/features/page-builder/services/page-builder-i18n.service';

@Component({
  selector: 'app-search-style-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, QoButtonComponent, QoColorPickerComponent, QoInputComponent,
    TranslocoPipe,
  ],
  templateUrl: './search-style-panel.component.html',
  styleUrl: './search-style-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchStylePanelComponent {
  protected readonly t = injectPageBuilderTranslate();
  readonly widget = input<CanvasWidget | null>(null);
  readonly state = input<SearchStyleState>({
    searchBoxShape: 'rectangular',
    fontFamily: 'Default font',
    searchButtonFontSize: '15 px',
    searchBarFontSize: '15 px',
    imageSource: 'none',
    searchButtonColor: 'var(--qo-color-neutral-800)',
    searchBarColor: 'var(--qo-color-neutral-800)',
    backgroundColor: 'var(--qo-color-neutral-0)',
    isSearchButtonBold: false,
    isSearchButtonItalic: true,
    isSearchBarBold: true,
    isSearchBarItalic: true,
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 0,
    paddingLeft: 0,
  });
  readonly stateChange = output<Partial<SearchStyleState>>();
  readonly widgetChange = output<Partial<CanvasWidget>>();

  readonly fontFamilyOptions = fontFamilyOptions;
  readonly fontSizeOptions = fontSizeOptions;
  readonly imageSourceOptions = imageSourceOptions;
  readonly colorPickerPalette = colorPickerPalette;

  readonly isFontFamilyOpen = signal(false);
  readonly isSearchButtonFontSizeOpen = signal(false);
  readonly isSearchBarFontSizeOpen = signal(false);
  readonly isImageSourceOpen = signal(false);
  private readonly formBuilder = inject(FormBuilder);
  readonly paddingForm = this.formBuilder.nonNullable.group({ top: 0, right: 0, bottom: 0, left: 0 });
  readonly imageSourceLabel = computed(
    () => this.imageSourceOptions.find((option) => option.value === this.state().imageSource)?.label ?? 'None',
  );

  constructor() {
    effect(() => {
      this.paddingForm.setValue(
        {
          top: this.state().paddingTop,
          right: this.state().paddingRight,
          bottom: this.state().paddingBottom,
          left: this.state().paddingLeft,
        },
        { emitEvent: false },
      );
    });
  }

  searchBoxShape(): SearchBoxShape { return this.state().searchBoxShape; }
  fontFamily(): string { return this.state().fontFamily; }
  searchButtonFontSize(): string { return this.state().searchButtonFontSize; }
  searchBarFontSize(): string { return this.state().searchBarFontSize; }
  imageSource(): SearchImageSource { return this.state().imageSource; }
  searchButtonColor(): string { return this.state().searchButtonColor; }
  searchBarColor(): string { return this.state().searchBarColor; }
  backgroundColor(): string { return this.state().backgroundColor; }
  isSearchButtonBold(): boolean { return this.state().isSearchButtonBold; }
  isSearchButtonItalic(): boolean { return this.state().isSearchButtonItalic; }
  isSearchBarBold(): boolean { return this.state().isSearchBarBold; }
  isSearchBarItalic(): boolean { return this.state().isSearchBarItalic; }

  setSearchBoxShape(shape: SearchBoxShape): void {
    this.stateChange.emit({ searchBoxShape: shape });
    this.widgetChange.emit({ searchBoxShape: shape });
  }
  toggleFontFamilyDropdown(): void { this.isFontFamilyOpen.update((value) => !value); this.isSearchButtonFontSizeOpen.set(false); this.isSearchBarFontSizeOpen.set(false); this.isImageSourceOpen.set(false); }
  selectFontFamily(option: string): void {
    this.isFontFamilyOpen.set(false);
    this.stateChange.emit({ fontFamily: option });
    this.widgetChange.emit({ searchBarFontFamily: option === 'Default font' ? 'inherit' : option });
  }
  toggleSearchButtonFontSizeDropdown(): void { this.isSearchButtonFontSizeOpen.update((value) => !value); this.isFontFamilyOpen.set(false); this.isSearchBarFontSizeOpen.set(false); this.isImageSourceOpen.set(false); }
  selectSearchButtonFontSize(option: string): void { this.isSearchButtonFontSizeOpen.set(false); this.stateChange.emit({ searchButtonFontSize: option }); this.widgetChange.emit({ searchButtonFontSize: option }); }
  toggleSearchBarFontSizeDropdown(): void { this.isSearchBarFontSizeOpen.update((value) => !value); this.isFontFamilyOpen.set(false); this.isSearchButtonFontSizeOpen.set(false); this.isImageSourceOpen.set(false); }
  selectSearchBarFontSize(option: string): void { this.isSearchBarFontSizeOpen.set(false); this.stateChange.emit({ searchBarFontSize: option }); this.widgetChange.emit({ searchBarFontSize: option }); }
  toggleImageSourceDropdown(): void { this.isImageSourceOpen.update((value) => !value); this.isFontFamilyOpen.set(false); this.isSearchButtonFontSizeOpen.set(false); this.isSearchBarFontSizeOpen.set(false); }
  selectImageSource(source: SearchImageSource): void { this.isImageSourceOpen.set(false); this.stateChange.emit({ imageSource: source }); this.widgetChange.emit({ searchImageSource: source }); }
  isImageSourceSelected(source: SearchImageSource): boolean { return this.state().imageSource === source; }
  @HostListener('document:click') onDocumentClick(): void { this.isFontFamilyOpen.set(false); this.isSearchButtonFontSizeOpen.set(false); this.isSearchBarFontSizeOpen.set(false); this.isImageSourceOpen.set(false); }
  toggleSearchButtonBold(): void { const nextValue = !this.state().isSearchButtonBold; this.stateChange.emit({ isSearchButtonBold: nextValue }); this.widgetChange.emit({ searchButtonBold: nextValue }); }
  toggleSearchButtonItalic(): void { const nextValue = !this.state().isSearchButtonItalic; this.stateChange.emit({ isSearchButtonItalic: nextValue }); this.widgetChange.emit({ searchButtonItalic: nextValue }); }
  toggleSearchBarBold(): void { const nextValue = !this.state().isSearchBarBold; this.stateChange.emit({ isSearchBarBold: nextValue }); this.widgetChange.emit({ searchBarBold: nextValue }); }
  toggleSearchBarItalic(): void { const nextValue = !this.state().isSearchBarItalic; this.stateChange.emit({ isSearchBarItalic: nextValue }); this.widgetChange.emit({ searchBarItalic: nextValue }); }
  setSearchButtonColor(color: string | null): void { const nextColor = color ?? ''; this.stateChange.emit({ searchButtonColor: nextColor }); this.widgetChange.emit({ searchButtonColor: nextColor }); }
  setSearchBarColor(color: string | null): void { const nextColor = color ?? ''; this.stateChange.emit({ searchBarColor: nextColor }); this.widgetChange.emit({ searchBarColor: nextColor }); }
  setBackgroundColor(color: string | null): void { const nextColor = color ?? ''; this.stateChange.emit({ backgroundColor: nextColor }); this.widgetChange.emit({ searchBackgroundColor: nextColor }); }
  updatePadding(side: 'top' | 'right' | 'bottom' | 'left', value: string | number): void {
    const nextValue = this.normalizePadding(value);
    this.paddingForm.controls[side].setValue(nextValue, { emitEvent: false });

    const statePatch = {
      ...(side === 'top' ? { paddingTop: nextValue } : {}),
      ...(side === 'right' ? { paddingRight: nextValue } : {}),
      ...(side === 'bottom' ? { paddingBottom: nextValue } : {}),
      ...(side === 'left' ? { paddingLeft: nextValue } : {}),
    };
    const widgetPatch = {
      ...(side === 'top' ? { searchPaddingTop: nextValue } : {}),
      ...(side === 'right' ? { searchPaddingRight: nextValue } : {}),
      ...(side === 'bottom' ? { searchPaddingBottom: nextValue } : {}),
      ...(side === 'left' ? { searchPaddingLeft: nextValue } : {}),
    };

    this.stateChange.emit(statePatch);
    this.widgetChange.emit(widgetPatch);
  }

  private normalizePadding(value: string | number): number {
    const nextValue = typeof value === 'number' ? value : Number(String(value).trim());
    return Number.isFinite(nextValue) ? Math.max(0, nextValue) : 0;
  }
}

