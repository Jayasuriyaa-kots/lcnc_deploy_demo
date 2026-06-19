import type { FormPreviewMixinIndex } from '../form-preview-content.mixin-index';
import { Directive, inject } from '@angular/core';
import { FormPreviewMediaService } from '@builder/features/form-builder/components/form-preview-modal/services/form-preview-media.service';
import { FormPreviewContentFieldsBase } from './form-preview-content-fields.base';

@Directive()
export abstract class FormPreviewContentMediaBase extends FormPreviewContentFieldsBase {
  [key: string]: FormPreviewMixinIndex;

  protected readonly mediaService = inject(FormPreviewMediaService);

  // Handles file input selection, validation, and preview value storage.
  async onFileSelected(field: BuilderField, event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    if (!files.length) return;

    const maxCount = Math.max(field.properties.maxFileCount || 1, 1);
    if (this.allowsMultipleFiles(field) && files.length > maxCount) {
      const noun = field.type === 'Image' ? 'images' : 'files';
      this.liveErrors = { ...this.liveErrors, [field.id]: this.t('validation.maxFileCount', { count: maxCount, noun }) };
      input.value = '';
      return;
    }
    const limited = this.allowsMultipleFiles(field) ? files.slice(0, maxCount) : [files[0]];
    const typeError = this.getFileTypeError(field, limited);
    if (typeError) {
      this.liveErrors = { ...this.liveErrors, [field.id]: typeError };
      input.value = '';
      return;
    }

    const sizeError = this.getFileSizeError(field, limited);
    if (sizeError) {
      this.liveErrors = { ...this.liveErrors, [field.id]: sizeError };
      input.value = '';
      return;
    }

    const mediaError = await this.getMediaValidationError(field, limited);
    if (mediaError) {
      this.liveErrors = { ...this.liveErrors, [field.id]: mediaError };
      input.value = '';
      return;
    }

    this.mediaNames = { ...this.mediaNames, [field.id]: limited.map((file) => file.name) };

    if (field.type === 'Image' || field.type === 'Audio' || field.type === 'Video') {
      const readers = limited.map((file) => this.readAsDataUrl(file));
      Promise.all(readers).then((results) => {
        this.ngZone.run(() => {
          this.setValue(field.id, this.allowsMultipleFiles(field) ? results : results[0], field);
        });
      });
    } else {
      this.setValue(field.id, this.allowsMultipleFiles(field) ? limited.map((file) => file.name) : limited[0].name, field);
    }

    input.value = '';
  }

  // Clears stored media names and preview value for one field.
  clearMedia(fieldId: string): void {
    const nextNames = { ...this.mediaNames };
    delete nextNames[fieldId];
    this.mediaNames = nextNames;
    const field = this.fields.find((item) => item.id === fieldId);
    this.setValue(fieldId, '', field);
  }

  // Reads selected/captured media filenames for one field.
  getMediaNames(fieldId: string): string[] {
    return this.mediaNames[fieldId] ?? [];
  }

