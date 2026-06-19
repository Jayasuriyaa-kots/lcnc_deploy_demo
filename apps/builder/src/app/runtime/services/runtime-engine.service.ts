import { Injectable, computed, signal } from '@angular/core';
import type { Signal } from '@angular/core';
import type {
  AppConfig,
  BrandingConfig,
  ThemeConfig,
  NavPrimaryPage,
  NavLeftPage,
  NavSubPage,
  NavTopTab,
  FormConfig,
  DataframeConfig,
  PageConfig,
  WorkflowConfig,
} from '../models/app-config.model';
import type { NavigationPage } from '../../features/deployment/models/deployment.models';
import { HEXAWARE_APP_CONFIG } from '../configs/hexaware.config';
import rawFinance from '../configs/finance.config.json';
import rawHealthcare from '../configs/healthcare.config.json';
import rawLogistics from '../configs/logistics.config.json';
import rawUniversity from '../configs/university.config.json';

// ─────────────────────────────────────────────────────────────────────────────
// RuntimeEngineService
//
// Single source of truth for all app configuration. Reads from HEXAWARE_APP_CONFIG
// (switchable via loadConfig()) and exposes typed Angular signals that consumers
// can subscribe to reactively. Nothing is hardcoded in consumers.
// ─────────────────────────────────────────────────────────────────────────────

function toNavPage(p: NavPrimaryPage | NavLeftPage | NavSubPage | NavTopTab): NavigationPage {
  return { id: p.id, label: p.label, icon: p.icon, tone: p.tone as NavigationPage['tone'] };
}

const CONFIG_OVERRIDE_KEY = 'qo.runtime.config-override.v1';

const BUILDER_STALE_KEYS = [
  'qo.builder.page-builder.pages.v1',
  'qo.builder.page-builder.selected-page.v1',
  'qo.builder.form-builder.forms.v2',
  'qo.report-builder.v1',
  'qo.builder.config-instance.v1',
  'qo-deployment-desktop-layout-json',
  'qo-deployment-mobile-layout-json',
];

/** Named presets bundled at build time — switching by URL param works on any device */
export const PRESET_CONFIGS: Record<string, AppConfig> = {
  swiftmove: HEXAWARE_APP_CONFIG,
  finance:   rawFinance    as unknown as AppConfig,
  healthcare: rawHealthcare as unknown as AppConfig,
  logistics:  rawLogistics  as unknown as AppConfig,
  university: rawUniversity as unknown as AppConfig,
};

function loadInitialConfig(): AppConfig {
  // 1. URL ?preset=X param — shareable across devices
  try {
    const preset = new URLSearchParams(window.location.search).get('preset');
    if (preset && PRESET_CONFIGS[preset]) {
      const cfg = PRESET_CONFIGS[preset];
      localStorage.setItem(CONFIG_OVERRIDE_KEY, JSON.stringify(cfg));
      return cfg;
    }
  } catch { /* ignore */ }

  // 2. localStorage override (from a previous Load Config action)
  try {
    const stored = localStorage.getItem(CONFIG_OVERRIDE_KEY);
    if (stored) return JSON.parse(stored) as AppConfig;
  } catch { /* corrupted — fall through */ }

  return HEXAWARE_APP_CONFIG;
}

/** Returns the preset key for a config, or null if it's a custom upload */
function findPresetName(config: AppConfig): string | null {
  for (const [name, preset] of Object.entries(PRESET_CONFIGS)) {
    if (preset.application.id === config.application.id) return name;
  }
  return null;
}

@Injectable({ providedIn: 'root' })
export class RuntimeEngineService {

  private readonly _config = signal<AppConfig>(loadInitialConfig());

  readonly config: Signal<AppConfig> = this._config.asReadonly();

  // ── Application metadata ───────────────────────────────────────────────────

  readonly appId    = computed(() => this._config().application.id);
  readonly appName  = computed(() => this._config().application.name);
  readonly version  = computed(() => this._config().application.version);

  // ── Branding & Theme ───────────────────────────────────────────────────────

  readonly branding = computed<BrandingConfig>(() => this._config().branding);
  readonly theme    = computed<ThemeConfig>(()    => this._config().theme);

