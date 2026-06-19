import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { PageBuilderRichTextEditorComponent } from '../ui-rich-text/page-builder-rich-text-editor.component';
import { TextBlockWidgetConfig } from '@builder/features/page-builder/models/page-builder-canvas.model';

import { injectPageBuilderTranslate } from '@builder/features/page-builder/services/page-builder-i18n.service';

@Component({
  selector: 'pb-ui-text-block-renderer',
  standalone: true,
  imports: [PageBuilderRichTextEditorComponent,
  ],
  templateUrl: './ui-text-block-renderer.component.html',
  styleUrl: './ui-text-block-renderer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiTextBlockRendererComponent {
  protected readonly t = injectPageBuilderTranslate();
  readonly resolvedConfig = input.required<TextBlockWidgetConfig>();
  readonly currentVariant = input.required<string>();
  readonly isLabelText = input.required<boolean>();
  readonly isRichText = input.required<boolean>();
  readonly isCurrency = input.required<boolean>();
  readonly isFilePicker = input.required<boolean>();
  readonly isDatePicker = input.required<boolean>();
  readonly showFieldLabel = input.required<boolean>();
  readonly inputShellBorderWidth = input.required<string>();
  readonly inputShellBorderRadius = input.required<string>();
  readonly textBlockFontSize = input.required<string>();
  readonly textBlockLineHeight = input.required<string>();
  readonly textBlockLetterSpacing = input.required<string>();
  readonly textBlockFontWeight = input.required<string>();
  readonly textBlockFontStyle = input.required<string>();
  readonly textBlockTextDecoration = input.required<string>();
  readonly textBlockFontFamily = input.required<string>();
  readonly inputId = input.required<string>();
  readonly inputType = input.required<string>();
  readonly inputAutocomplete = input.required<string>();
  readonly inputValidationHint = input.required<string>();
  readonly currencyPrefix = input.required<string>();
  readonly displayPlaceholder = input.required<string>();
  readonly labelTextHtml = input.required<string>();
  readonly fileDisplayName = input.required<string>();
  readonly fileButtonLabel = input.required<string>();
  readonly fileAccept = input.required<string>();
  readonly currentValue = input.required<string>();
  readonly validationMessage = input.required<string>();
  readonly selectedFileNames = input.required<string>();

  readonly fileChange = output<Event>();
  readonly inputChange = output<Event>();
  readonly richTextChange = output<string>();
}
