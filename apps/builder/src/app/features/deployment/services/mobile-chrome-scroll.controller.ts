import type { NgZone, WritableSignal } from '@angular/core';

// ─────────────────────────────────────────────────────────────────────────────
// MobileChromeScrollController
//
// SINGLE SOURCE OF TRUTH for the mobile deployment preview's scrolling
// behaviour. Both the Deployment "Mobile Web" page and the standalone
// "/mobile-preview" page delegate to this one engine, so they scroll, collapse,
// virtualize and feel byte-for-byte identical.
//
// Responsibilities:
//  • Native, finger-attached chrome collapse — a passive scroll listener records
//    scrollTop and a requestAnimationFrame loop (both OUTSIDE the Angular zone)
//    write a GPU translate3d directly to the chrome element. Zero change
//    detection per frame.
//  • Row virtualization — derives the visible row window [renderStart, renderEnd]
//    from scrollTop so only ~viewport+buffer rows are ever in the DOM (60fps at
//    20k+ rows). The host template renders the slice + spacer rows.
//  • Sticky column-header offset (--table-top) tracked in lockstep with collapse.
//  • Rare boolean UI states (nav visibility, full-data mode, scroll-to-top icon)
//    flipped via signals ONLY when they actually change.
//
// The host component owns the signals (so its template stays reactive) and
// passes them in; the controller owns all the imperative scroll/rAF/measure
// logic. Nothing here is duplicated per page.
// ─────────────────────────────────────────────────────────────────────────────

export interface MobileChromeScrollDeps {
  ngZone: NgZone;
  /** Measured height of one data row (px). */
  rowHeight: WritableSignal<number>;
  /** Inclusive start / exclusive end index of the rendered row window. */
  renderStart: WritableSignal<number>;
  renderEnd: WritableSignal<number>;
  /** Secondary chrome (left selector / action panels) gate. */
  mobileNavVisible: WritableSignal<boolean>;
  /** Chrome fully collapsed — host hides the bottom nav. */
  fullDataMode: WritableSignal<boolean>;
  /** Minimal scroll-to-top icon visibility. */
  showScrollTop: WritableSignal<boolean>;
  /** Called when the chrome fully collapses (host closes transient panels). */
  onEnterFullData: () => void;
}

export class MobileChromeScrollController {
  private scrollEl?: HTMLElement;
  private chromeEl?: HTMLElement;
  private tableScrollEl?: HTMLElement;

  private chromeHeightPx = 0;
  private latestScrollTop = 0;
  private rafId: number | null = null;

  private tableBodyTop = 0;
  private rowMeasured = false;
  private resizeObs?: ResizeObserver;

  /** Rows above/below the viewport kept in the window as a buffer. */
  private readonly RENDER_BUFFER = 12;
  /** Initial window size before the first real measurement. */
  private readonly INITIAL_WINDOW = 40;

  constructor(private readonly deps: MobileChromeScrollDeps) {}

  /** Wire up the engine once the view elements exist (ngAfterViewInit). */
  attach(scrollEl?: HTMLElement, chromeEl?: HTMLElement, tableScrollEl?: HTMLElement): void {
    this.scrollEl = scrollEl;
    this.chromeEl = chromeEl;
    this.tableScrollEl = tableScrollEl;

    if (chromeEl) {
      this.chromeHeightPx = chromeEl.offsetHeight;
      // Re-measure on layout changes; chrome height shifts the table body offset.
      this.resizeObs = new ResizeObserver(() => {
        this.chromeHeightPx = this.chromeEl?.offsetHeight ?? 0;
        this.rowMeasured = false;
        this.apply();
      });
      this.resizeObs.observe(chromeEl);
      this.apply();
    }

    // Passive listener + rAF, both outside Angular — zero CD per scroll frame.
    this.deps.ngZone.runOutsideAngular(() => {
      this.scrollEl?.addEventListener('scroll', this.onScroll, { passive: true });
    });
  }

  detach(): void {
    this.resizeObs?.disconnect();
    this.scrollEl?.removeEventListener('scroll', this.onScroll);
    if (this.rafId != null) cancelAnimationFrame(this.rafId);
  }

