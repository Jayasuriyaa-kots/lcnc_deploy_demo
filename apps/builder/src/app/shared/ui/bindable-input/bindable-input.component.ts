import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';

import {
  PageBuilderBindingRegistryService,
  PageBuilderBindingSuggestion,
} from '@builder/features/page-builder/services/page-builder-binding-registry.service';

@Component({
  selector: 'app-bindable-input',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bindable-input.component.html',
  styleUrl: './bindable-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BindableInputComponent {
  private readonly bindingRegistryService = inject(PageBuilderBindingRegistryService);
  private readonly textareaRef = viewChild<ElementRef<HTMLTextAreaElement>>('textarea');

  readonly value = input('');
  readonly placeholder = input('');
  readonly rows = input(4);
  readonly rootKeys = input<string[]>([]);
  readonly allowNestedSuggestions = input(true);
  readonly nestedSuggestionKeys = input<string[]>([]);
  readonly valueChange = output<string>();

  readonly text = signal('');
  readonly isFocused = signal(false);
  readonly highlightedIndex = signal(0);
  readonly activeBindingRange = signal<{ start: number; end: number; fragment: string } | null>(null);
  readonly suggestions = computed<PageBuilderBindingSuggestion[]>(() => {
    const range = this.activeBindingRange();
    if (!range) {
      return [];
    }

    if (!this.allowNestedSuggestions() && range.fragment.includes('.')) {
      const topLevelKey = this.extractTopLevelKey(range.fragment);
      if (!topLevelKey || !this.nestedSuggestionKeys().includes(topLevelKey)) {
        return [];
      }
    }

    return this.bindingRegistryService.getSuggestions(range.fragment, this.rootKeys());
  });
  readonly showSuggestions = computed(() => this.suggestions().length > 0 && this.activeBindingRange() !== null);
  readonly showBindingStarter = computed(() => this.isFocused() && this.activeBindingRange() === null);
  readonly showDropdown = computed(() => this.showBindingStarter() || this.showSuggestions());

  constructor() {
    effect(() => {
      const nextValue = this.value() ?? '';
      if (untracked(() => this.text()) !== nextValue) {
        this.text.set(nextValue);
      }
    });
  }

  onInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.setTextAndCursorState(target.value, target.selectionStart ?? target.value.length);
  }

  onCursorActivity(): void {
    const textarea = this.textareaRef()?.nativeElement;
    if (!textarea) {
      return;
    }

    this.refreshSuggestions(textarea.selectionStart ?? textarea.value.length);
  }

  onFocus(): void {
    this.isFocused.set(true);
    this.onCursorActivity();
  }

  onBlur(): void {
    window.setTimeout(() => {
      this.isFocused.set(false);
      this.closeSuggestions();
    }, 100);
  }

  onKeydown(event: KeyboardEvent): void {
    if (!this.showSuggestions()) {
      return;
    }

    const suggestions = this.suggestions();
    if (!suggestions.length) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.highlightedIndex.update((index) => (index + 1) % suggestions.length);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.highlightedIndex.update((index) => (index - 1 + suggestions.length) % suggestions.length);
      return;
    }

    if (event.key === 'Enter' || event.key === 'Tab') {
      event.preventDefault();
      this.selectSuggestion(suggestions[this.highlightedIndex()]);
      return;
    }

    if (event.key === 'Escape') {
      this.closeSuggestions();
    }
  }

  selectSuggestion(suggestion: PageBuilderBindingSuggestion): void {
    const range = this.activeBindingRange();
    const textarea = this.textareaRef()?.nativeElement;
    if (!range || !textarea) {
      return;
    }

    const currentValue = this.text();
    const before = currentValue.slice(0, range.start);
    const after = currentValue.slice(range.end);
    const afterWithoutClosing = after.startsWith('}}') ? after.slice(2) : after;
    const nextValue = before + '{{' + suggestion.insertText + '}}' + afterWithoutClosing;
    const nextCursorPosition = before.length + suggestion.insertText.length + 4;

    this.text.set(nextValue);
    this.valueChange.emit(nextValue);
    this.closeSuggestions();

    queueMicrotask(() => {
      textarea.focus();
      textarea.setSelectionRange(nextCursorPosition, nextCursorPosition);
    });
  }

  suggestionTrackBy(_index: number, suggestion: PageBuilderBindingSuggestion): string {
    return suggestion.insertText;
  }

  startBinding(): void {
    const textarea = this.textareaRef()?.nativeElement;
    if (!textarea) {
      return;
    }

    const selectionStart = textarea.selectionStart ?? this.text().length;
    const selectionEnd = textarea.selectionEnd ?? selectionStart;
    const currentValue = this.text();
    const nextValue = `${currentValue.slice(0, selectionStart)}{{}}${currentValue.slice(selectionEnd)}`;
    const nextCursorPosition = selectionStart + 2;

    this.text.set(nextValue);
    this.valueChange.emit(nextValue);

    queueMicrotask(() => {
      textarea.focus();
      textarea.setSelectionRange(nextCursorPosition, nextCursorPosition);
      this.refreshSuggestions(nextCursorPosition);
    });
  }

  private setTextAndCursorState(nextValue: string, cursorPosition: number): void {
    this.text.set(nextValue);
    this.valueChange.emit(nextValue);
    this.refreshSuggestions(cursorPosition);
  }

  private refreshSuggestions(cursorPosition: number): void {
    const nextRange = this.findActiveBindingRange(this.text(), cursorPosition);
    this.activeBindingRange.set(nextRange);
    this.highlightedIndex.set(0);
  }

  private closeSuggestions(): void {
    this.activeBindingRange.set(null);
    this.highlightedIndex.set(0);
  }

  private findActiveBindingRange(value: string, cursorPosition: number): { start: number; end: number; fragment: string } | null {
    const textBeforeCursor = value.slice(0, cursorPosition);
    const lastOpenIndex = textBeforeCursor.lastIndexOf('{{');
    if (lastOpenIndex === -1) {
      return null;
    }

    const lastCloseIndex = textBeforeCursor.lastIndexOf('}}');
    if (lastCloseIndex > lastOpenIndex) {
      return null;
    }

    const fragment = value.slice(lastOpenIndex + 2, cursorPosition);
    return {
      start: lastOpenIndex,
      end: cursorPosition,
      fragment: fragment.trim(),
    };
  }

  private extractTopLevelKey(fragment: string): string {
    const match = fragment.trim().match(/^([A-Za-z_$][\w$]*)/);
    return match?.[1] ?? '';
  }
}
