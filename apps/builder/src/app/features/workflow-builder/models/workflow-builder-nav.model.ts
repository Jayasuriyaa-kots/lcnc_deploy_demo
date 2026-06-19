export type WorkflowSectionId =
  | 'form-actions'
  | 'events'
  | 'scheduler'
  | 'action-buttons'
  | 'functions';

export interface WorkflowSectionNavItem {
  id: WorkflowSectionId;
  label: string;
  icon: string;
  route: string;
}
