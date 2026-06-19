import { AuditRecord } from '../pages/audit/models';
import type { DeployerI18nService } from '../services/deployer-i18n.service';

type DeployerTranslator = Pick<DeployerI18nService, 'translate'>;

export const createAuditRecords = (i18n: DeployerTranslator): AuditRecord[] => [
  {
    id: 'a-1',
    actor: 'Maya Bennett',
    timestamp: '2026-04-06 10:26',
    actionType: 'Status Update',
    affectedEntity: 'Application',
    description: i18n.translate('mockData.auditDispatchStatusUpdate')
  },
  {
    id: 'a-2',
    actor: 'System',
    timestamp: '2026-04-06 09:58',
    actionType: 'Billing Alert',
    affectedEntity: 'Invoice',
    description: i18n.translate('mockData.auditInvoiceOverdue')
  },
  {
    id: 'a-3',
    actor: 'Rohan Iyer',
    timestamp: '2026-04-06 09:12',
    actionType: 'Credential Action',
    affectedEntity: 'User',
    description: i18n.translate('mockData.auditPasswordReset')
  },
  {
    id: 'a-4',
    actor: 'Alex Morgan',
    timestamp: '2026-04-06 08:41',
    actionType: 'User Registration',
    affectedEntity: 'Organisation Member',
    description: i18n.translate('mockData.auditUserRegistered')
  }
];
