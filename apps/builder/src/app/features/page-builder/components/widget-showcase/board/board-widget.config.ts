export type BoardWidgetVariant =
  | 'department-list'
  | 'order-status'
  | 'tickets-region'
  | 'project-leaderboard'
  | 'bug-report'
  | 'fitness-tracker';

export interface BoardWidgetPreset {
  variant: BoardWidgetVariant;
  label: string;
}

export const BOARD_WIDGET_PRESETS: readonly BoardWidgetPreset[] = [
  { variant: 'department-list', label: 'Course Completion by Department' },
  { variant: 'order-status', label: 'Order Status' },
  { variant: 'tickets-region', label: 'Tickets Sold by Region' },
  { variant: 'project-leaderboard', label: 'Project Leaderboard' },
  { variant: 'bug-report', label: 'Bug Report' },
  { variant: 'fitness-tracker', label: 'Fitness Tracker' },
] as const;

export function getBoardWidgetPreset(variant: BoardWidgetVariant): BoardWidgetPreset {
  return (
    BOARD_WIDGET_PRESETS.find((preset) => preset.variant === variant) ??
    BOARD_WIDGET_PRESETS[0]
  );
}
