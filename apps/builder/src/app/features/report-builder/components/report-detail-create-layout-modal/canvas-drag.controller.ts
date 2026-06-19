import { WritableSignal } from '@angular/core';
import {
  CanvasItem,
  resolveParentSectionId,
  resolveParentTabPlacement,
} from './canvas-item.model';

interface DragState {
  itemId: string;
  mode: 'move' | 'resize';
  startX: number;
  startY: number;
  itemStartX: number;
  itemStartY: number;
  itemStartW: number;
  itemStartH: number;
  childStartPositions?: Record<string, { x: number; y: number }>;
}

const MIN_WIDTH = 140;
const MIN_HEIGHT = 40;

/**
 * Encapsulates canvas item move/resize pointer interaction — drag state and the
 * window mousemove/mouseup listeners. It operates on the host component's signals
 * so the component itself stays free of interaction/business logic.
 *
 * Call `destroy()` on host teardown to detach any in-flight listeners.
 */
export class CanvasDragController {
  private dragState: DragState | null = null;

  constructor(
    private readonly items: WritableSignal<CanvasItem[]>,
    private readonly selectedItemId: WritableSignal<string | null>,
    private readonly tabActiveIndex: () => Record<string, number>,
    private readonly beforeStart: () => void = () => {},
  ) {}

  /** Begins moving an item (and its section/tab children) from a pointer event. */
  startMove(event: MouseEvent, itemId: string): void {
    if (event.button !== 0) return;
    this.beforeStart();
    event.preventDefault();
    this.selectedItemId.set(itemId);

    const item = this.items().find((candidate) => candidate.id === itemId);
    if (!item) return;

    const childStartPositions: Record<string, { x: number; y: number }> = {};
    if (item.type === 'section' || item.type === 'tab') {
      const parentKey = item.type === 'section' ? 'parentSectionId' : 'parentTabItemId';
      this.items()
        .filter((child) => child[parentKey] === item.id)
        .forEach((child) => {
          childStartPositions[child.id] = { x: child.x, y: child.y };
        });
    }

    this.dragState = {
      itemId,
      mode: 'move',
      startX: event.clientX,
      startY: event.clientY,
      itemStartX: item.x,
      itemStartY: item.y,
      itemStartW: item.width,
      itemStartH: item.height,
      childStartPositions: Object.keys(childStartPositions).length ? childStartPositions : undefined,
    };
    this.attach();
  }

  /** Begins resizing an item from a pointer event. */
  startResize(event: MouseEvent, itemId: string): void {
    if (event.button !== 0) return;
    this.beforeStart();
    event.preventDefault();
    event.stopPropagation();

    const item = this.items().find((candidate) => candidate.id === itemId);
    if (!item) return;

    this.dragState = {
      itemId,
      mode: 'resize',
      startX: event.clientX,
      startY: event.clientY,
      itemStartX: item.x,
      itemStartY: item.y,
      itemStartW: item.width,
      itemStartH: item.height,
    };
    this.attach();
  }

  /** Detaches any active listeners and clears state (call on host destroy). */
  destroy(): void {
    this.detach();
    this.dragState = null;
  }

  private attach(): void {
    window.addEventListener('mousemove', this.handleMove);
    window.addEventListener('mouseup', this.stopMove);
  }

  private detach(): void {
    window.removeEventListener('mousemove', this.handleMove);
    window.removeEventListener('mouseup', this.stopMove);
  }

  private readonly handleMove = (event: MouseEvent): void => {
    const state = this.dragState;
    if (!state) return;

    const deltaX = event.clientX - state.startX;
    const deltaY = event.clientY - state.startY;

    if (state.mode === 'resize') {
      this.items.update((items) =>
        items.map((item) =>
          item.id === state.itemId
            ? {
                ...item,
                width: Math.max(MIN_WIDTH, Math.round(state.itemStartW + deltaX)),
                height: Math.max(MIN_HEIGHT, Math.round(state.itemStartH + deltaY)),
              }
            : item,
        ),
      );
      return;
    }

    this.items.update((items) =>
      items.map((item) => {
        if (item.id === state.itemId) {
          return {
            ...item,
            x: Math.max(0, Math.round(state.itemStartX + deltaX)),
            y: Math.max(0, Math.round(state.itemStartY + deltaY)),
          };
        }
        const childStart = state.childStartPositions?.[item.id];
        if (childStart) {
          return {
            ...item,
            x: Math.max(0, Math.round(childStart.x + deltaX)),
            y: Math.max(0, Math.round(childStart.y + deltaY)),
          };
        }
        return item;
      }),
    );
  };

  private readonly stopMove = (): void => {
    const state = this.dragState;
    if (state && state.mode === 'move') {
      this.items.update((items) =>
        items.map((item) => {
          if (item.id !== state.itemId) return item;
          if (item.type === 'section' || item.type === 'tab') return item;
          const parentSectionId = resolveParentSectionId(items, item.x, item.y, item.width, item.height, item.id);
          const tabPlacement = resolveParentTabPlacement(items, item.x, item.y, item.width, item.height, item.id, this.tabActiveIndex());
          return {
            ...item,
            parentSectionId,
            parentTabItemId: tabPlacement?.tabItemId ?? null,
            parentTabKey: tabPlacement?.tabKey ?? null,
          };
        }),
      );
    }
    this.dragState = null;
    this.detach();
  };
}
