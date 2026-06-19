import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { extname, join, relative } from 'node:path';

const root = process.cwd();
const feature = join(root, 'apps', 'builder', 'src', 'app', 'features', 'datasources');
const components = join(feature, 'components');
const facades = join(feature, 'facades');
const services = join(feature, 'services');
const statCard = join(root, 'libs', 'ui-components', 'src', 'lib', 'data-display', 'stat-card', 'stat-card.component.ts');
const connectorIcon = join(root, 'libs', 'ui-components', 'src', 'lib', 'primitives', 'connector-icon', 'connector-icon.component.ts');
const connectorIconIndex = join(root, 'libs', 'ui-components', 'src', 'lib', 'primitives', 'connector-icon', 'index.ts');
const statCardIndex = join(root, 'libs', 'ui-components', 'src', 'lib', 'data-display', 'stat-card', 'index.ts');
const failures = [];

function filesUnder(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesUnder(path) : [path];
  });
}

function fail(file, message) {
  failures.push(`${relative(root, file)}: ${message}`);
}

for (const file of filesUnder(feature)) {
  if (!['.ts', '.html', '.scss'].includes(extname(file))) continue;
  const text = readFileSync(file, 'utf8');
  const lines = text.split(/\r?\n/).length;
  if (lines >= 500) fail(file, `must stay below 500 lines; found ${lines}`);

  if (file.endsWith('.component.ts')) {
    const spec = file.replace(/\.component\.ts$/, '.component.spec.ts');
    if (!existsSync(spec)) {
      fail(file, 'is missing a component smoke test');
    } else {
      const specText = readFileSync(spec, 'utf8');
      if (!/createStandaloneComponent|TestBed\.createComponent/.test(specText)) {
        fail(spec, 'must create the component through Angular TestBed');
      }
    }
    if (/@Input\b|@Output\b|EventEmitter\b/.test(text)) {
      fail(file, 'must use input() and output() APIs');
    }
    if (!/standalone:\s*true/.test(text) || !/ChangeDetectionStrategy\.OnPush/.test(text)) {
      fail(file, 'must be standalone and use OnPush');
    }
  }

  if (file.endsWith('.component.scss') && !/:host\s*\{/.test(text)) {
    fail(file, 'component styles must define :host layout');
  }

  if (file.endsWith('.html') && /<img\b/.test(text)) {
    fail(file, 'feature templates must use shared qo- components instead of raw img elements');
  }

  if (/@quanta-ops\//.test(text)) {
    fail(file, 'must use current @qo/ path aliases instead of legacy @quanta-ops/ aliases');
  }
}

for (const file of filesUnder(components).filter((path) => path.endsWith('.component.ts'))) {
  const text = readFileSync(file, 'utf8');
  if (/\binject\s*\(/.test(text)) fail(file, 'dumb components must not inject services');
  if (/DatasourcesFacadeService|ExternalApisFacadeService/.test(text)) {
    fail(file, 'dumb components must not depend on feature facades');
  }
}

for (const directory of filesUnder(feature)
  .filter((path) => path.endsWith('.component.ts'))
  .map((path) => path.replace(/[\\/][^\\/]+$/, ''))
  .filter((path, index, paths) => paths.indexOf(path) === index)) {
  const componentCount = readdirSync(directory).filter((name) => name.endsWith('.component.ts')).length;
  if (componentCount > 1) fail(directory, 'component folders must contain only one component');
  if (!existsSync(join(directory, 'index.ts'))) fail(directory, 'component folder is missing index.ts');
}

for (const file of filesUnder(services).filter((path) => path.endsWith('.ts'))) {
  if (file.endsWith('datasources-persistence.service.ts')) continue;
  const text = readFileSync(file, 'utf8');
  if (/\b(?:window\.)?localStorage\b/.test(text)) {
    fail(file, 'must use DatasourcesPersistenceService instead of localStorage directly');
  }
  if (/\bsignal\s*\(/.test(text)) fail(file, 'services must not own feature state; move signals to facades');
  if (/\b(?:computed|effect)\s*\(/.test(text)) {
    fail(file, 'services must not own derived state or effects; move them to facades');
  }
  if (/QoToastService|this\.toast\b/.test(text)) {
    fail(file, 'services must not trigger UI toasts; route feedback through a facade');
  }
}

for (const file of filesUnder(facades).filter((path) => path.endsWith('.ts'))) {
  if (/\b(?:window\.)?localStorage\b/.test(readFileSync(file, 'utf8'))) {
    fail(file, 'facades must use DatasourcesPersistenceService instead of localStorage directly');
  }
}

const datasourceFacade = join(services, 'datasources-facade.service.ts');
const externalApisFacade = join(services, 'external-apis-facade.service.ts');
if (!/interface\s+IDatasourcesFacade\b/.test(readFileSync(datasourceFacade, 'utf8'))) {
  fail(datasourceFacade, 'must define IDatasourcesFacade');
}
if (!/interface\s+IExternalApisFacade\b/.test(readFileSync(externalApisFacade, 'utf8'))) {
  fail(externalApisFacade, 'must define IExternalApisFacade');
}
if (!/class\s+QoStatCardComponent\s+extends\s+BaseControlComponent\b/.test(readFileSync(statCard, 'utf8'))) {
  fail(statCard, 'must extend BaseControlComponent');
}

for (const file of [connectorIcon, connectorIconIndex, statCardIndex]) {
  if (/@qo\/ui-components\/lib\//.test(readFileSync(file, 'utf8'))) {
    fail(file, 'shared UI internals must use relative imports instead of deep package imports');
  }
}

const externalStateFacade = join(facades, 'external-apis-state.facade.ts');
if (/DatasourcesFacadeService/.test(readFileSync(externalStateFacade, 'utf8'))) {
  fail(externalStateFacade, 'External APIs facade must not depend on DatasourcesFacadeService');
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log('Datasource architecture checks passed.');
}
