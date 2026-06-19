import {
  ApplicationRef,
  ComponentRef,
  createComponent,
  EmbeddedViewRef,
  EnvironmentInjector,
  Injectable,
  Injector,
  Renderer2,
  RendererFactory2
} from '@angular/core';
import { QoConfirmDialogComponent, QoConfirmDialogConfig } from './confirm-dialog.component';

@Injectable({ providedIn: 'root' })
export class QoConfirmDialogService {
  private activeDialog: ComponentRef<QoConfirmDialogComponent> | null = null;
  private container: HTMLElement | null = null;
  private renderer: Renderer2;

  constructor(
    private appRef: ApplicationRef,
    private injector: Injector,
    private environmentInjector: EnvironmentInjector,
    rendererFactory: RendererFactory2
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  confirm(title: string, message: string, config: Partial<QoConfirmDialogConfig> = {}): Promise<boolean> {
    this.teardown();
    this.ensureContainer();

    return new Promise<boolean>((resolve) => {
      const dialogRef = createComponent(QoConfirmDialogComponent, {
        environmentInjector: this.environmentInjector,
        elementInjector: this.injector
      });

      dialogRef.setInput('config', {
        title,
        message,
        ...config
      });

      dialogRef.instance.confirmed.subscribe(() => {
        resolve(true);
        this.teardown();
      });

      dialogRef.instance.cancelled.subscribe(() => {
        resolve(false);
        this.teardown();
      });

      this.appRef.attachView(dialogRef.hostView);
      const hostView = dialogRef.hostView as EmbeddedViewRef<unknown>;
      const dialogElement = hostView.rootNodes[0] as HTMLElement;
      this.renderer.appendChild(this.container, dialogElement);
      this.activeDialog = dialogRef;
    });
  }

  private ensureContainer(): void {
    if (this.container) {
      return;
    }

    this.container = this.renderer.createElement('div');
    this.renderer.addClass(this.container, 'qo-confirm-dialog-host');
    this.renderer.setStyle(this.container, 'position', 'fixed');
    this.renderer.setStyle(this.container, 'inset', '0');
    this.renderer.setStyle(this.container, 'z-index', '10000');
    this.renderer.appendChild(document.body, this.container);
  }

  private teardown(): void {
    if (this.activeDialog) {
      this.appRef.detachView(this.activeDialog.hostView);
      this.activeDialog.destroy();
      this.activeDialog = null;
    }

    if (this.container) {
      this.renderer.removeChild(document.body, this.container);
      this.container = null;
    }
  }
}
