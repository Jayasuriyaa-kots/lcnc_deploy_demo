import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class WorkflowModalService {
  readonly buttonCreateOpen = signal(false);
  readonly functionEditorOpen = signal(false);

  openButtonCreate(): void {
    this.buttonCreateOpen.set(true);
  }

  closeButtonCreate(): void {
    this.buttonCreateOpen.set(false);
  }

  openFunctionEditor(): void {
    this.functionEditorOpen.set(true);
  }

  closeFunctionEditor(): void {
    this.functionEditorOpen.set(false);
  }
}
