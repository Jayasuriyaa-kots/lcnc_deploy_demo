
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import {
  BoardWidgetVariant,
  getBoardWidgetPreset,
} from '@builder/features/page-builder/components/widget-showcase/board/board-widget.config';

interface DepartmentItem {
  rank: number;
  name: string;
  members: string;
}

interface OrderStatusItem {
  title: string;
  value: string;
}

interface RegionItem {
  rank: number;
  region: string;
  tickets: string;
}

interface LeaderboardItem {
  title: string;
  progress: string;
  rank: number;
}

interface BugReportItem {
  rank: number;
  month: string;
  bugs: string;
  resolved: string;
}

interface FitnessItem {
  rank: number;
  name: string;
  kms: string;
}

@Component({
  selector: 'app-board-widget',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ui-board-widget.component.html',
  styleUrl: './ui-board-widget.component.scss',
})
export class UiBoardWidgetComponent {
  readonly variant = input<BoardWidgetVariant>('department-list');
  readonly backgroundColor = input('var(--qo-color-neutral-0)');
  readonly interactive = input(false);
  readonly selectedSectionId = input<string | null>(null);
  readonly sectionSelected = output<string>();

  readonly departments: DepartmentItem[] = [
    { rank: 1, name: 'Product Education', members: '15 members' },
    { rank: 2, name: 'Development', members: '15 members' },
    { rank: 3, name: 'Customer Support', members: '10 members' },
  ];

  readonly orderStatuses: OrderStatusItem[] = [
    { title: 'Ordered', value: '100' },
    { title: 'Packed', value: '20' },
    { title: 'Shipped', value: '30' },
    { title: 'Delivered', value: '60' },
  ];

  readonly regions: RegionItem[] = [
    { rank: 1, region: 'North Ameri...', tickets: '1,250 tickets' },
    { rank: 2, region: 'Europe', tickets: '950 tickets' },
  ];

  readonly leaderboard: LeaderboardItem[] = [
    { title: 'Alpha Revamp', progress: '75% completed', rank: 1 },
    { title: 'Beta Version', progress: '70% completed', rank: 2 },
    { title: 'Delta Optimization', progress: '60% completed', rank: 3 },
  ];

  readonly bugReports: BugReportItem[] = [
    { rank: 1, month: 'December', bugs: '180 bugs', resolved: '170 resolved' },
    { rank: 2, month: 'November', bugs: '150 bugs', resolved: '120 resolved' },
    { rank: 3, month: 'January', bugs: '120 bugs', resolved: '100 resolved' },
  ];

  readonly fitness: FitnessItem[] = [
    { rank: 1, name: 'Alex Johnson', kms: '320' },
    { rank: 2, name: 'Jamie Smith', kms: '290' },
    { rank: 3, name: 'Jordan Lee', kms: '200' },
  ];

  readonly resolvedPreset = computed(() => getBoardWidgetPreset(this.variant()));

  selectSection(sectionId: string, event?: Event): void {
    if (!this.interactive()) {
      return;
    }

    event?.stopPropagation();
    this.sectionSelected.emit(sectionId);
  }

  isSectionSelected(sectionId: string): boolean {
    return this.selectedSectionId() === sectionId;
  }
}
