import { ReportActionGroup } from '@builder/features/report-builder/models/report-builder.models';
import { REPORTS_LANG } from '@builder/features/report-builder/lang/reports.lang';

const L = REPORTS_LANG;

function actionItems(flags: { edit: boolean; duplicate: boolean; delete: boolean }) {
  return [
    { label: L.common.edit, enabled: flags.edit },
    { label: L.common.duplicate, enabled: flags.duplicate },
    { label: L.common.delete, enabled: flags.delete },
  ];
}

export const REPORT_BUILDER_QUICK_ACTION_GROUPS: ReportActionGroup[] = [
  {
    title: L.rightPanel.singleRecord,
    description: L.actionGroups.singleRecordDescription,
    items: actionItems({ edit: true, duplicate: true, delete: true }),
  },
  {
    title: L.rightPanel.rightClickRecord,
    description: L.actionGroups.rightClickRecordDescription,
    items: actionItems({ edit: true, duplicate: false, delete: true }),
  },
  {
    title: L.rightPanel.multipleSelection,
    description: L.actionGroups.multipleSelectionDescription,
    items: actionItems({ edit: false, duplicate: true, delete: true }),
  },
];

export const REPORT_BUILDER_DETAIL_ACTION_GROUPS: ReportActionGroup[] = [
  {
    title: L.rightPanel.detailViewActions,
    description: L.actionGroups.detailViewActionsDescription,
    items: actionItems({ edit: true, duplicate: true, delete: true }),
  },
];
