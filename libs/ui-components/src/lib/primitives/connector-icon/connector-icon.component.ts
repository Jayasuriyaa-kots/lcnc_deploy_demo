import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { QoIconComponent } from '../icon/icon.component';
import { QoSize } from '../../base';

type ConnectorIconSize = QoSize | 'card';

export type ConnectorType =
  | 'postgres'
  | 'postgresql'
  | 'mysql'
  | 'mongodb'
  | 'mssql'
  | 'redis'
  | 'firestore'
  | 'snowflake'
  | 'arangodb'
  | 'oracle'
  | 'databricks'
  | 'dynamodb'
  | 'elasticsearch'
  | 'google_sheets'
  | 'rest'
  | 'rest_api'
  | 'graphql'
  | 'graphql_api'
  | 'authenticated_api'
  | 'authenticated_graphql'
  | 'stripe'
  | 'airtable'
  | 'amplitude'
  | 'asana'
  | 'aws-lambda'
  | 'clickup'
  | 'dropbox'
  | 'github'
  | 'gmail'
  | 'google-calendar'
  | 'google-docs'
  | 'google-drive'
  | 'hubspot'
  | 'twilio'
  | 'jira'
  | 'linkedin'
  | 'microsoft-teams'
  | 'notion'
  | 'salesforce'
  | 'slack'
  | 'zoho-crm'
  | 'custom-rest-api'
  | 'default';

