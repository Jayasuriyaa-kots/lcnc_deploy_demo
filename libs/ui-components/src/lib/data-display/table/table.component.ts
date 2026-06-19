import { Component, ChangeDetectionStrategy, input, output, ContentChildren, QueryList, TemplateRef, Directive } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TableRow extends Record<string, unknown> {
  id?: string | number;
}

@Directive({
  selector: '[qoTableColumn]',
  standalone: true,
})
export class QoTableColumnDirective {
  readonly name = input.required<string>({ alias: 'qoTableColumn' });
  readonly header = input.required<string>();

  constructor(public readonly template: TemplateRef<unknown>) {}
}

@Directive({
  selector: '[qoTableEmpty]',
  standalone: true,
})
export class QoTableEmptyDirective {
  constructor(public readonly template: TemplateRef<unknown>) {}
}

@Directive({
  selector: '[qoTableDetail]',
  standalone: true,
})
export class QoTableDetailDirective {
  constructor(public readonly template: TemplateRef<unknown>) {}
}

@Component({
  selector: 'qo-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="qo-table-container">
      <table class="qo-table">
        <thead>
          <tr>
            @for (col of columns(); track col.name()) {
              <th [class]="'qo-table-th qo-table-th-' + col.name()">{{ col.header() }}</th>
            }
          </tr>
        </thead>
        <tbody>
          @for (row of data(); track trackBy()(row, $index)) {
            <tr class="qo-table-tr" (click)="rowClick.emit(row)">
              @for (col of columns(); track col.name()) {
                <td class="qo-table-td">
                  <ng-container *ngTemplateOutlet="col.template; context: { $implicit: row }"></ng-container>
                </td>
              }
            </tr>
            @if (detailTemplate() && detailWhen()(row)) {
              <tr class="qo-table-detail-tr">
                <td [attr.colspan]="columns().length" class="qo-table-detail-td">
                  <ng-container *ngTemplateOutlet="detailTemplate()!.template; context: { $implicit: row }"></ng-container>
                </td>
              </tr>
            }
          } @empty {
            <tr>
              <td [attr.colspan]="columns().length" class="qo-table-empty">
                @if (emptyTemplate()) {
                  <ng-container *ngTemplateOutlet="emptyTemplate()!.template"></ng-container>
                } @else {
                  <div class="qo-table-empty-default">No data available</div>
                }
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styleUrl: './table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QoTableComponent {
  data = input<TableRow[]>([]);
  trackBy = input<(item: TableRow, index: number) => string | number>((item, index) => item.id ?? index);
  detailWhen = input<(item: TableRow) => boolean>(() => false);

  @ContentChildren(QoTableColumnDirective) private readonly columnList!: QueryList<QoTableColumnDirective>;
  @ContentChildren(QoTableEmptyDirective) private readonly emptyTemplateList!: QueryList<QoTableEmptyDirective>;
  @ContentChildren(QoTableDetailDirective) private readonly detailTemplateList!: QueryList<QoTableDetailDirective>;

  readonly rowClick = output<TableRow>();

  readonly columns = () => this.columnList?.toArray() ?? [];
  readonly emptyTemplate = () => this.emptyTemplateList?.first ?? null;
  readonly detailTemplate = () => this.detailTemplateList?.first ?? null;
}
