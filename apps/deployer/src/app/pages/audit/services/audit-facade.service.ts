import { Injectable, inject, signal } from '@angular/core';
import { createAuditRecords } from '../../../mock-data/audit.mock';
import { DeployerI18nService } from '../../../services/deployer-i18n.service';

@Injectable({ providedIn: 'root' })
export class AuditFacadeService {
  private readonly i18n = inject(DeployerI18nService);

  readonly records = signal(createAuditRecords(this.i18n));
}
