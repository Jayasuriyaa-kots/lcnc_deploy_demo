import { Directive, input, output } from '@angular/core';

@Directive()
export abstract class BaseOverlayComponent {
  readonly showClose = input<boolean>(true);
  readonly closeOnBackdrop = input<boolean>(true);
  readonly close = output<void>();

  protected requestClose(): void {
    this.close.emit();
  }

  protected requestCloseFromBackdrop(): void {
    if (this.closeOnBackdrop()) {
      this.requestClose();
    }
  }
}
