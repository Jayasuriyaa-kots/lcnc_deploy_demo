import { Injectable, inject } from '@angular/core';
import { SettingsFacadeService } from '../../services/settings-facade.service';

@Injectable({ providedIn: 'root' })
export class InvoicesSettingsFacadeService {
  private readonly facade = inject(SettingsFacadeService);

  readonly invoices = this.facade.invoices;
  readonly invoiceRows = this.facade.invoiceRows;
  readonly invoiceDialogId = this.facade.invoiceDialogId;
  readonly markPaidId = this.facade.markPaidId;

  invoiceById(id: string | null) {
    return this.facade.invoiceById(id);
  }
}
