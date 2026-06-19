import { AfterContentInit, ChangeDetectionStrategy, Component, ContentChildren, QueryList, effect, input, output, signal } from '@angular/core';
import { BaseControlComponent } from '@qo/ui-components/lib/base';

@Component({
  selector: 'qo-tab',
  standalone: true,
  template: `
    <div class="qo-tab-content" [hidden]="!active()">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
    .qo-tab-content {
      width: 100%;
    }
  `]
,
  changeDetection: ChangeDetectionStrategy.OnPush})
export class QoTabComponent extends BaseControlComponent {
  title = input.required<string>();
  icon = input<string | undefined>(undefined);

  readonly active = signal(false);
}

@Component({
  selector: 'qo-tabs',
  standalone: true,
  imports: [],
  template: `
    <div class="qo-tabs">
      <div class="qo-tabs-header">
        @for (tab of tabsList(); track tab.title(); let i = $index) {
          <button 
            class="qo-tab-btn" 
            [class.qo-tab-btn-active]="tab.active()"
            [class.qo-tab-btn-disabled]="tab.disabled()"
            (click)="selectTab(tab)">
            {{ tab.title() }}
          </button>
        }
      </div>
      <div class="qo-tabs-body">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styleUrl: './tabs.component.scss'
})
export class QoTabsComponent implements AfterContentInit {
  @ContentChildren(QoTabComponent) tabs!: QueryList<QoTabComponent>;
  readonly selectedTitle = input<string | undefined>(undefined);
  readonly selectedTitleChange = output<string>();
  readonly tabsList = signal<QoTabComponent[]>([]);

  constructor() {
    effect(() => {
      this.syncActiveTab(this.selectedTitle());
    });
  }

  ngAfterContentInit(): void {
    this.tabsList.set(this.tabs.toArray());
    this.syncActiveTab(this.selectedTitle());
    this.tabs.changes.subscribe(() => {
      this.tabsList.set(this.tabs.toArray());
      this.syncActiveTab(this.selectedTitle());
    });
  }

  selectTab(tab: QoTabComponent): void {
    if (tab.disabled()) {
      return;
    }

    this.setActiveTab(tab, true);
  }

  private syncActiveTab(selectedTitle: string | undefined): void {
    const tabs = this.tabsList();

    if (tabs.length === 0) {
      return;
    }

    const nextTab =
      (selectedTitle ? tabs.find((tab) => tab.title() === selectedTitle) : undefined) ??
      tabs.find((tab) => tab.active()) ??
      tabs.find((tab) => !tab.disabled()) ??
      tabs[0];

    this.setActiveTab(nextTab, false);
  }

  private setActiveTab(tab: QoTabComponent, emitChange: boolean): void {
    this.tabsList().forEach((item) => {
      item.active.set(item === tab);
    });

    if (emitChange) {
      this.selectedTitleChange.emit(tab.title());
    }
  }
}

