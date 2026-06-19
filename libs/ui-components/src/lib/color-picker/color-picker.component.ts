import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  Injector,
  OnDestroy,
  TemplateRef,
  ViewChild,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { Overlay, OverlayRef, OverlayModule } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { ViewContainerRef } from '@angular/core';
import { BaseControlComponent } from '@qo/ui-components/lib/base';

interface ColorOption {
  label: string;
  value: string | null;
}

@Component({
  selector: 'qo-color-picker',
  standalone: true,
  imports: [OverlayModule],
  templateUrl: './color-picker.component.html',
  styleUrl: './color-picker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QoColorPickerComponent extends BaseControlComponent implements OnDestroy {
  value = input<string | null>('#232427');
  themeColor = input<string>('#4f46e5');
  presetColors = input<string[]>([
    '#ffffff',
    '#f5f5f2',
    '#d9dad6',
    '#a7a8ac',
    '#7d8086',
    '#5a5d63',
    '#232427',
    '#111111',
    '#fde68a',
    '#fb7185',
    '#f97316',
    '#facc15',
    '#4ade80',
    '#2dd4bf',
    '#60a5fa',
    '#818cf8',
    '#a78bfa',
    '#c084fc',
    '#fecaca',
    '#fca5a5',
    '#fdba74',
    '#fcd34d',
    '#86efac',
    '#5eead4',
    '#93c5fd',
    '#a5b4fc',
    '#c4b5fd',
    '#d8b4fe',
    '#ef4444',
    '#dc2626',
    '#ea580c',
    '#ca8a04',
    '#16a34a',
    '#0f766e',
    '#2563eb',
    '#4338ca',
    '#7c3aed',
    '#9333ea',
    '#b91c1c',
    '#7f1d1d',
    '#9a3412',
    '#854d0e',
    '#166534',
    '#134e4a',
    '#1d4ed8',
    '#312e81',
    '#6d28d9',
    '#581c87',
  ]);
  allowNoFill = input<boolean>(true);
  showThemeColor = input<boolean>(true);
  showMoreColors = input<boolean>(true);
  triggerLabel = input<string>('A');
  triggerVariant = input<'default' | 'text-only'>('default');

  valueChange = output<string | null>();

  @ViewChild('moreColorsInput') private moreColorsInput?: ElementRef<HTMLInputElement>;
  @ViewChild('panelTemplate') private panelTemplate!: TemplateRef<unknown>;

  readonly isOpen = signal(false);
  readonly activeValue = signal<string | null>(this.value());

  private overlayRef: OverlayRef | null = null;
  private portal: TemplatePortal | null = null;

  readonly options = computed<ColorOption[]>(() => {
    const items: ColorOption[] = [];

    if (this.allowNoFill()) {
      items.push({ label: 'No Fill', value: null });
    }

    if (this.showThemeColor()) {
      items.push({ label: 'Theme Color', value: this.themeColor() });
    }

    return items;
  });

  constructor(
    private readonly host: ElementRef<HTMLElement>,
    private readonly overlay: Overlay,
    private readonly vcr: ViewContainerRef,
    private readonly injector: Injector,
  ) {
    super();
    effect(() => {
      this.activeValue.set(this.value());
    }, { allowSignalWrites: true });
  }

  ngOnDestroy(): void {
    this.detachPanel();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!(event.target instanceof Node)) return;
    if (!(event.target as Node).isConnected) return;

    const host = this.host.nativeElement;
    const panelEl = this.overlayRef?.overlayElement;

    if (!host.contains(event.target) && !panelEl?.contains(event.target as Node)) {
      this.closePanel();
    }
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    if (this.isOpen() && this.overlayRef) {
      this.overlayRef.updatePosition();
    }
  }

  togglePanel(): void {
    if (this.disabled()) return;

    if (this.isOpen()) {
      this.closePanel();
    } else {
      this.openPanel();
    }
  }

  private openPanel(): void {
    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(this.host)
      .withPositions([
        { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 8 },
        { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 8 },
        { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -8 },
        { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -8 },
      ])
      .withPush(true)
      .withViewportMargin(8);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      hasBackdrop: false,
    });

    this.portal = new TemplatePortal(this.panelTemplate, this.vcr, {}, this.injector);
    this.overlayRef.attach(this.portal);
    this.isOpen.set(true);
  }

  private closePanel(): void {
    this.detachPanel();
    this.isOpen.set(false);
  }

  private detachPanel(): void {
    if (this.overlayRef) {
      this.overlayRef.detach();
      this.overlayRef.dispose();
      this.overlayRef = null;
    }
    this.portal = null;
  }

  selectColor(value: string | null): void {
    this.activeValue.set(value);
    this.valueChange.emit(value);
    this.closePanel();
  }

  openMoreColors(): void {
    if (this.disabled() || !this.showMoreColors()) return;
    this.moreColorsInput?.nativeElement.click();
  }

  handleNativeColorChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.selectColor(value);
  }

  isSelected(value: string | null): boolean {
    return this.activeValue() === value;
  }

  swatchStyle(color: string | null): string | null {
    return color;
  }

  nativeColorValue(): string {
    const value = this.activeValue();
    return value && /^#[0-9a-f]{6}$/i.test(value) ? value : '#232427';
  }
}
