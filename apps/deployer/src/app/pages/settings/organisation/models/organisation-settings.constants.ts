import type { DeployerI18nService } from '../../../../services/deployer-i18n.service';

type DeployerTranslator = Pick<DeployerI18nService, 'translate'>;

export const createOrganisationTypeOptions = (i18n: DeployerTranslator): readonly string[] => [
  i18n.translate('organisations.entityTypeItServices'),
  i18n.translate('organisations.entityTypeEnterpriseCustomer'),
  i18n.translate('organisations.entityTypeOperations')
];

export const createOrganisationStatusOptions = (i18n: DeployerTranslator): readonly string[] => [
  i18n.translate('users.active'),
  i18n.translate('users.inactive')
];
