import { Injectable } from '@angular/core';

@Injectable()
export class FormPreviewSignatureService {
  getSignaturePoint(
    event: MouseEvent | TouchEvent,
    canvas: HTMLCanvasElement
  ): { x: number; y: number } | null {
    const rect = canvas.getBoundingClientRect();
    const source = event instanceof TouchEvent ? event.touches[0] ?? event.changedTouches[0] : event;
    if (!source) {
      return null;
    }
    return {
      x: source.clientX - rect.left,
      y: source.clientY - rect.top,
    };
  }

  drawSignatureGuides(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.strokeStyle = 'rgb(208, 208, 208)';
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 24);
    ctx.lineTo(canvas.width, canvas.height - 24);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgb(26, 26, 26)';
    ctx.fillRect(0, canvas.height - 2, canvas.width, 2);
    ctx.restore();
    ctx.strokeStyle = 'rgb(31, 31, 31)';
    ctx.lineWidth = 2;
  }
}