  // Returns image data URLs or remote URLs that can render as previews.
  getImagePreview(fieldId: string): string[] {
    const value = this.values[fieldId];
    if (Array.isArray(value)) {
      return value.filter((item): item is string => typeof item === 'string' && (item.startsWith('data:image/') || /^https?:\/\//i.test(item)));
    }
    return typeof value === 'string' && (value.startsWith('data:image/') || /^https?:\/\//i.test(value)) ? [value] : [];
  }

  // Removes one image from a multi-image field.
  removeImageAt(fieldId: string, index: number): void {
    const images = this.getImagePreview(fieldId);
    if (!images.length) {
      return;
    }
    const nextImages = images.filter((_, itemIndex) => itemIndex !== index);
    const nextNames = this.getMediaNames(fieldId).filter((_, itemIndex) => itemIndex !== index);
    this.mediaNames = { ...this.mediaNames, [fieldId]: nextNames };
    const field = this.fields.find((item) => item.id === fieldId);
    if (!nextImages.length) {
      this.clearMedia(fieldId);
      return;
    }
    this.setValue(fieldId, field && this.allowsMultipleFiles(field) ? nextImages : nextImages[0], field);
  }

  // Reads an audio/video data URL from the field value.
  getMediaDataUrl(fieldId: string, family: 'audio' | 'video'): string | null {
    const value = this.values[fieldId];
    if (typeof value === 'string' && value.startsWith(`data:${family}/`)) {
      return value;
    }
    return null;
  }

  // Checks whether the field currently has a media/file value.
  hasMediaValue(fieldId: string): boolean {
    const value = this.values[fieldId];
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return typeof value === 'string' ? value.trim().length > 0 : false;
  }

  // Returns the first filename shown by single-file controls.
  getSingleMediaName(fieldId: string): string {
    return this.getMediaNames(fieldId)[0] ?? this.t('preview.selectedFile');
  }

  // Reads an audio data URL for playback.
  getAudioDataUrl(fieldId: string): string | null {
    const value = this.values[fieldId];
    if (typeof value !== 'string' || !value.startsWith('data:')) {
      return null;
    }
    return value;
  }

  // Reads a video data URL for playback.
  getVideoDataUrl(fieldId: string): string | null {
    const value = this.values[fieldId];
    if (typeof value !== 'string' || !value.startsWith('data:')) {
      return null;
    }
    return value;
  }

  // Shows selected filename or default upload prompt.
  getFileUploadPlaceholder(field: BuilderField): string {
    return this.getMediaNames(field.id)[0] ?? this.t('preview.selectFile');
  }

  // Returns generic file names for non-media upload fields.
  getGenericFileNames(fieldId: string): string[] {
    const value = this.values[fieldId];
    if (Array.isArray(value)) {
      return value.map((item) => String(item)).filter(Boolean);
    }
    if (typeof value === 'string' && value.trim()) {
      return [value];
    }
    return this.getMediaNames(fieldId);
  }

  // Computes datetime input step from seconds/minute interval settings.
  getDateTimeStep(field: BuilderField): number {
    if (this.showDateTimeSeconds(field)) {
      return 1;
    }
    const interval = String(field.properties.dateTimeMinutesInterval ?? 'Default');
    if (interval === '5') return 300;
    if (interval === '15') return 900;
    if (interval === '30') return 1800;
    return 60;
  }

// Opens the video capture modal and starts camera/microphone preview.
  async openVideoCaptureModal(field: BuilderField): Promise<void> {
    if (!this.browserMedia.hasUserMedia()) {
      this.liveErrors = { ...this.liveErrors, [field.id]: this.t('validation.videoCaptureUnavailable') };
      this.refreshPreviewView();
      return;
    }

    this.videoCaptureModalFieldId = field.id;
    this.videoRecordingInModal = false;
    this.videoRecordTimerDisplay = '00:00';
    this.videoChunks = [];
    this.refreshPreviewView();
    try {
      this.videoCaptureStream = await this.browserMedia.getUserMedia({ video: true, audio: true });
      this.syncCaptureOverlays();
      this.refreshPreviewView();
    } catch {
      this.videoCaptureModalFieldId = null;
      this.videoCaptureStream = null;
      this.liveErrors = { ...this.liveErrors, [field.id]: this.t('validation.videoCaptureFailed') };
      this.refreshPreviewView();
    }
  }

  // Stops video capture/recording and clears modal state.
  closeVideoCaptureModal(): void {
    if (this.videoRecordingInModal) {
      this.videoRecorder?.stop();
    }
    if (this.videoRecordTimerInterval) {
      clearInterval(this.videoRecordTimerInterval);
      this.videoRecordTimerInterval = null;
    }
    if (this.videoCaptureStream) {
      this.videoCaptureStream.getTracks().forEach((track) => track.stop());
      this.videoCaptureStream = null;
    }
    const video = this.getVideoCapturePreview();
    if (video) {
      this.renderer.setProperty(video, 'srcObject', null);
    }
    this.videoCaptureModalFieldId = null;
    this.videoRecordingInModal = false;
    this.videoRecordTimerDisplay = '00:00';
    this.videoRecorder = null;
    this.videoChunks = [];
    this.refreshPreviewView();
  }

  // Starts or stops recording video in the capture modal.
  async toggleVideoRecordInModal(): Promise<void> {
    const fieldId = this.videoCaptureModalFieldId;
    const field = this.fields.find((item) => item.id === fieldId);
    if (!field || !this.videoCaptureStream) {
      return;
    }

    if (this.videoRecordingInModal) {
      this.videoRecorder?.stop();
      return;
    }

    const mimeType = this.getSupportedRecorderMimeType('video');
    this.videoRecorder = this.browserMedia.createMediaRecorder(this.videoCaptureStream, mimeType);
    this.videoChunks = [];
    this.videoRecordingInModal = true;
    this.videoRecordStartTime = Date.now();
    this.videoRecordTimerInterval = setInterval(() => {
      const sec = Math.floor((Date.now() - this.videoRecordStartTime) / 1000);
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      this.videoRecordTimerDisplay = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      this.refreshPreviewView();
    }, 200);
    this.videoRecorder.ondataavailable = (event) => {
      if (event.data.size) {
        this.videoChunks.push(event.data);
      }
    };
    this.videoRecorder.onstop = () => {
      this.ngZone.run(() => this.beginVideoRecordingFinish(field, mimeType));
    };
    this.videoRecorder.start();
    this.refreshPreviewView();
  }

  // Stops timers and reads the recorded blob before saving.
  private beginVideoRecordingFinish(field: BuilderField, mimeType: string): void {
    if (this.videoRecordTimerInterval) {
      clearInterval(this.videoRecordTimerInterval);
      this.videoRecordTimerInterval = null;
    }
    this.videoRecordingInModal = false;
    this.videoRecordTimerDisplay = '00:00';
    const blobType = this.videoRecorder?.mimeType || mimeType || 'video/webm;codecs=vp8,opus';
    const blob = new Blob(this.videoChunks, { type: blobType });
    void this.readBlobAsDataUrl(blob).then((dataUrl) => {
      this.ngZone.run(() => this.applyVideoRecording(field, dataUrl, blobType));
    });
  }

  // Validates duration when configured, then stores the recording.
  private applyVideoRecording(field: BuilderField, dataUrl: string, blobType: string): void {
    const maxDuration = Number(field.properties.videoMaxDurationSec);
    if (!Number.isNaN(maxDuration) && maxDuration > 0) {
      this.validateVideoDuration(field, dataUrl, blobType, maxDuration);
      return;
    }
    this.saveVideoRecording(field, dataUrl, blobType);
  }

  // Finds the active video capture preview element.
  protected getVideoCapturePreview(): HTMLVideoElement | null {
    return this.overlayElements.videoCapturePreview;
  }

  // Checks recorded video duration before saving it.
  private validateVideoDuration(field: BuilderField, dataUrl: string, blobType: string, maxDuration: number): void {
    const video = this.browserMedia.createMediaElement('video') as HTMLVideoElement;
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      this.ngZone.run(() => {
        if (video.duration > maxDuration) {
          this.liveErrors = { ...this.liveErrors, [field.id]: this.t('validation.mediaDuration', { kind: 'Video', seconds: maxDuration }) };
        } else {
          this.saveVideoRecording(field, dataUrl, blobType);
          return;
        }
        this.closeVideoCaptureModal();
        this.refreshPreviewView();
      });
    };
    video.onerror = () => {
      this.ngZone.run(() => this.saveVideoRecording(field, dataUrl, blobType));
    };
    video.src = dataUrl;
  }

  // Stores a recorded video and closes capture UI.
  private saveVideoRecording(field: BuilderField, dataUrl: string, blobType: string): void {
    this.mediaNames = { ...this.mediaNames, [field.id]: [this.getRecordedFileName('video', blobType)] };
    this.setValue(field.id, dataUrl, field);
    this.closeVideoCaptureModal();
  }

// Opens camera capture for image fields.
  async openImageCapture(field: BuilderField): Promise<void> {
    if (!this.browserMedia.hasUserMedia()) {
      this.liveErrors = { ...this.liveErrors, [field.id]: this.t('validation.cameraUnavailable') };
      this.refreshPreviewView();
      return;
    }

    this.imageCaptureFieldId = field.id;
    this.refreshPreviewView();
    try {
      this.imageCaptureStream = await this.browserMedia.getUserMedia({
        video: true
      });
      this.syncCaptureOverlays();
      this.refreshPreviewView();
    } catch {
      this.imageCaptureFieldId = null;
      this.imageCaptureStream = null;
      this.liveErrors = { ...this.liveErrors, [field.id]: this.t('validation.cameraFailed') };
      this.refreshPreviewView();
    }
  }

  // Stops camera capture and clears image-capture UI state.
  closeImageCapture(): void {
    if (this.imageCaptureStream) {
      this.imageCaptureStream.getTracks().forEach((track) => track.stop());
      this.imageCaptureStream = null;
    }
    const video = this.getImageCaptureVideo();
    if (video) {
      this.renderer.setProperty(video, 'srcObject', null);
    }
    this.imageCaptureFieldId = null;
    this.refreshPreviewView();
  }

  // Captures one frame from the active camera stream into the field value.
  captureImageFromVideo(): void {
    const video = this.getImageCaptureVideo();
    const fieldId = this.imageCaptureFieldId;
    if (!video || !fieldId || !video.videoWidth) {
      return;
    }

    const field = this.fields.find((item) => item.id === fieldId);
    const canvas = this.browserMedia.createCanvas();
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/png');
    const current = this.getImagePreview(fieldId);
    const maxCount = Math.max(field?.properties.maxFileCount || 1, 1);
    if (field && this.allowsMultipleFiles(field) && current.length >= maxCount) {
      this.liveErrors = { ...this.liveErrors, [fieldId]: this.t('validation.maxImageCaptureCount', { count: maxCount }) };
      this.refreshPreviewView();
      return;
    }
    this.mediaNames = {
      ...this.mediaNames,
      [fieldId]: field && this.allowsMultipleFiles(field) ? [...this.getMediaNames(fieldId), this.t('preview.capturedImageAt', { index: current.length + 1 })] : [this.t('preview.capturedImage')]
    };
    const nextValue = field && this.allowsMultipleFiles(field) ? [...current, dataUrl] : dataUrl;
    this.setValue(fieldId, nextValue, field);
    this.closeImageCapture();
  }

  // Finds the active image-capture video element.
  protected getImageCaptureVideo(): HTMLVideoElement | null {
    return this.overlayElements.imageCaptureVideo;
  }

  registerOverlayCaptureElements(elements: {
    imageCaptureVideo: HTMLVideoElement | null;
    audioWaveformCanvas: HTMLCanvasElement | null;
    videoCapturePreview: HTMLVideoElement | null;
  }): void {
    this.mediaService.registerOverlayCaptureElements(this.overlayElements, elements, () => this.syncCaptureOverlays());
  }

  // Attaches active camera streams after overlay media elements render.
  syncCaptureOverlays(): void {
    this.attachImageCaptureStream();
    this.attachVideoCaptureStream();
  }

  private attachImageCaptureStream(): void {
    if (!this.imageCaptureFieldId || !this.imageCaptureStream) {
      return;
    }

    const video = this.getImageCaptureVideo();
    if (!video || video.srcObject === this.imageCaptureStream) {
      return;
    }

    this.renderer.setProperty(video, 'srcObject', this.imageCaptureStream);
    video.play().catch(() => undefined);
  }

  private attachVideoCaptureStream(): void {
    if (!this.videoCaptureModalFieldId || !this.videoCaptureStream) {
      return;
    }

    const video = this.getVideoCapturePreview();
    if (!video || video.srcObject === this.videoCaptureStream) {
      return;
    }

    this.renderer.setProperty(video, 'srcObject', this.videoCaptureStream);
    video.play().catch(() => undefined);
  }

  // Clears an audio field value.
  clearAudio(fieldId: string): void {
    this.clearMedia(fieldId);
  }

  // Clears a video field value.
  clearVideo(fieldId: string): void {
    this.clearMedia(fieldId);
  }

  // Opens the audio recording modal for one field.
  openAudioRecordModal(field: BuilderField): void {
    this.audioRecordingModalFieldId = field.id;
    this.audioRecordingInModal = false;
    this.audioRecordTimerDisplay = '00:00';
    this.audioChunks = [];
    this.audioRecordedPreviewUrl = null;
    this.refreshPreviewView();
  }

  // Stops recording/visualization and closes the audio modal.
  closeAudioRecordModal(): void {
    if (this.audioRecordingInModal) {
      this.audioRecorder?.stop();
    }
    if (this.audioRecordTimerInterval) {
      clearInterval(this.audioRecordTimerInterval);
      this.audioRecordTimerInterval = null;
    }
    this.stopAudioVisualization();
    this.audioRecordingModalFieldId = null;
    this.audioRecordingInModal = false;
    this.audioRecordTimerDisplay = '00:00';
    this.audioRecorder = null;
    this.audioChunks = [];
    this.audioRecordedPreviewUrl = null;
    this.refreshPreviewView();
  }

  // Starts or stops recording audio in the modal.
  async toggleAudioRecordInModal(): Promise<void> {
    const fieldId = this.audioRecordingModalFieldId;
    const field = this.fields.find((item) => item.id === fieldId);
    if (!field) {
      return;
    }

    if (this.audioRecordingInModal) {
      if (this.audioRecorder?.state === 'recording') {
        this.audioRecorder.requestData();
      }
      this.audioRecorder?.stop();
      return;
    }

    try {
      const stream = await this.browserMedia.getUserMedia({ audio: true });
      const mimeType = this.getSupportedRecorderMimeType('audio');
      this.audioRecorder = this.browserMedia.createMediaRecorder(stream, mimeType);
      this.audioChunks = [];
      this.audioRecordingInModal = true;
      this.audioRecordStartTime = Date.now();
      this.startAudioFrequencyVisualization(stream);
      this.audioRecordTimerInterval = setInterval(() => {
        const sec = Math.floor((Date.now() - this.audioRecordStartTime) / 1000);
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        this.audioRecordTimerDisplay = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        this.refreshPreviewView();
      }, 200);
      this.audioRecorder.ondataavailable = (event) => {
        if (event.data.size) {
          this.audioChunks.push(event.data);
        }
      };
      this.audioRecorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        if (this.audioRecordTimerInterval) {
          clearInterval(this.audioRecordTimerInterval);
          this.audioRecordTimerInterval = null;
        }
        this.stopAudioVisualization();
        this.audioRecordingInModal = false;
        this.audioRecordTimerDisplay = '00:00';
        if (!this.audioChunks.length) {
          this.ngZone.run(() => {
            this.liveErrors = { ...this.liveErrors, [field.id]: this.t('validation.noAudioCaptured') };
            this.closeAudioRecordModal();
          });
          return;
        }
        const blobType = this.audioRecorder?.mimeType || mimeType || 'audio/webm;codecs=opus';
        const blob = new Blob(this.audioChunks, { type: blobType });
        void this.readBlobAsDataUrl(blob).then((dataUrl) => {
          this.ngZone.run(() => {
            this.mediaNames = { ...this.mediaNames, [field.id]: [this.getRecordedFileName('audio', blobType)] };
            this.setValue(field.id, dataUrl, field);
            this.closeAudioRecordModal();
          });
        });
      };
      this.audioRecorder.start(250);
      this.refreshPreviewView();
    } catch {
      this.closeAudioRecordModal();
      this.liveErrors = { ...this.liveErrors, [field.id]: this.t('validation.microphoneFailed') };
      this.refreshPreviewView();
    }
  }

// Captures the current browser time into a Time field.
  captureCurrentTime(field: BuilderField): void {
    const now = new Date();
    const hh = `${now.getHours()}`.padStart(2, '0');
    const mm = `${now.getMinutes()}`.padStart(2, '0');
    const ss = `${now.getSeconds()}`.padStart(2, '0');
    this.setValue(field.id, field.properties.timeShowSeconds ? `${hh}:${mm}:${ss}` : `${hh}:${mm}`, field);
  }

  // Captures the current browser date into a Date field.
  captureCurrentDate(field: BuilderField): void {
    this.setValue(field.id, this.getCurrentDateValue(), field);
  }

  // Captures the current browser date-time into a Date-Time field.
  captureCurrentDateTime(field: BuilderField): void {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = `${now.getMonth() + 1}`.padStart(2, '0');
    const dd = `${now.getDate()}`.padStart(2, '0');
    const hh = `${now.getHours()}`.padStart(2, '0');
    const min = `${now.getMinutes()}`.padStart(2, '0');
    const ss = `${now.getSeconds()}`.padStart(2, '0');
    this.setValue(field.id, this.showDateTimeSeconds(field) ? `${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}` : `${yyyy}-${mm}-${dd}T${hh}:${min}`, field);
  }

  // Formats native date/time values according to field display settings.
  getFormattedDateTimeValue(field: BuilderField): string {
    const value = this.getPickerInputValue(field);
    const format = field.properties.displayFormat || field.properties.format;
    if (!value) {
      return '';
    }

    if (field.type === 'Date Picker' || field.type === 'Date') {
      return this.formatDateValue(value, format || 'DD MMM YYYY');
    }

    if (field.type === 'Time') {
      return this.formatTimeValue(value, format || 'HH:mm');
    }

    if (field.type === 'Date-Time') {
      const [datePart, timePart = ''] = value.split('T');
      const dateFormat = this.extractDateFormat(format || 'DD MMM YYYY HH:mm');
      const timeFormat = this.extractTimeFormat(format || 'DD MMM YYYY HH:mm');
      const dateText = this.formatDateValue(datePart, dateFormat);
      const timeText = this.formatTimeValue(timePart, timeFormat);
      return [dateText, timeText].filter(Boolean).join(' ');
    }

    return value;
  }

  // Returns the formatted display value for date fields.
  getDateDisplayValue(field: BuilderField): string {
    return this.getFormattedDateTimeValue(field) || '';
  }

  // Converts configured date format into a user-facing input placeholder.
  getDatePlaceholder(field: BuilderField): string {
    const format = field.properties.displayFormat || field.properties.format || 'DD MMM YYYY';
    if (format.includes('DD-MMM-YYYY')) return 'dd-MMM-yyyy';
    if (format.includes('DD/MM/YYYY')) return 'dd/mm/yyyy';
    if (format === 'MM/DD/YYYY') return 'mm/dd/yyyy';
    if (format.includes('MM/DD/YYYY')) return 'mm/dd/yyyy';
    if (format.includes('YYYY-MM-DD')) return 'yyyy-mm-dd';
    return 'dd MMM yyyy';
  }

  // Returns the formatted display value for time fields.
  getTimeDisplayValue(field: BuilderField): string {
    return this.getFormattedDateTimeValue(field) || '';
  }

  // Reads picker value, falling back to initial value when empty.
  getPickerInputValue(field: BuilderField): string {
    const value = this.getDisplayValue(field.id);
    if (value) {
      return value;
    }

    const initialValue = this.getInitialValue(field);
    return typeof initialValue === 'string' ? initialValue : '';
  }

  // Opens native date/time picker when the browser supports showPicker.
  openNativePicker(input: HTMLInputElement): void {
    const picker = input as HTMLInputElement & { showPicker?: () => void };
    input.focus();
    try {
      picker.showPicker?.();
    } catch {
      input.click();
    }
  }

  // Captures browser geolocation into an Address field.
  captureAddressGeo(field: BuilderField): void {
    if (!this.browserMedia.hasGeolocation()) {
      this.liveErrors = { ...this.liveErrors, [field.id]: this.t('validation.geolocationUnavailable') };
      this.touchedFields = { ...this.touchedFields, [field.id]: true };
      return;
    }

    this.browserMedia.getCurrentPosition()
      .then((position) => {
        this.applyAddressGeo(field, {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        if (this.liveErrors[field.id]) {
          const nextErrors = { ...this.liveErrors };
          delete nextErrors[field.id];
          this.liveErrors = nextErrors;
        }
      })
      .catch(() => {
        this.liveErrors = { ...this.liveErrors, [field.id]: this.t('validation.geolocationCaptureFailed') };
        this.touchedFields = { ...this.touchedFields, [field.id]: true };
      });
  }

  // Opens manual latitude/longitude editor for an Address field.
  openAddressGeoEditor(field: BuilderField): void {
    const geo = this.getAddressGeo(field);
    this.addressGeoEditors = {
      ...this.addressGeoEditors,
      [field.id]: {
        open: true,
        lat: geo ? String(geo.lat) : '',
        lng: geo ? String(geo.lng) : ''
      }
    };
  }

  // Closes the manual geo editor for one field.
  closeAddressGeoEditor(fieldId: string): void {
    if (!this.addressGeoEditors[fieldId]) {
      return;
    }
    const next = { ...this.addressGeoEditors };
    delete next[fieldId];
    this.addressGeoEditors = next;
  }

  // Validates and applies manually entered geo coordinates.
  applyAddressGeoEditor(field: BuilderField): void {
    const editor = this.addressGeoEditors[field.id];
    if (!editor) {
      return;
    }

    const lat = Number(editor.lat);
    const lng = Number(editor.lng);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      this.liveErrors = { ...this.liveErrors, [field.id]: this.t('validation.invalidGeoCoordinates') };
      this.touchedFields = { ...this.touchedFields, [field.id]: true };
      return;
    }

    this.applyAddressGeo(field, { lat, lng });
    this.closeAddressGeoEditor(field.id);
    if (this.liveErrors[field.id]) {
      const nextErrors = { ...this.liveErrors };
      delete nextErrors[field.id];
      this.liveErrors = nextErrors;
    }
  }

  // Checks whether the manual geo editor is open.
  isAddressGeoEditorOpen(fieldId: string): boolean {
    return !!this.addressGeoEditors[fieldId]?.open;
  }

  // Builds a readable geo-coordinate summary for preview.
  getAddressGeoSummary(field: BuilderField): string {
    const geo = this.getAddressGeo(field);
    if (!geo) {
      return '';
    }

    const coords = `${geo.lat.toFixed(6)}, ${geo.lng.toFixed(6)}`;
    const summary = this.t('preview.geoSummary', { coords });
    return typeof geo.accuracy === 'number'
      ? `${summary} - Accuracy ${Math.round(geo.accuracy)}m`
      : summary;
  }

// Opens the phone scan editor and starts QR/barcode camera scanning.
  openPhoneScanEditor(field: BuilderField, mode: 'qr' | 'barcode'): void {
    this.phoneScanEditors = {
      ...this.phoneScanEditors,
      [field.id]: {
        open: true,
        mode,
        value: this.getPhoneDisplayValue(field),
        detectedValue: '',
        cameraActive: true
      }
    };
    this.startPhoneScanner(field.id, mode);
  }

  // Closes the phone scan editor and stops scanner if it belongs to this field.
  closePhoneScanEditor(fieldId: string): void {
    if (!this.phoneScanEditors[fieldId]) {
      return;
    }
    const next = { ...this.phoneScanEditors };
    delete next[fieldId];
    this.phoneScanEditors = next;
    if (this.phoneScanActiveFieldId === fieldId) {
      this.stopPhoneScanner();
    }
  }

  // Checks whether the phone scan editor is open for one field.
  isPhoneScanEditorOpen(fieldId: string): boolean {
    return !!this.phoneScanEditors[fieldId]?.open;
  }

  // Returns the short label for the active scan mode.
  getPhoneScanLabel(fieldId: string): string {
    return this.phoneScanEditors[fieldId]?.mode === 'barcode' ? this.t('preview.barcode') : this.t('preview.qr');
  }

  // Returns the descriptive scan format label for UI display.
  getPhoneScanFormatLabel(fieldId: string): string {
    return this.phoneScanEditors[fieldId]?.mode === 'barcode' ? this.t('preview.barcodeScan') : this.t('preview.qrScan');
  }

  // Applies the scanner/editor value back to the phone field.
  applyPhoneScanEditor(field: BuilderField): void {
    const editor = this.phoneScanEditors[field.id];
    if (!editor) {
      return;
    }

    this.setValue(field.id, editor.value, field);
    this.closePhoneScanEditor(field.id);
  }

  // Starts camera scanning for QR/barcode values.
  async startPhoneScanner(fieldId: string, mode: 'qr' | 'barcode'): Promise<void> {
    this.stopPhoneScanner();
    this.phoneScanActiveFieldId = fieldId;
    const editor = this.phoneScanEditors[fieldId];
    if (!editor) {
      return;
    }

    if (!this.browserMedia.hasUserMedia()) {
      this.phoneScanEditors = {
        ...this.phoneScanEditors,
        [fieldId]: { ...editor, cameraError: this.t('validation.cameraUnavailable'), cameraActive: false }
      };
      return;
    }

    try {
      const stream = await this.browserMedia.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      this.phoneScanStream = stream;
      // Native video element access is required for MediaStream playback APIs.
      const video = this.phoneScannerVideo?.nativeElement;
      if (video) {
        video.srcObject = stream;
        await video.play();
      }

      this.phoneScanDetector = await this.createPhoneScanDetector(mode);
      this.scanPhoneFrame();
    } catch {
      this.phoneScanEditors = {
        ...this.phoneScanEditors,
        [fieldId]: { ...editor, cameraError: this.t('validation.phoneScannerCameraFailed'), cameraActive: false }
      };
    }
  }

  // Stops scanner animation loop and camera stream.
  stopPhoneScanner(): void {
    if (this.phoneScanAnimationFrameId !== null) {
      cancelAnimationFrame(this.phoneScanAnimationFrameId);
      this.phoneScanAnimationFrameId = null;
    }
    if (this.phoneScanStream) {
      this.phoneScanStream.getTracks().forEach((track) => track.stop());
      this.phoneScanStream = null;
    }
    if (this.phoneScannerVideo?.nativeElement) {
      this.renderer.setProperty(this.phoneScannerVideo.nativeElement, 'srcObject', null);
    }
    this.phoneScanDetector = null;
    this.phoneScanActiveFieldId = null;
  }

  // Runs frame-by-frame barcode detection while the scanner is active.
  protected scanPhoneFrame(): void {
    const fieldId = this.phoneScanActiveFieldId;
    // Native video element access is required for MediaStream playback APIs.
    const video = this.phoneScannerVideo?.nativeElement;
    const detector = this.phoneScanDetector;
    if (!fieldId || !video || !detector) {
      return;
    }

    const tick = async (): Promise<void> => {
      if (!this.phoneScanActiveFieldId || this.phoneScanActiveFieldId !== fieldId) {
        return;
      }

      try {
        const results = await detector.detect(video);
        const rawValue = results[0]?.rawValue?.trim();
        if (rawValue) {
          const editor = this.phoneScanEditors[fieldId];
          if (editor) {
            this.phoneScanEditors = {
              ...this.phoneScanEditors,
              [fieldId]: {
                ...editor,
                value: this.sanitizePhoneValue(rawValue),
                detectedValue: rawValue,
                cameraError: undefined
              }
            };
          }
        }
      } catch {
        // Keep scanning quietly; the preview should stay lightweight.
      }

      this.phoneScanAnimationFrameId = requestAnimationFrame(() => {
        void tick();
      });
    };

    void tick();
  }

  // Creates a native BarcodeDetector when the browser supports it.
  protected async createPhoneScanDetector(mode: 'qr' | 'barcode'): Promise<PhoneBarcodeScanDetector | null> {
    const detectorCtor = (globalThis as typeof globalThis & { BarcodeDetector?: new (opts: { formats: string[] }) => PhoneBarcodeScanDetector }).BarcodeDetector;
    if (!detectorCtor) {
      return null;
    }

    const formats = mode === 'qr'
      ? ['qr_code']
      : ['code_128', 'code_39', 'code_93', 'ean_13', 'ean_8', 'itf', 'upc_a', 'upc_e', 'codabar', 'data_matrix'];

    try {
      return new detectorCtor({ formats });
    } catch {
      return null;
    }
  }

  // Resolves the selected/default country-code prefix.
  getPhonePrefix(field: BuilderField): string {
    return this.phoneCountrySelections[field.id] || field.properties.defaultCountryCode || field.properties.phoneCountryCode || '+91';
  }

  // Checks whether time/date-time controls should include seconds.
  showDateTimeSeconds(field: BuilderField): boolean {
    return field.properties.dateTimeShowSeconds ?? field.properties.timeShowSeconds;
  }

  // Builds available country-code options from field settings.
  getPhoneCountryOptions(field: BuilderField): string[] {
    const raw = (field.properties.countryCodeOptions || '').trim();
    const fallbackCode = field.properties.defaultCountryCode || field.properties.phoneCountryCode || '+91';
    if (!raw || raw.toLowerCase() === 'all countries') {
      return Array.from(new Set([fallbackCode, '+91', '+1', '+44', '+61', '+971']));
    }
    const options = raw.split(',').map((item) => item.trim()).filter(Boolean);
    return options.length ? Array.from(new Set([fallbackCode, ...options])) : [fallbackCode];
  }

  // Stores the selected country code for a phone field.
  setPhoneCountryCode(field: BuilderField, code: string): void {
    this.phoneCountrySelections = {
      ...this.phoneCountrySelections,
      [field.id]: code
    };
  }

  // Resolves yes/no labels for decision box buttons.
  getDecisionLabel(field: BuilderField, truthy: boolean): string {
    return truthy ? (field.properties.decisionTrueLabel || this.t('preview.yes')) : (field.properties.decisionFalseLabel || this.t('preview.no'));
  }

  // Checks whether a decision box value is selected.
  isDecisionSelected(field: BuilderField, truthy: boolean): boolean {
    return this.getValue(field.id) === truthy;
  }

  // Returns textarea rows with a minimum usable height.
  getTextareaRows(field: BuilderField): number {
    return Math.max(field.properties.rows || 4, 3);
  }

}