@Component({
  selector: 'qo-connector-icon',
  standalone: true,
  imports: [QoIconComponent],
  template: `
    <div class="qo-connector-icon-wrapper" [class]="wrapperClassName()">
      @if (logoPath()) {
        <img class="qo-connector-icon-logo" [src]="logoPath()" alt="" />
      } @else if (svgType()) {
        <span class="qo-connector-icon-svg" [attr.data-type]="svgType()" aria-hidden="true">
          @switch (svgType()) {
            @case ('airtable') {
              <svg viewBox="0 0 24 24" fill="none">
                <rect class="qo-fill-1" x="4" y="5" width="6" height="4"></rect>
                <rect class="qo-fill-2" x="10" y="5" width="6" height="4"></rect>
                <rect class="qo-fill-2" x="4" y="10" width="6" height="4"></rect>
                <rect class="qo-fill-1" x="10" y="10" width="6" height="4"></rect>
                <rect class="qo-fill-1" x="4" y="15" width="6" height="4"></rect>
                <rect class="qo-fill-2" x="10" y="15" width="6" height="4"></rect>
              </svg>
            }
            @case ('amplitude') {
              <svg viewBox="0 0 24 24" fill="none">
                <path class="qo-stroke-1" d="M6.5 16.5l3.4-6.8 3 3 3.7-7.2" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"></path>
                <circle class="qo-fill-1" cx="6.5" cy="16.5" r="1.3"></circle>
              </svg>
            }
            @case ('asana') {
              <svg viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="7" fill="url(#asanaFill)"></circle>
                <defs>
                  <radialGradient id="asanaFill" cx="0" cy="0" r="1" gradientTransform="translate(8 7) rotate(45) scale(12)">
                    <stop class="qo-stop-1"></stop>
                    <stop class="qo-stop-2" offset="1"></stop>
                  </radialGradient>
                </defs>
              </svg>
            }
            @case ('aws-lambda') {
              <svg viewBox="0 0 24 24" fill="none">
                <path class="qo-stroke-1" d="M8.5 17l4-10.1M10.2 12.5h4M11.3 15.7l4.8 1.3" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"></path>
                <path class="qo-stroke-2" d="M8.3 17h7.8" stroke-width="1.2" stroke-linecap="round" opacity=".55"></path>
              </svg>
            }
            @case ('clickup') {
              <svg viewBox="0 0 24 24" fill="none">
                <path class="qo-stroke-1" d="M6 14l6-6 6 6" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"></path>
                <path class="qo-fill-1" d="M12 17l-4-4 4-4 4 4-4 4z"></path>
              </svg>
            }
            @case ('dropbox') {
              <svg viewBox="0 0 24 24" fill="none">
                <path class="qo-fill-1" d="M7.6 6.8l3.8 2.8-3.8 2.7L3.8 9.6l3.8-2.8zm8.8 0l3.8 2.8-3.8 2.7-3.8-2.7 3.8-2.8zm-8.8 6.1l3.8 2.7-3.8 2.8-3.8-2.8 3.8-2.7zm8.8 0l3.8 2.7-3.8 2.8-3.8-2.8 3.8-2.7z"></path>
                <path class="qo-fill-2" d="M12 13.8l3.4 2.4-3.4 1.9-3.4-1.9 3.4-2.4z"></path>
              </svg>
            }
            @case ('github') {
              <svg viewBox="0 0 24 24" fill="none">
                <circle class="qo-fill-1" cx="12" cy="12" r="7.5"></circle>
                <path class="qo-stroke-1" d="M9 16c-1 .3-1.5-.4-1.8-.9-.2-.3-.5-.6-.8-.8m5.6 1.7v-2.1c0-.8.3-1.3.7-1.6-2.2-.2-4.5-1.1-4.5-4.8 0-1 .3-1.9.8-2.6-.1-.2-.4-1.2.1-2.5 0 0 .7-.2 2.6 1 .8-.2 1.7-.3 2.6-.3.9 0 1.8.1 2.6.3 1.9-1.2 2.6-1 2.6-1 .5 1.3.2 2.3.1 2.5.5.7.8 1.6.8 2.6 0 3.7-2.3 4.6-4.5 4.8.4.3.7.9.7 1.8V16" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"></path>
              </svg>
            }
            @case ('gmail') {
              <svg viewBox="0 0 24 24" fill="none">
                <rect class="qo-fill-1 qo-stroke-1" x="4.8" y="6.8" width="14.4" height="10.4" rx="1.5" stroke-width="1.5"></rect>
                <path class="qo-stroke-1" d="M6.4 14.9V9.1l5.6 4 5.6-4v5.8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                <path class="qo-stroke-2" d="M6.3 8.9l5.7 4.2 5.7-4.2" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"></path>
              </svg>
            }
            @case ('google-calendar') {
              <svg viewBox="0 0 24 24" fill="none">
                <rect class="qo-fill-1 qo-stroke-1" x="4.8" y="5.8" width="14.4" height="13.4" rx="1.7" stroke-width="1.4"></rect>
                <rect class="qo-fill-2" x="4.8" y="5.8" width="14.4" height="4.2" rx="1.5"></rect>
                <path class="qo-stroke-2" d="M8 4.8V8M16 4.8V8" stroke-width="1.6" stroke-linecap="round"></path>
                <path class="qo-stroke-1" d="M8.4 12.1h2.6M13 12.1h2.6M8.4 15.1h2.6M13 15.1h2.6" stroke-width="1" stroke-linecap="round" opacity=".55"></path>
              </svg>
            }
            @case ('google-docs') {
              <svg viewBox="0 0 24 24" fill="none">
                <path class="qo-fill-1 qo-stroke-1" d="M7.6 4h7.2l3.2 3.2V20H7.6z" stroke-width="1.2"></path>
                <path class="qo-stroke-1" d="M14.8 4v4h4" stroke-width="1.2"></path>
                <path class="qo-stroke-2" d="M10 11h6M10 14h6M10 17h4.7" stroke-width="1.4" stroke-linecap="round"></path>
              </svg>
            }
            @case ('google-drive') {
              <svg viewBox="0 0 24 24" fill="none">
                <path class="qo-fill-1" d="M9 6h6.2l3.6 6H12.7L9 6z"></path>
                <path class="qo-fill-2" d="M9 6L5.1 12l3.8 6 3.8-6L9 6z"></path>
                <path class="qo-fill-3" d="M12.7 12h6.1l-3.7 6H8.9l3.8-6z"></path>
                <path class="qo-stroke-1" d="M9 6h6l4 6h-6L9 6zM9 6L5 12l4 6 4-6-4-6zM13 12h6l-4 6H9l4-6z" stroke-width=".6" stroke-linejoin="round"></path>
              </svg>
            }
            @case ('google_sheets') {
              <svg viewBox="0 0 24 24" fill="none">
                <path class="qo-fill-1" d="M8 4h8l3 3v13H8z"></path>
                <path class="qo-fill-2" d="M16 4v4h4"></path>
                <path class="qo-stroke-1" d="M10 10.8h7M10 13.9h7M10 17h7M12.7 9.8v8" stroke-width="1.1" opacity=".72"></path>
              </svg>
            }
            @case ('hubspot') {
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 18c-2.7-2.8-5.3-5-5.3-8.1 0-2.1 1.4-3.9 3.6-3.9 1.2 0 2.1.5 2.7 1.4.6-.9 1.5-1.4 2.7-1.4 2.2 0 3.6 1.8 3.6 3.9 0 3.1-2.6 5.3-5.3 8.1h-2z" fill="url(#hubspotFill)"></path>
                <defs>
                  <radialGradient id="hubspotFill" cx="0" cy="0" r="1" gradientTransform="translate(9 7) rotate(45) scale(12)">
                    <stop class="qo-stop-1"></stop>
                    <stop class="qo-stop-2" offset="1"></stop>
                  </radialGradient>
                </defs>
              </svg>
            }
            @case ('twilio') {
              <svg viewBox="0 0 24 24" fill="none">
                <circle class="qo-stroke-1" cx="12" cy="12" r="8" stroke-width="2.5"></circle>
                <circle class="qo-fill-1" cx="9.2" cy="9.2" r="1.7"></circle>
                <circle class="qo-fill-1" cx="14.8" cy="9.2" r="1.7"></circle>
                <circle class="qo-fill-1" cx="9.2" cy="14.8" r="1.7"></circle>
                <circle class="qo-fill-1" cx="14.8" cy="14.8" r="1.7"></circle>
              </svg>
            }
            @case ('jira') {
              <svg viewBox="0 0 24 24" fill="none">
                <path class="qo-fill-1" d="M12 4l8 8-8 8-8-8 8-8z"></path>
                <path class="qo-fill-2" d="M12 7l5 5-5 5-5-5 5-5z"></path>
              </svg>
            }
            @case ('linkedin') {
              <svg viewBox="0 0 24 24" fill="none">
                <text class="qo-fill-1" x="5.1" y="17.2" font-size="12.4" font-family="Arial, sans-serif" font-weight="600">in</text>
              </svg>
            }
            @case ('microsoft-teams') {
              <svg viewBox="0 0 24 24" fill="none">
                <circle class="qo-fill-1" cx="9" cy="10" r="3.2"></circle>
                <circle class="qo-fill-2" cx="15.5" cy="10" r="3.2"></circle>
                <circle class="qo-fill-3" cx="12.2" cy="16.2" r="3.2"></circle>
              </svg>
            }
            @case ('notion') {
              <svg viewBox="0 0 24 24" fill="none">
                <rect class="qo-fill-1 qo-stroke-1" x="6" y="6" width="12" height="12" stroke-width="2"></rect>
              </svg>
            }
            @case ('salesforce') {
              <svg viewBox="0 0 24 24" fill="none">
                <path class="qo-fill-1 qo-stroke-1" d="M8.8 15.8c-1.8 0-3.3-1.3-3.3-3s1.5-3 3.3-3c.3-1.9 2-3.4 4.1-3.4 2.1 0 3.9 1.6 4.1 3.7 1.3.2 2.3 1.3 2.3 2.7 0 1.5-1.2 2.8-2.8 2.8H8.8z"></path>
              </svg>
            }
            @case ('slack') {
              <svg viewBox="0 0 24 24" fill="none">
                <rect class="qo-fill-1" x="6.5" y="9" width="3.1" height="8" rx="1.55"></rect>
                <rect class="qo-fill-2" x="9" y="6.5" width="8" height="3.1" rx="1.55"></rect>
                <rect class="qo-fill-3" x="14.4" y="7" width="3.1" height="8" rx="1.55"></rect>
                <rect class="qo-fill-4" x="7" y="14.4" width="8" height="3.1" rx="1.55"></rect>
              </svg>
            }
            @case ('stripe') {
              <svg viewBox="0 0 24 24" fill="none">
                <path class="qo-fill-1" d="M7.3 8.6c0-1.8 1.6-3 4-3 1.2 0 2.5.3 3.5.9v2.6c-1-.6-2.2-1-3.4-1-1 0-1.5.3-1.5.9 0 .4.3.7 1.2 1.1l1.5.6c2 .8 2.9 1.9 2.9 3.6 0 2.3-1.8 3.6-4.5 3.6-1.4 0-2.8-.3-3.9-1v-2.7c1.1.8 2.4 1.2 3.8 1.2 1 0 1.6-.3 1.6-1 0-.5-.3-.8-1.3-1.2l-1.4-.6c-1.9-.8-2.5-1.8-2.5-3.4z"></path>
              </svg>
            }
            @case ('zoho-crm') {
              <svg viewBox="0 0 24 24" fill="none">
                <rect class="qo-fill-1" x="5" y="5" width="6.8" height="6.8" rx=".3"></rect>
                <rect class="qo-fill-2" x="12.2" y="5" width="6.8" height="6.8" rx=".3"></rect>
                <rect class="qo-fill-3" x="5" y="12.2" width="6.8" height="6.8" rx=".3"></rect>
                <rect class="qo-fill-4" x="12.2" y="12.2" width="6.8" height="6.8" rx=".3"></rect>
                <path class="qo-stroke-1" d="M11.8 5v14M5 11.8h14" stroke-width=".7" opacity=".28"></path>
              </svg>
            }
            @case ('custom-rest-api') {
              <svg viewBox="0 0 24 24" fill="none">
                <text class="qo-fill-1" x="3.8" y="16.5" font-size="10" font-family="Arial, sans-serif" font-weight="500">API</text>
              </svg>
            }
          }
        </span>
      } @else if (glyph()) {
        <span class="qo-connector-icon-glyph" aria-hidden="true">{{ glyph() }}</span>
      } @else {
        <qo-icon [name]="iconName()" [size]="iconSize()"></qo-icon>
      }
    </div>
  `,
  styleUrl: './connector-icon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QoConnectorIconComponent {
  readonly type = input<ConnectorType>('default');
  readonly size = input<ConnectorIconSize>('md');
  readonly appearance = input<'surface' | 'plain'>('surface');

  readonly wrapperClassName = computed(() =>
    [
      `qo-connector-appearance-${this.appearance()}`,
      `qo-connector-size-${this.resolveSize()}`,
      `qo-connector-${this.type()}`
    ].join(' ')
  );

  readonly logoPath = computed(() => this.logoMap[this.type()] ?? null);

  readonly svgType = computed(() => {
    const type = this.type();
    return this.svgConnectors.has(type) ? type : null;
  });

  readonly glyph = computed(() => {
    const type = this.type();
    return this.glyphMap[type] ?? null;
  });

  readonly iconName = computed(() => this.iconMap[this.type()] ?? 'database');
  readonly iconSize = computed<QoSize>(() => {
    const size = this.size();
    return size === 'card' ? 'md' : size;
  });

  private readonly svgConnectors = new Set<ConnectorType>([
    'airtable',
    'amplitude',
    'asana',
    'aws-lambda',
    'clickup',
    'dropbox',
    'github',
    'gmail',
    'google-calendar',
    'google-docs',
    'google-drive',
    'google_sheets',
    'hubspot',
    'twilio',
    'jira',
    'linkedin',
    'microsoft-teams',
    'notion',
    'salesforce',
    'slack',
    'stripe',
    'zoho-crm',
    'custom-rest-api',
  ]);

  private readonly glyphMap: Partial<Record<ConnectorType, string>> = {
    mongodb: '🍃',
    redis: '🔴',
    firestore: '🔥',
    databricks: '🧊',
    authenticated_api: '🔐',
  };

  private readonly logoMap: Partial<Record<ConnectorType, string>> = {
    postgresql: 'assets/connector-logos/postgresql.svg',
    mongodb: 'assets/connector-logos/mongodb.svg',
    mysql: 'assets/connector-logos/mysql.svg',
    elasticsearch: 'assets/connector-logos/elasticsearch.svg',
    dynamodb: 'assets/connector-logos/dynamodb.svg',
    redis: 'assets/connector-logos/redis.svg',
    mssql: 'assets/connector-logos/mssql.svg',
    firestore: 'assets/connector-logos/firestore.svg',
    snowflake: 'assets/connector-logos/snowflake.svg',
    arangodb: 'assets/connector-logos/arangodb.svg',
    oracle: 'assets/connector-logos/oracle.svg',
    databricks: 'assets/connector-logos/databricks.svg',
  };

  private readonly iconMap: Record<ConnectorType, string> = {
    postgres: 'database',
    postgresql: 'database',
    mysql: 'database',
    mongodb: 'database',
    mssql: 'database',
    redis: 'database',
    firestore: 'database',
    snowflake: 'database',
    arangodb: 'database',
    oracle: 'database',
    databricks: 'database',
    dynamodb: 'database',
    elasticsearch: 'search',
    google_sheets: 'database',
    rest: 'globe',
    rest_api: 'globe',
    graphql: 'code',
    graphql_api: 'code',
    authenticated_api: 'globe',
    authenticated_graphql: 'code',
    stripe: 'database',
    airtable: 'database',
    amplitude: 'database',
    asana: 'database',
    'aws-lambda': 'code',
    clickup: 'database',
    dropbox: 'database',
    github: 'database',
    gmail: 'mail',
    'google-calendar': 'calendar',
    'google-docs': 'list',
    'google-drive': 'database',
    hubspot: 'database',
    twilio: 'database',
    jira: 'database',
    linkedin: 'database',
    'microsoft-teams': 'database',
    notion: 'database',
    salesforce: 'database',
    slack: 'database',
    'zoho-crm': 'database',
    'custom-rest-api': 'globe',
    default: 'database',
  };

  private resolveSize(): ConnectorIconSize {
    const size = this.size();
    return size === 'sm' || size === 'md' || size === 'lg' || size === 'card' ? size : 'md';
  }
}