  /** Snap the window + scroll position to the top — call when the row set
   *  changes (search / filter / sort) so a deep scroll never leaves a gap. */
  resetToTop(): void {
    this.deps.renderStart.set(0);
    this.deps.renderEnd.set(this.INITIAL_WINDOW);
    this.rowMeasured = false;
    const el = this.scrollEl;
    if (el && el.scrollTop > 0) el.scrollTop = 0;
  }

  scrollToTop(): void {
    this.scrollEl?.scrollTo({ top: 0, behavior: 'smooth' });
    this.deps.showScrollTop.set(false);
  }

  // ── Internals ──────────────────────────────────────────────────────────────

  /** Passive scroll handler — only records position, then schedules a frame. */
  private readonly onScroll = (): void => {
    this.latestScrollTop = Math.max(0, this.scrollEl?.scrollTop ?? 0);
    if (this.rafId == null) {
      this.rafId = requestAnimationFrame(this.apply);
    }
  };

  /** Runs on the animation frame (outside Angular). Maps scroll position
   *  directly to the chrome transform — collapseOffset = min(scrollTop, H) —
   *  and to the rendered row window. */
  private readonly apply = (): void => {
    this.rafId = null;
    const scrollTop = this.latestScrollTop;
    const h = this.chromeHeightPx;
    const offset = h > 0 ? Math.min(scrollTop, h) : 0;

    // GPU-accelerated transform — direct DOM write, no Angular involved.
    if (this.chromeEl) {
      this.chromeEl.style.transform = `translate3d(0, ${-offset}px, 0)`;
      this.chromeEl.style.opacity = h > 0 ? `${1 - (offset / h) * 0.3}` : '1';
    }
    // Sticky column header rides up with the chrome, pinned at top:0 when gone.
    this.scrollEl?.style.setProperty('--table-top', `${Math.max(0, h - offset)}px`);

    // ── Visible row window ────────────────────────────────────────────────
    if (!this.rowMeasured) this.measure();
    const rowH = this.deps.rowHeight();
    const viewportH = this.scrollEl?.clientHeight ?? 0;
    const firstVisible = Math.floor((scrollTop - this.tableBodyTop) / rowH);
    const nextStart = Math.max(0, firstVisible - this.RENDER_BUFFER);
    const nextEnd = nextStart + Math.ceil(viewportH / rowH) + this.RENDER_BUFFER * 2;
    const rangeChanged =
      nextStart !== this.deps.renderStart() || nextEnd !== this.deps.renderEnd();

    // Rare boolean states — flip signals only when they actually change.
    const navVisible = h === 0 ? true : offset < h * 0.5;
    const fullData = h > 0 && offset >= h - 1;
    const showTop = scrollTop > 1000 ? true : scrollTop < 500 ? false : this.deps.showScrollTop();
    if (
      rangeChanged ||
      navVisible !== this.deps.mobileNavVisible() ||
      fullData !== this.deps.fullDataMode() ||
      showTop !== this.deps.showScrollTop()
    ) {
      this.deps.ngZone.run(() => {
        if (rangeChanged) {
          this.deps.renderStart.set(nextStart);
          this.deps.renderEnd.set(nextEnd);
        }
        this.deps.mobileNavVisible.set(navVisible);
        this.deps.fullDataMode.set(fullData);
        this.deps.showScrollTop.set(showTop);
        if (fullData) this.deps.onEnterFullData();
      });
    }
  };

  /** Measure a real row's height and the table body's offset within the scroll
   *  content. Both are needed to translate scrollTop into a row index. */
  private measure(): void {
    const scrollEl = this.scrollEl;
    const tableScroll = this.tableScrollEl;
    if (!scrollEl || !tableScroll) return;
    const tbody = tableScroll.querySelector('tbody');
    const dataRow = tbody?.querySelector('tr:not(.mobile-app-table__spacer)') as HTMLElement | null;
    if (!tbody || !dataRow || dataRow.offsetHeight === 0) return;
    this.deps.rowHeight.set(dataRow.offsetHeight);
    const bodyRect = tbody.getBoundingClientRect();
    const contRect = scrollEl.getBoundingClientRect();
    this.tableBodyTop = bodyRect.top - contRect.top + scrollEl.scrollTop;
    this.rowMeasured = true;
  }
}
