import { Directive, ElementRef, Renderer2, effect, inject, input } from '@angular/core';

@Directive({
  selector: '[appWorkflowNodePosition]',
  standalone: true,
})
export class WorkflowNodePositionDirective {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);

  readonly x = input.required<number>({ alias: 'appWorkflowNodeX' });
  readonly y = input.required<number>({ alias: 'appWorkflowNodeY' });

  constructor() {
    effect(() => {
      const element = this.elementRef.nativeElement;

      this.renderer.setStyle(element, 'left', `${this.x()}px`);
      this.renderer.setStyle(element, 'top', `${this.y()}px`);
    });
  }
}
