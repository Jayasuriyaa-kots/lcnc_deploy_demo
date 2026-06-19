import type { FormPreviewMixinIndex } from '../form-preview-content.mixin-index';
import { ChangeDetectorRef, Directive, DOCUMENT, ElementRef, NgZone, QueryList, Renderer2, Signal, ViewChild, ViewChildren, inject, input, output } from '@angular/core';
import { BuilderAction, BuilderField } from '@builder/features/form-builder/models/form-builder.models';
import type { FormPreviewModalFacade } from '@builder/features/form-builder/components/form-preview-modal/state/form-preview-modal.facade';
import type { FormPreviewBrowserMediaService } from '@builder/features/form-builder/components/form-preview-modal/services/form-preview-browser-media.service';
import type { FormPreviewOverlayElements } from '@builder/features/form-builder/components/form-preview-modal/services/form-preview-overlay-elements.service';
import { FormSettings } from '@builder/features/form-builder/components/form-preview-modal/models/form-preview-modal.models';
import { FormBuilderI18nService } from '@builder/features/form-builder/services/form-builder-i18n.service';
import {
  AddressGeoEditorState,
  PhoneBarcodeScanDetector,
  PhoneScanEditorState,
  SelectOption,
} from './form-preview-content-state.types';

@Directive()
export abstract class FormPreviewContentStateInputsBase {
  [key: string]: FormPreviewMixinIndex;

  get richTextParagraphOptions(): SelectOption[] {
    return [
      { label: this.i18n.t('richText.paragraph'), value: 'p' },
      { label: this.i18n.t('richText.heading1'), value: 'h1' },
      { label: this.i18n.t('richText.heading2'), value: 'h2' },
      { label: this.i18n.t('richText.heading3'), value: 'h3' },
    ];
  }

  get richTextFontOptions(): SelectOption[] {
    return [
      { label: this.i18n.t('richText.font'), value: '' },
      { label: this.i18n.t('richText.fonts.arial'), value: 'Arial' },
      { label: this.i18n.t('richText.fonts.helvetica'), value: 'Helvetica' },
      { label: this.i18n.t('richText.fonts.timesNewRoman'), value: 'Times New Roman' },
      { label: this.i18n.t('richText.fonts.georgia'), value: 'Georgia' },
      { label: this.i18n.t('richText.fonts.courierNew'), value: 'Courier New' },
      { label: this.i18n.t('richText.fonts.verdana'), value: 'Verdana' },
    ];
  }

  readonly richTextFontSizeOptions: SelectOption[] = [
    { label: '10', value: '1' },
    { label: '12', value: '2' },
    { label: '14', value: '3' },
    { label: '16', value: '4' },
    { label: '18', value: '5' }
  ];

  protected readonly renderer = inject(Renderer2);
  protected readonly cdr = inject(ChangeDetectorRef);
  protected readonly ngZone = inject(NgZone);
  protected readonly document = inject(DOCUMENT);
  protected abstract readonly previewFacade: FormPreviewModalFacade;
  protected abstract readonly browserMedia: FormPreviewBrowserMediaService;
  protected abstract readonly overlayElements: FormPreviewOverlayElements;
  private readonly i18n = inject(FormBuilderI18nService);
  readonly t = this.i18n.t.bind(this.i18n);

  get overlayViewRevision(): Signal<number> {
    return this.overlayElements.revision;
  }

  @ViewChild('previewRoot') previewRoot?: ElementRef<HTMLElement>;
  @ViewChild('phoneScannerVideo') phoneScannerVideo?: ElementRef<HTMLVideoElement>;
  @ViewChildren('signatureCanvas') signatureCanvasRefs?: QueryList<ElementRef<HTMLCanvasElement>>;

