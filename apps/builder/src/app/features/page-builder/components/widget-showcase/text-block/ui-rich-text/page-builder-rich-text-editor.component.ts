import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  inject,
  input,
  output,
  ViewEncapsulation
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { AngularEditorConfig, AngularEditorModule } from '@kolkov/angular-editor';

const DEFAULT_RTE_BORDER_WIDTH = 'var(--qo-border-width, 1px)';
const DEFAULT_RTE_BORDER_RADIUS = 'var(--qo-radius-xl)';
const DEFAULT_RTE_FONT_SIZE = 'var(--qo-text-sm)';
const DEFAULT_RTE_PADDING = 'var(--qo-space-3)';

@Component({
  selector: 'app-page-builder-rich-text-editor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AngularEditorModule],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './page-builder-rich-text-editor.component.html',
  styleUrl: './page-builder-rich-text-editor.component.scss',
})
export class PageBuilderRichTextEditorComponent implements AfterViewChecked {
  private readonly elRef = inject(ElementRef<HTMLElement>);
  private editorKeyHandlerAttached = false;
  private editorElement: HTMLElement | null = null;

  readonly html = input('');
  readonly placeholder = input('Start writing...');
  readonly disabled = input(false);
  readonly backgroundColor = input('var(--qo-color-neutral-0)');
  readonly textColor = input('var(--qo-color-neutral-900)');
  readonly borderColor = input('var(--qo-border-color)');
  readonly borderWidth = input(DEFAULT_RTE_BORDER_WIDTH);
  readonly borderRadius = input(DEFAULT_RTE_BORDER_RADIUS);
  readonly fontSize = input(DEFAULT_RTE_FONT_SIZE);
  readonly padding = input(DEFAULT_RTE_PADDING);
  readonly toolbarBgColor = input('var(--qo-color-neutral-50)');
  readonly toolbarBorderColor = input('var(--qo-border-color)');

  readonly htmlChange = output<string>();

  readonly editorId = `page-builder-rich-text-${Math.random().toString(16).slice(2)}`;

  readonly htmlControl = new FormControl('', { nonNullable: true });
  private readonly htmlValue = toSignal(this.htmlControl.valueChanges, { initialValue: this.htmlControl.value });
  shellStyles: Record<string, string> = {};
  editorConfig: AngularEditorConfig = this.buildEditorConfig();

  constructor() {
    effect(() => {
      this.htmlChange.emit(this.htmlValue() ?? '');
    });

    effect(() => {
      this.applyEditorConfig();
    });
  }

  ngAfterViewChecked(): void {
    this.attachEditorTabHandler();
  }

  insertTable(executeCommandFn: (command: string, value?: string) => void): void {
    if (this.disabled()) {
      return;
    }

    const rowInput = window.prompt('Number of rows', '2');
    if (rowInput === null) {
      return;
    }

    const columnInput = window.prompt('Number of columns', '2');
    if (columnInput === null) {
      return;
    }

    const rows = Number.parseInt(rowInput, 10);
    const columns = Number.parseInt(columnInput, 10);

    if (!Number.isFinite(rows) || !Number.isFinite(columns) || rows < 1 || columns < 1) {
      window.alert('Please enter valid row and column counts.');
      return;
    }

    executeCommandFn('insertHtml', this.buildTableHtml(rows, columns));
  }

  private applyEditorConfig(): void {
    if (this.html() !== this.htmlControl.value) {
      this.htmlControl.setValue(this.html() ?? '', { emitEvent: false });
    }

    this.shellStyles = {
      '--rt-border': this.borderColor(),
      '--rt-border-width': this.borderWidth(),
      '--rt-radius': this.borderRadius(),
      '--rt-bg': this.backgroundColor(),
      '--rt-text': this.textColor(),
      '--rt-font': this.fontSize(),
      '--rt-pad': this.padding(),
      '--rt-toolbar-bg': this.toolbarBgColor(),
      '--rt-toolbar-border': this.toolbarBorderColor() || this.borderColor()
    };

    this.editorConfig = this.buildEditorConfig();
  }

  private buildEditorConfig(): AngularEditorConfig {
    return {
      editable: !this.disabled(),
      spellcheck: true,
      height: 'auto',
      minHeight: '0',
      maxHeight: 'auto',
      width: 'auto',
      minWidth: '0',
      translate: 'yes',
      enableToolbar: !this.disabled(),
      showToolbar: !this.disabled(),
      placeholder: this.placeholder(),
      defaultParagraphSeparator: 'p',
      defaultFontName: 'Arial',
      defaultFontSize: '3',
      sanitize: false,
      toolbarPosition: 'top',
      outline: false,
      rawPaste: false,
      uploadUrl: '',
      fonts: [
        { class: 'arial', name: 'Arial' },
        { class: 'times-new-roman', name: 'Times New Roman' },
        { class: 'calibri', name: 'Calibri' },
        { class: 'georgia', name: 'Georgia' }
      ],
      toolbarHiddenButtons: [
        ['unlink', 'removeFormat', 'toggleEditorMode'],
        ['customClasses', 'fontName']
      ]
    };
  }

  private attachEditorTabHandler(): void {
    const editor = this.elRef.nativeElement.querySelector('.angular-editor-textarea') as HTMLElement | null;

    if (!editor) {
      this.editorKeyHandlerAttached = false;
      this.editorElement = null;
      return;
    }

    if (this.editorKeyHandlerAttached && this.editorElement === editor) {
      return;
    }

    this.editorElement = editor;
    this.editorKeyHandlerAttached = true;
    editor.addEventListener('keydown', this.handleEditorTab);
  }

  private handleEditorTab = (event: KeyboardEvent): void => {
    if (this.disabled() || event.key !== 'Tab') {
      return;
    }

    event.preventDefault();

    if (event.shiftKey) {
      document.execCommand('outdent', false);
    } else {
      document.execCommand('indent', false);
    }
  };

  private buildTableHtml(rows: number, columns: number): string {
    const tableRows = Array.from({ length: rows }, (_, rowIndex) => {
      const cells = Array.from({ length: columns }, (_, columnIndex) => {
        const tag = rowIndex === 0 ? 'th' : 'td';
        const label = rowIndex === 0 ? `Header ${columnIndex + 1}` : '&nbsp;';
        return `<${tag} style="border:1px solid var(--qo-border-color);padding:8px;">${label}</${tag}>`;
      }).join('');

      return `<tr>${cells}</tr>`;
    }).join('');

    return `<table style="border-collapse:collapse;width:100%;margin:12px 0;">${tableRows}</table><p></p>`;
  }
}
