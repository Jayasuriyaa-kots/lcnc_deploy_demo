export type BuilderPreviewMode = 'auto' | 'desktop' | 'tablet' | 'mobile';

export interface BuilderPreviewViewportConfig {
  mode: BuilderPreviewMode;
  label: string;
  width: string;
  maxWidth?: string;
  scale: number;
}
