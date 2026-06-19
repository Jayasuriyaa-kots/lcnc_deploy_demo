import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { QoButtonComponent } from '@qo/ui-components/lib/primitives/button/button.component';

@Component({
  selector: 'qo-pagination',
  standalone: true,
  imports: [QoButtonComponent],
  template: `
    <div class="qo-pagination">
      <div class="qo-pagination-info">
        Showing <span class="qo-pagination-font-medium">{{ startIndex() }}</span> to <span class="qo-pagination-font-medium">{{ endIndex() }}</span> of <span class="qo-pagination-font-medium">{{ total() }}</span> results
      </div>
      
      <div class="qo-pagination-actions">
        <qo-button 
          variant="secondary" 
          size="sm" 
          [disabled]="page() === 1"
          (click)="pageChange.emit(page() - 1)">
          Previous
        </qo-button>
        
        <div class="qo-pagination-pages">
          @for (p of pages(); track p) {
            <button 
              class="qo-pagination-page-btn" 
              [class.qo-pagination-page-active]="p === page()"
              (click)="pageChange.emit(p)">
              {{ p }}
            </button>
          }
        </div>
        
        <qo-button 
          variant="secondary" 
          size="sm" 
          [disabled]="page() === totalPages()"
          (click)="pageChange.emit(page() + 1)">
          Next
        </qo-button>
      </div>
    </div>
  `,
  styleUrl: './pagination.component.scss'
,
  changeDetection: ChangeDetectionStrategy.OnPush})
export class QoPaginationComponent {
  total = input.required<number>();
  page = input<number>(1);
  pageSize = input<number>(10);
  
  pageChange = output<number>();

  get totalPages() {
    return () => Math.ceil(this.total() / this.pageSize()) || 1;
  }

  get startIndex() {
    return () => this.total() === 0 ? 0 : (this.page() - 1) * this.pageSize() + 1;
  }

  get endIndex() {
    return () => Math.min(this.page() * this.pageSize(), this.total());
  }

  get pages() {
    return () => {
      const tp = this.totalPages();
      const p = this.page();
      // Simple logic: show up to 5 pages around current page
      let start = Math.max(1, p - 2);
      let end = Math.min(tp, start + 4);
      
      if (end - start < 4) {
        start = Math.max(1, end - 4);
      }
      
      return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    };
  }
}