  // ── Navigation — flat maps consumed by DeploymentFacadeService ────────────

  readonly primaryPages = computed<NavigationPage[]>(() =>
    this._config().navigation.primaryPages.map(toNavPage),
  );

  readonly leftPagesByPrimaryId = computed<Record<string, NavigationPage[]>>(() => {
    const result: Record<string, NavigationPage[]> = {};
    for (const primary of this._config().navigation.primaryPages) {
      if (primary.leftPages?.length) {
        result[primary.id] = primary.leftPages.map(toNavPage);
      }
    }
    return result;
  });

  readonly subPagesByLeftPageId = computed<Record<string, NavigationPage[]>>(() => {
    const result: Record<string, NavigationPage[]> = {};
    for (const primary of this._config().navigation.primaryPages) {
      for (const left of primary.leftPages ?? []) {
        if (left.subPages?.length) {
          result[left.id] = left.subPages.map(toNavPage);
        }
      }
    }
    return result;
  });

  readonly topTabPagesBySourceId = computed<Record<string, NavigationPage[]>>(() => {
    const result: Record<string, NavigationPage[]> = {};
    for (const primary of this._config().navigation.primaryPages) {
      // Primary-level top tabs (when dep = primary)
      if (primary.topTabs?.length) {
        result[primary.id] = primary.topTabs.map(toNavPage);
      }
      for (const left of primary.leftPages ?? []) {
        // Left-page-level top tabs (when left has NO sub pages)
        if (!left.subPages?.length && left.topTabs?.length) {
          result[left.id] = left.topTabs.map(toNavPage);
        }
        // Sub-page-level top tabs
        for (const sub of left.subPages ?? []) {
          if (sub.topTabs?.length) {
            result[sub.id] = sub.topTabs.map(toNavPage);
          }
        }
      }
    }
    return result;
  });

  // ── Default page targets from config ──────────────────────────────────────

  readonly defaultPageTargets = computed(() => this._config().pageTargets);

  // ── Forms, Dataframes, Pages, Workflows ───────────────────────────────────

  readonly forms      = computed<FormConfig[]>(()      => this._config().forms);
  readonly dataframes = computed<DataframeConfig[]>(() => this._config().dataframes);
  readonly pages      = computed<PageConfig[]>(()      => this._config().pages);
  readonly workflows  = computed<WorkflowConfig[]>(() => this._config().workflows);

  // ── Deployment configs ─────────────────────────────────────────────────────

  readonly desktopConfig = computed(() => this._config().desktop);
  readonly mobileConfig  = computed(() => this._config().mobile);

  // ── Mock data schema ───────────────────────────────────────────────────────

  readonly mockDataSchema = computed(() => this._config().mockData);

  // ── Lookup helpers ─────────────────────────────────────────────────────────

  getFormById(id: string): FormConfig | undefined {
    return this._config().forms.find(f => f.id === id);
  }

  getDataframeById(id: string): DataframeConfig | undefined {
    return this._config().dataframes.find(d => d.id === id);
  }

  getPageById(id: string): PageConfig | undefined {
    return this._config().pages.find(p => p.id === id);
  }

  getWorkflowById(id: string): WorkflowConfig | undefined {
    return this._config().workflows.find(w => w.id === id);
  }

  /** Returns the preset name if the current (or given) config matches a built-in preset. */
  getPresetName(config?: AppConfig): string | null {
    return findPresetName(config ?? this._config());
  }

  /** Replace the active config at runtime. Persists to localStorage so it survives page reloads. */
  loadConfig(config: AppConfig): void {
    for (const key of BUILDER_STALE_KEYS) {
      localStorage.removeItem(key);
    }
    localStorage.setItem(CONFIG_OVERRIDE_KEY, JSON.stringify(config));
    this._config.set(config);
  }

  /** Remove any persisted config override and revert to the built-in default. */
  clearConfigOverride(): void {
    for (const key of BUILDER_STALE_KEYS) {
      localStorage.removeItem(key);
    }
    localStorage.removeItem(CONFIG_OVERRIDE_KEY);
    this._config.set(HEXAWARE_APP_CONFIG);
  }
}
