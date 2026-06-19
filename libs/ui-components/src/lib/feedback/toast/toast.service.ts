import { ApplicationRef, ComponentRef, createComponent, EmbeddedViewRef, EnvironmentInjector, Injectable, Injector, Renderer2, RendererFactory2 } from '@angular/core';
import { QoToastComponent, ToastType } from '@qo/ui-components/lib/feedback/toast/toast.component';

export interface ToastConfig {
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class QoToastService {
  private toasts: ComponentRef<QoToastComponent>[] = [];
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

  success(title: string, message?: string, duration = 3000): void {
    this.show({ type: 'success', title, message, duration });
  }

  error(title: string, message?: string, duration = 5000): void {
    this.show({ type: 'error', title, message, duration });
  }

  info(title: string, message?: string, duration = 3000): void {
    this.show({ type: 'info', title, message, duration });
  }

  warning(title: string, message?: string, duration = 4000): void {
    this.show({ type: 'warning', title, message, duration });
  }

  // Compatibility helper for builder screens that still use the legacy toast API.
  showLegacy(text: string, type: 'success' | 'error' | 'info' | 'warning' = 'success', duration = 3000): void {
    const titleMap: Record<'success' | 'error' | 'info' | 'warning', string> = {
      success: 'Success',
      error: 'Error',
      info: 'Info',
      warning: 'Warning'
    };

    this.show({
      type,
      title: titleMap[type],
      message: text,
      duration
    });
  }

  private show(config: ToastConfig): void {
    if (!this.container) {
      this.createContainer();
    }

    const toastRef = createComponent(QoToastComponent, {
      environmentInjector: this.environmentInjector,
      elementInjector: this.injector
    });

    toastRef.setInput('type', config.type);
    toastRef.setInput('title', config.title);
    toastRef.setInput('message', config.message);
    if (config.duration !== undefined) {
      toastRef.setInput('duration', config.duration);
    }

    toastRef.instance.close.subscribe(() => {
      this.removeToast(toastRef);
    });

    this.appRef.attachView(toastRef.hostView);
    const hostView = toastRef.hostView as EmbeddedViewRef<unknown>;
    const domElem = hostView.rootNodes[0] as HTMLElement;
    this.renderer.appendChild(this.container, domElem);
    
    this.toasts.push(toastRef);
  }

  private removeToast(toastRef: ComponentRef<QoToastComponent>): void {
    this.appRef.detachView(toastRef.hostView);
    toastRef.destroy();
    this.toasts = this.toasts.filter(t => t !== toastRef);
    
    if (this.toasts.length === 0 && this.container) {
      this.renderer.removeChild(document.body, this.container);
      this.container = null;
    }
  }

  private createContainer(): void {
    this.container = this.renderer.createElement('div');
    this.renderer.addClass(this.container, 'qo-toast-container');
    
    // Inline styles for the container so we don't need a global stylesheet
    this.renderer.setStyle(this.container, 'position', 'fixed');
    this.renderer.setStyle(this.container, 'bottom', '24px');
    this.renderer.setStyle(this.container, 'right', '24px');
    this.renderer.setStyle(this.container, 'z-index', '9999');
    this.renderer.setStyle(this.container, 'display', 'flex');
    this.renderer.setStyle(this.container, 'flex-direction', 'column');
    this.renderer.setStyle(this.container, 'gap', '12px');
    this.renderer.setStyle(this.container, 'pointer-events', 'none');
    
    this.renderer.appendChild(document.body, this.container);
  }
}
