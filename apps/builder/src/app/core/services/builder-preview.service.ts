import { Injectable, computed, signal } from '@angular/core';
import { BuilderPreviewMode, BuilderPreviewViewportConfig } from '@builder/core/models/builder-preview.model';

@Injectable({ providedIn: 'root' })
export class BuilderPreviewService {
  readonly mode = signal<BuilderPreviewMode>('desktop');

  private readonly configs: Record<BuilderPreviewMode, BuilderPreviewViewportConfig> = {
    auto: { mode: 'auto', label: 'Auto', width: '100%', maxWidth: '100%', scale: 1 },
    desktop: {
      mode: 'desktop',
      label: 'Desktop',
      width: '1280px',
      maxWidth: '100%',
      scale: 1,
    },
    tablet: {
      mode: 'tablet',
      label: 'Tablet',
      width: '820px',
      maxWidth: '100%',
      scale: 1,
    },
    mobile: {
      mode: 'mobile',
      label: 'Mobile',
      width: '560px',
      maxWidth: '100%',
      scale: 1,
    },
  };

  readonly config = computed(() => this.configs[this.mode()]);

  setMode(mode: BuilderPreviewMode): void {
    this.mode.set(mode);
  }
}