  readonly formNameInput = input('', { alias: 'formName' });
  readonly formDescriptionInput = input('', { alias: 'formDescription' });
  readonly formIdInput = input('', { alias: 'formId' });
  readonly datasourceIdInput = input('', { alias: 'datasourceId' });
  readonly datasourceLabelInput = input('', { alias: 'datasourceLabel' });
  readonly queryIdInput = input('', { alias: 'queryId' });
  readonly queryLabelInput = input('', { alias: 'queryLabel' });
  readonly queryTextInput = input('', { alias: 'queryText' });
  readonly userIdInput = input('', { alias: 'userId' });
  readonly jwtTokenInput = input('', { alias: 'jwtToken' });
  readonly fieldsInput = input<BuilderField[]>([], { alias: 'fields' });
  readonly actionsInput = input<BuilderAction[]>([], { alias: 'actions' });
  readonly settingsInput = input<FormSettings>({
    formLayout: 'Single Column',
    labelPlacement: 'Top',
    showSectionBorders: false,
    submitBehavior: 'Show Message',
    redirectUrl: '',
    duplicateDetection: 'None'
  }, { alias: 'settings' });

  readonly closeRequested = output<void>();

  submitted = false;
  submitAttempted = false;
  draftSaved = false;
  values: Record<string, unknown> = {};
  mediaNames: Record<string, string[]> = {};
  liveErrors: Record<string, string> = {};
  touchedFields: Record<string, boolean> = {};
  richTextActiveFieldId: string | null = null;
  richTextLinkEditorFieldId: string | null = null;
  richTextLinkDraft = '';
  protected _richTextState: { fieldId: string | null; state: Record<string, boolean> } = { fieldId: null, state: {} };
  protected lastRichTextSelection: Record<string, Range> = {};
  protected richTextCodeView: Record<string, boolean> = {};
  protected selectionChangeListener = (): void => this.updateRichTextStateFromSelection();
  focusedFields: Record<string, boolean> = {};
  addressGeoEditors: Record<string, AddressGeoEditorState> = {};
  phoneScanEditors: Record<string, PhoneScanEditorState> = {};
  phoneCountrySelections: Record<string, string> = {};
  choiceDropdownOpen: Record<string, boolean> = {};
  imageCaptureFieldId: string | null = null;
  audioRecordingModalFieldId: string | null = null;
  audioRecordingInModal = false;
  audioRecordTimerDisplay = '00:00';
  audioRecordedPreviewUrl: string | null = null;
  videoCaptureModalFieldId: string | null = null;
  videoRecordingInModal = false;
  videoRecordTimerDisplay = '00:00';
  protected phoneScanStream: MediaStream | null = null;
  protected phoneScanAnimationFrameId: number | null = null;
  protected phoneScanActiveFieldId: string | null = null;
  protected phoneScanDetector: PhoneBarcodeScanDetector | null = null;
  protected signatureDrawing: Record<string, { ctx: CanvasRenderingContext2D; drawing: boolean; lastX: number; lastY: number }> = {};
  protected imageCaptureStream: MediaStream | null = null;
  protected audioRecorder: MediaRecorder | null = null;
  protected audioChunks: Blob[] = [];
  protected audioRecordTimerInterval: ReturnType<typeof setInterval> | null = null;
  protected audioRecordStartTime = 0;
  protected audioAnalyserContext: AudioContext | null = null;
  protected audioVisualAnimationId: number | null = null;
  protected videoCaptureStream: MediaStream | null = null;
  protected videoRecorder: MediaRecorder | null = null;
  protected videoChunks: Blob[] = [];
  protected videoRecordTimerInterval: ReturnType<typeof setInterval> | null = null;
  protected videoRecordStartTime = 0;

  get formName(): string {
    return this.formNameInput();
  }

  get formDescription(): string {
    return this.formDescriptionInput();
  }

  get formId(): string {
    return this.formIdInput();
  }

  get datasourceId(): string {
    return this.datasourceIdInput();
  }

  get datasourceLabel(): string {
    return this.datasourceLabelInput();
  }

  get queryId(): string {
    return this.queryIdInput();
  }

  get queryLabel(): string {
    return this.queryLabelInput();
  }

  get queryText(): string {
    return this.queryTextInput();
  }

  get userId(): string {
    return this.userIdInput();
  }

  get jwtToken(): string {
    return this.jwtTokenInput();
  }

  get fields(): BuilderField[] {
    return this.fieldsInput();
  }

  get actions(): BuilderAction[] {
    return this.actionsInput();
  }

  get settings(): FormSettings {
    return this.settingsInput();
  }
}
