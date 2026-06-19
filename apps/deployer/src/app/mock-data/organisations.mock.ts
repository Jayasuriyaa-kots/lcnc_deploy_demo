import { Organisation } from '../core/layout/models/organisation.model';
import type { DeployerI18nService } from '../services/deployer-i18n.service';

type DeployerTranslator = Pick<DeployerI18nService, 'translate'>;

export const createOrganisations = (i18n: DeployerTranslator): Organisation[] => [
  {
    id: 'org-1',
    name: 'Northstar Logistics',
    entityType: i18n.translate('organisations.entityTypeItServices'),
    primaryOwnerEmail: 'ops@northstar.example',
    billingEmail: 'billing@northstar.example',
    additionalAdminUsers: ['admin@northstar.example'],
    status: 'active',
    createdAt: '2026-03-01T09:00:00.000Z'
  },
  {
    id: 'org-2',
    name: 'Helio Financial',
    entityType: i18n.translate('organisations.entityTypeEnterpriseCustomer'),
    primaryOwnerEmail: 'ops@helio.example',
    billingEmail: 'billing@helio.example',
    additionalAdminUsers: ['security@helio.example'],
    status: 'active',
    createdAt: '2026-03-08T09:00:00.000Z'
  },
  {
    id: 'org-3',
    name: 'Axis Health Systems',
    entityType: i18n.translate('organisations.entityTypeOperations'),
    primaryOwnerEmail: 'ops@axis.example',
    billingEmail: 'billing@axis.example',
    status: 'active',
    createdAt: '2026-03-14T09:00:00.000Z'
  },
  {
    id: 'org-4',
    name: 'Everforge Retail',
    entityType: i18n.translate('organisations.entityTypeEnterpriseCustomer'),
    primaryOwnerEmail: 'ops@everforge.example',
    billingEmail: 'billing@everforge.example',
    status: 'inactive',
    createdAt: '2026-03-20T09:00:00.000Z'
  }
];
