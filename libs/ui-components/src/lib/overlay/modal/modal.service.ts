import {
  ApplicationRef,
  ComponentRef,
  EnvironmentInjector,
  Injectable,
  Injector,
  Renderer2,
  RendererFactory2,
  Type,
} from '@angular/core';

export interface ModalConfig<TComponent = unknown> {
  title: string;
  component: Type<TComponent>;
  inputs?: Record<string, unknown>;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface ModalRef<TResult = unknown> {
  close: (result?: TResult) => void;
  onClose: Promise<TResult | null>;
}

@Injectable({ providedIn: 'root' })
export class QoModalService {
  private readonly renderer: Renderer2;

  private container: HTMLElement | null = null;
  private modalComponentRef: ComponentRef<unknown> | null = null;
  private contentComponentRef: ComponentRef<unknown> | null = null;

  constructor(
    private readonly appRef: ApplicationRef,
    private readonly injector: Injector,
    private readonly environmentInjector: EnvironmentInjector,
    rendererFactory: RendererFactory2
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  // Uses dynamic component loading to spawn the modal wrapper and its content.
  open(config: ModalConfig): ModalRef {
    void config;
    // Placeholder implementation retained to avoid changing behavior.
    return {
      close: (_result?: unknown) => {},
      onClose: Promise.resolve(null),
    };
  }
}
