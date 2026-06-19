import { Injectable } from '@angular/core';
import { CanvasWidget, CanvasWidgetType } from '@builder/features/page-builder/models/page-builder-canvas.model';
import { PageBuilderViewport } from '@builder/features/page-builder/models/page-builder-page.model';

export interface CanvasWidgetDragState {
  widgetId: string;
  offsetX: number;
  offsetY: number;
}

export interface CanvasWidgetResizeState {
  widgetId: string;
  handle: 'top-left' | 'bottom-right';
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
  startPointerX: number;
  startPointerY: number;
}

export interface CanvasBounds {
  width: number;
  height: number;
}

export interface CanvasSizeLimits {
  minWidth: number;
  minHeight: number;
}

export interface CanvasLayoutScaleContext {
  configuredWidth: string | number | null | undefined;
  editCanvasInnerInset: number;
  editDesktopCanvasWidgetWidth: number;
  viewport: PageBuilderViewport;
}

export interface CanvasDragStartContext {
  event: MouseEvent;
  widget: CanvasWidget;
  canvasLayer: HTMLElement;
  scale: number;
  widthScale: number;
}

export interface CanvasResizeFrameContext {
  bounds: CanvasBounds;
  event: MouseEvent;
  resizeState: CanvasWidgetResizeState;
  scale: number;
  sizeLimits: CanvasSizeLimits;
  widthScale: number;
}

export interface CanvasDragFrameContext {
  bounds: CanvasBounds;
  canvasLayer: HTMLElement;
  dragState: CanvasWidgetDragState;
  event: MouseEvent;
  scale: number;
  widget: CanvasWidget;
  widthScale: number;
}

@Injectable({ providedIn: 'root' })
export class PageBuilderCanvasInteractionService {
  getCanvasBounds(
    dropzone: HTMLElement,
    context: { scale: number; verticalRunway: number; widthScale: number },
  ): CanvasBounds {
    const rect = dropzone.getBoundingClientRect();

    return {
      width: rect.width / context.scale / context.widthScale,
      height: Math.max(rect.height, dropzone.scrollHeight) / context.scale + context.verticalRunway,
    };
  }

  getViewportWidthScale(context: CanvasLayoutScaleContext): number {
    if (typeof context.configuredWidth === 'string' && context.configuredWidth.endsWith('px')) {
      const parsedWidth = Number.parseFloat(context.configuredWidth);

      if (Number.isFinite(parsedWidth)) {
        const viewportCanvasWidth = Math.max(0, parsedWidth - context.editCanvasInnerInset * 2);
        const rawScale = Math.min(1, viewportCanvasWidth / context.editDesktopCanvasWidgetWidth) || 1;

        if (context.viewport === 'mobile') {
          return Math.max(0.68, rawScale);
        }

        return rawScale;
      }
    }

    return 1;
  }

  isInteractiveTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) {
      return false;
    }

    return !!target.closest(
      'button, input, select, textarea, option, a, label, summary, video, audio, iframe, [contenteditable="true"], [role="button"], .qo-select, .qo-select-trigger, .qo-select-dropdown',
    );
  }

  createDragState(context: CanvasDragStartContext): CanvasWidgetDragState {
    const rect = context.canvasLayer.getBoundingClientRect();
    const pointerX = (context.event.clientX - rect.left) / context.scale / context.widthScale;
    const pointerY = (context.event.clientY - rect.top) / context.scale;

    return {
      widgetId: context.widget.id,
      offsetX: pointerX - context.widget.x,
      offsetY: pointerY - context.widget.y,
    };
  }

  createResizeState(
    event: MouseEvent,
    widget: CanvasWidget,
    handle: 'top-left' | 'bottom-right',
  ): CanvasWidgetResizeState {
    return {
      widgetId: widget.id,
      handle,
      startX: widget.x,
      startY: widget.y,
      startWidth: widget.width,
      startHeight: widget.height,
      startPointerX: event.clientX,
      startPointerY: event.clientY,
    };
  }

  buildResizeFrame(context: CanvasResizeFrameContext): { x: number; y: number; width: number; height: number } {
    const deltaX = (context.event.clientX - context.resizeState.startPointerX) / context.scale / context.widthScale;
    const deltaY = (context.event.clientY - context.resizeState.startPointerY) / context.scale;
    const maxWidth = Math.max(context.sizeLimits.minWidth, context.bounds.width - context.resizeState.startX);
    const maxHeight = Math.max(context.sizeLimits.minHeight, context.bounds.height - context.resizeState.startY);
    const minWidth = Math.min(context.sizeLimits.minWidth, maxWidth);
    let nextX = context.resizeState.startX;
    let nextY = context.resizeState.startY;
    let nextWidth = this.clamp(context.resizeState.startWidth + deltaX, minWidth, maxWidth);
    let nextHeight = this.clamp(
      context.resizeState.startHeight + deltaY,
      context.sizeLimits.minHeight,
      maxHeight,
    );

    if (context.resizeState.handle === 'top-left') {
      const rightEdge = context.resizeState.startX + context.resizeState.startWidth;
      const bottomEdge = context.resizeState.startY + context.resizeState.startHeight;
      const maxX = Math.max(0, rightEdge - context.sizeLimits.minWidth);
      const maxY = Math.max(0, bottomEdge - context.sizeLimits.minHeight);

      nextX = this.clamp(context.resizeState.startX + deltaX, 0, maxX);
      nextY = this.clamp(context.resizeState.startY + deltaY, 0, maxY);
      nextWidth = this.clamp(rightEdge - nextX, minWidth, rightEdge);
      nextHeight = this.clamp(bottomEdge - nextY, context.sizeLimits.minHeight, bottomEdge);
    }

    return {
      x: nextX,
      y: nextY,
      width: nextWidth,
      height: nextHeight,
    };
  }

  buildDragFrame(context: CanvasDragFrameContext): { x: number; y: number } {
    const rect = context.canvasLayer.getBoundingClientRect();
    const maxX = Math.max(0, context.bounds.width - context.widget.width);
    const maxY = Math.max(0, context.bounds.height - context.widget.height);

    return {
      x: this.clamp(
        (context.event.clientX - rect.left) / context.scale / context.widthScale - context.dragState.offsetX,
        0,
        maxX,
      ),
      y: this.clamp(
        (context.event.clientY - rect.top) / context.scale - context.dragState.offsetY,
        0,
        maxY,
      ),
    };
  }

  getDuplicatePlacement(
    widget: CanvasWidget,
    bounds: CanvasBounds,
    offset = 24,
  ): { x: number; y: number } {
    return {
      x: this.clamp(widget.x + offset, 0, Math.max(0, bounds.width - widget.width)),
      y: this.clamp(widget.y + offset, 0, Math.max(0, bounds.height - widget.height)),
    };
  }

  autoScrollCanvasWhileDragging(
    event: MouseEvent,
    canvasLayer: HTMLElement,
    context: { edgeThreshold: number; step: number },
  ): void {
    const scrollContainer = canvasLayer.closest('.canvas-stage') as HTMLElement | null;

    if (!scrollContainer) {
      return;
    }

    const rect = scrollContainer.getBoundingClientRect();
    let deltaY = 0;

    if (event.clientY > rect.bottom - context.edgeThreshold) {
      deltaY = context.step;
    } else if (event.clientY < rect.top + context.edgeThreshold) {
      deltaY = -context.step;
    }

    if (deltaY !== 0) {
      scrollContainer.scrollTop += deltaY;
    }
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }
}
