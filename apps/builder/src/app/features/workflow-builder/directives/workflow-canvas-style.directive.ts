import { Directive, ElementRef, Renderer2, computed, effect, inject, input } from '@angular/core';

@Directive({
  selector: '[appWorkflowCanvasStyle]',
  standalone: true,
})
export class WorkflowCanvasStyleDirective {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);

  readonly width = input.required<number>({ alias: 'appWorkflowCanvasWidth' });
  readonly height = input.required<number>({ alias: 'appWorkflowCanvasHeight' });
  readonly zoom = input.required<number>({ alias: 'appWorkflowCanvasZoom' });

  private readonly transform = computed(() => `scale(${this.zoom()})`);

  constructor() {
    effect(() => {
      const element = this.elementRef.nativeElement;

      this.renderer.setStyle(element, 'width', `${this.width()}px`);
      this.renderer.setStyle(element, 'height', `${this.height()}px`);
      this.renderer.setStyle(element, 'transform', this.transform());
    });
  }
}
