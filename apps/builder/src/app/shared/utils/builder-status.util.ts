import { BuilderAssetStatus } from '@builder/core/models/builder-shell.model';

export interface BuilderStatusPresentation {
  badgeLabel: string;
  toggleLabel: string;
  activationLabel: string;
  deactivationLabel: string;
  nextStatus: BuilderAssetStatus;
  isLive: boolean;
}

export function getBuilderStatusPresentation(status: BuilderAssetStatus): BuilderStatusPresentation {
  const isLive = status === 'live';

  return {
    badgeLabel: isLive ? 'Live' : 'Draft',
    toggleLabel: isLive ? 'Active' : 'Inactive',
    activationLabel: isLive ? 'Deactivate' : 'Activate',
    deactivationLabel: isLive ? 'Move to draft' : 'Publish live',
    nextStatus: isLive ? 'draft' : 'live',
    isLive,
  };
}
