import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { QoSize } from '@qo/ui-components/lib/base';


@Component({
  selector: 'qo-icon',
  standalone: true,
  imports: [],
  template: `
    <svg [class]="'qo-icon qo-icon-' + size()" [style.color]="color()" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      @if (name() === 'inbox') {
        <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline>
        <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
      } @else if (name() === 'database') {
        <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
      } @else if (name() === 'plus') {
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      } @else if (name() === 'user-plus') {
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <line x1="19" y1="8" x2="19" y2="14"></line>
        <line x1="22" y1="11" x2="16" y2="11"></line>
      } @else if (name() === 'download') {
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
      } @else if (name() === 'credit-card') {
        <rect x="2" y="5" width="20" height="14" rx="2"></rect>
        <line x1="2" y1="10" x2="22" y2="10"></line>
      } @else if (name() === 'filter') {
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
      } @else if (name() === 'minus') {
        <line x1="5" y1="12" x2="19" y2="12"></line>
      } @else if (name() === 'arrow-left') {
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
      } @else if (name() === 'save') {
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
        <polyline points="17 21 17 13 7 13 7 21"></polyline>
        <polyline points="7 3 7 8 15 8"></polyline>
      } @else if (name() === 'chevron-down') {
        <polyline points="6 9 12 15 18 9"></polyline>
      } @else if (name() === 'chevron-right') {
        <polyline points="9 6 15 12 9 18"></polyline>
      } @else if (name() === 'chevron-left') {
        <polyline points="15 18 9 12 15 6"></polyline>
      } @else if (name() === 'chevron-right') {
        <polyline points="9 18 15 12 9 6"></polyline>
      }  @else if (name() === 'panel-collapse') {
      <rect x="3" y="4" width="18" height="16" rx="2"></rect>
      <line x1="9" y1="4" x2="9" y2="20"></line>
      <polyline points="15 9 11 12 15 15"></polyline>
      } @else if (name() === 'panel-expand') {
      <rect x="3" y="4" width="18" height="16" rx="2"></rect>
      <line x1="9" y1="4" x2="9" y2="20"></line>
      <polyline points="11 9 15 12 11 15"></polyline>
      } @else if (name() === 'info') {
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      } @else if (name() === 'help-circle') {
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M9.1 9a3 3 0 1 1 5.8 1c0 2-3 2-3 4"></path>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      } @else if (name() === 'alert-triangle') {
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      } @else if (name() === 'camera') {
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
        <circle cx="12" cy="13" r="4"></circle>
      } @else if (name() === 'bell') {
        <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
        <path d="M10.3 21a2 2 0 0 0 3.4 0"></path>
      } @else if (name() === 'ellipsis-vertical') {
        <circle cx="12" cy="5" r="1.5" fill="currentColor" stroke="none"></circle>
        <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"></circle>
        <circle cx="12" cy="19" r="1.5" fill="currentColor" stroke="none"></circle>
      } @else if (name() === 'check') {
        <polyline points="20 6 9 17 4 12"></polyline>
      } @else if (name() === 'calendar') {
        <rect x="3" y="4" width="18" height="18" rx="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
      } @else if (name() === 'clock') {
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      } @else if (name() === 'calendar-clock') {
        <rect x="3" y="4" width="15" height="15" rx="2"></rect>
        <line x1="14" y1="2" x2="14" y2="6"></line>
        <line x1="7" y1="2" x2="7" y2="6"></line>
        <line x1="3" y1="9" x2="18" y2="9"></line>
        <circle cx="17" cy="17" r="4"></circle>
        <polyline points="17 15 17 17 19 18"></polyline>
      } @else if (name() === 'message-square' || name() === 'message-circle-question') {
        <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"></path>
        @if (name() === 'message-circle-question') {
          <path d="M10 9a2 2 0 1 1 3 1.73c-.6.35-1 .74-1 1.27"></path>
          <line x1="12" y1="15" x2="12.01" y2="15"></line>
        }
      } @else if (name() === 'globe') {
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M2 12h20"></path>
        <path d="M12 2a15 15 0 0 1 0 20"></path>
        <path d="M12 2a15 15 0 0 0 0 20"></path>
      } @else if (name() === 'mail') {
        <rect x="3" y="5" width="18" height="14" rx="2"></rect>
        <path d="M3 7l9 6 9-6"></path>
      } @else if (name() === 'git-branch') {
        <line x1="6" y1="3" x2="6" y2="15"></line>
        <circle cx="6" cy="18" r="3"></circle>
        <circle cx="6" cy="6" r="3"></circle>
        <path d="M9 6h4a5 5 0 0 1 5 5v1"></path>
        <circle cx="18" cy="18" r="3"></circle>
      } @else if (name() === 'workflow' || name() === 'split') {
        <rect x="3" y="4" width="6" height="6" rx="1"></rect>
        <rect x="15" y="4" width="6" height="6" rx="1"></rect>
        <rect x="9" y="15" width="6" height="6" rx="1"></rect>
        <path d="M6 10v2a3 3 0 0 0 3 3h3"></path>
        <path d="M18 10v2a3 3 0 0 1-3 3h-3"></path>
      } @else if (name() === 'panel-top') {
        <rect x="3" y="4" width="18" height="16" rx="2"></rect>
        <line x1="3" y1="9" x2="21" y2="9"></line>
      } @else if (name() === 'blocks') {
        <rect x="3" y="3" width="7" height="7" rx="1"></rect>
        <rect x="14" y="3" width="7" height="7" rx="1"></rect>
        <rect x="3" y="14" width="7" height="7" rx="1"></rect>
        <rect x="14" y="14" width="7" height="7" rx="1"></rect>
      } @else if (name() === 'send' || name() === 'navigation') {
        <path d="M22 2L11 13"></path>
        <path d="M22 2l-7 20-4-9-9-4z"></path>
      } @else if (name() === 'bell') {
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"></path>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
      } @else if (name() === 'shuffle') {
        <path d="M16 3h5v5"></path>
        <path d="M4 20L21 3"></path>
        <path d="M21 16v5h-5"></path>
        <path d="M15 15l6 6"></path>
        <path d="M4 4l5 5"></path>
      } @else if (name() === 'cloud-upload') {
        <path d="M16 16l-4-4-4 4"></path>
        <path d="M12 12v9"></path>
        <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"></path>
        <path d="M16 16h1a4 4 0 0 0 0-8"></path>
      } @else if (name() === 'play') {
        <polygon points="8 5 19 12 8 19 8 5"></polygon>
      } @else if (name() === 'code') {
        <polyline points="16 18 22 12 16 6"></polyline>
        <polyline points="8 6 2 12 8 18"></polyline>
      } @else if (name() === 'search') {
        <circle cx="11" cy="11" r="7"></circle>
        <line x1="16.65" y1="16.65" x2="21" y2="21"></line>
      } @else if (name() === 'x') {
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      } @else if (name() === 'trash' || name() === 'trash-2') {
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"></path>
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
        <line x1="10" y1="11" x2="10" y2="17"></line>
        <line x1="14" y1="11" x2="14" y2="17"></line>
      } @else if (name() === 'edit') {
        <path d="M12 20h9"></path>
        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path>
      } @else if (name() === 'lock') {
        <rect x="4" y="11" width="16" height="10" rx="2"></rect>
        <path d="M8 11V7a4 4 0 0 1 8 0v4"></path>
      } @else if (name() === 'check-circle') {
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="9 12 11 14 15 10"></polyline>
      } @else if (name() === 'edit') {
        <path d="M12 20h9"></path>
        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path>
      } @else if (name() === 'copy') {
        <rect x="9" y="9" width="11" height="11" rx="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
      } @else if (name() === 'palette') {
        <path d="M12 3a9 9 0 0 0 0 18h1.2a2.8 2.8 0 0 0 0-5.6h-.46a1.7 1.7 0 0 1 0-3.4H17a4 4 0 0 0 0-8z"></path>
        <circle cx="7" cy="10" r="1"></circle>
        <circle cx="10.5" cy="7.5" r="1"></circle>
        <circle cx="14.5" cy="7.5" r="1"></circle>
        <circle cx="17.5" cy="10.5" r="1"></circle>
      } @else if (name() === 'list') {
        <line x1="8" y1="7" x2="19" y2="7"></line>
        <line x1="8" y1="12" x2="19" y2="12"></line>
        <line x1="8" y1="17" x2="19" y2="17"></line>
        <circle cx="5" cy="7" r="1"></circle>
        <circle cx="5" cy="12" r="1"></circle>
        <circle cx="5" cy="17" r="1"></circle>
      } @else if (name() === 'radio_button_checked') {
        <circle cx="12" cy="12" r="8"></circle>
        <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"></circle>
      } @else if (name() === 'filter') {
        <line x1="4" y1="7" x2="20" y2="7"></line>
        <line x1="7" y1="12" x2="17" y2="12"></line>
        <line x1="10" y1="17" x2="14" y2="17"></line>
      } @else if (name() === 'sort') {
        <line x1="4" y1="7" x2="18" y2="7"></line>
        <line x1="4" y1="12" x2="14" y2="12"></line>
        <line x1="4" y1="17" x2="10" y2="17"></line>
      } @else if (name() === 'sort-alpha') {
        <path d="M7 18V6"></path>
        <path d="M5 8l2-2 2 2"></path>
        <path d="M14 7h5l-5 6h5"></path>
        <path d="M14 18h5"></path>
      } @else if (name() === 'calendar') {
        <rect x="3" y="5" width="18" height="16" rx="2"></rect>
        <line x1="16" y1="3" x2="16" y2="7"></line>
        <line x1="8" y1="3" x2="8" y2="7"></line>
        <line x1="3" y1="11" x2="21" y2="11"></line>
      } @else if (name() === 'download') {
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
      } @else if (name() === 'drag') {
        <circle cx="8" cy="8" r="1.4" fill="currentColor" stroke="none"></circle>
        <circle cx="8" cy="12" r="1.4" fill="currentColor" stroke="none"></circle>
        <circle cx="8" cy="16" r="1.4" fill="currentColor" stroke="none"></circle>
        <circle cx="12" cy="8" r="1.4" fill="currentColor" stroke="none"></circle>
        <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"></circle>
        <circle cx="12" cy="16" r="1.4" fill="currentColor" stroke="none"></circle>
      } @else if (name() === 'eye') {
        <path d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12 18 18.75 12 18.75 2.25 12 2.25 12z"></path>
        <circle cx="12" cy="12" r="2.25"></circle>
      } @else if (name() === 'eye-off') {
        <path d="M3 3l18 18"></path>
        <path d="M9.88 9.88A2.25 2.25 0 0 0 12 14.25c.54 0 1.04-.19 1.43-.5"></path>
        <path d="M6.7 6.7C3.9 8.45 2.25 12 2.25 12S6 18.75 12 18.75c1.78 0 3.34-.46 4.66-1.14"></path>
        <path d="M19.1 15.27C20.78 13.61 21.75 12 21.75 12S18 5.25 12 5.25c-.95 0-1.84.11-2.66.32"></path>
      } @else if (name() === 'settings') {
        <path d="M12 8.25a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5z"></path>
        <path d="M19.43 12.98c.04-.32.07-.65.07-.98s-.03-.66-.07-.98l2.02-1.58-1.91-3.31-2.39.96a7.4 7.4 0 0 0-1.7-.98L15.08 3.5h-3.82l-.36 2.61c-.61.24-1.18.57-1.7.98l-2.39-.96L4.9 9.44l2.02 1.58c-.04.32-.07.65-.07.98s.03.66.07.98L4.9 14.56l1.91 3.31 2.39-.96c.52.41 1.09.74 1.7.98l.36 2.61h3.82l.36-2.61c.61-.24 1.18-.57 1.7-.98l2.39.96 1.91-3.31-2.01-1.58z"></path>
      } @else if (name() === 'settings-2') {
        <path d="M20 7h-9"></path>
        <path d="M14 17H5"></path>
        <circle cx="17" cy="17" r="3"></circle>
        <circle cx="7" cy="7" r="3"></circle>
      } @else if (name() === 'more-vertical') {
        <circle cx="12" cy="5" r="1.5" fill="currentColor" stroke="none"></circle>
        <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"></circle>
        <circle cx="12" cy="19" r="1.5" fill="currentColor" stroke="none"></circle>
      } @else if (name() === 'more-horizontal') {
        <circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none"></circle>
        <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"></circle>
        <circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none"></circle>
      } @else if (name() === 'external-link') {
        <path d="M14 5h5v5"></path>
        <path d="M10 14L19 5"></path>
        <path d="M19 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h4"></path>
      } @else if (name() === 'printer') {
        <polyline points="6 9 6 2 18 2 18 9"></polyline>
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
        <rect x="6" y="14" width="12" height="8"></rect>
      } @else if (name() === 'rotate-cw') {
        <polyline points="23 4 23 10 17 10"></polyline>
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
      } @else if (name() === 'pencil') {
        <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
      } @else if (name() === 'pin') {
        <line x1="12" y1="17" x2="12" y2="22"></line>
        <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17z"></path>
      } @else if (name() === 'pin-off') {
        <line x1="2" y1="2" x2="22" y2="22"></line>
        <line x1="12" y1="17" x2="12" y2="22"></line>
        <path d="M9 9v1.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17h12"></path>
        <path d="M15 9.34V6h1a2 2 0 0 0 0-4H7.89"></path>
      } @else if (name() === 'chevrons-up') {
        <polyline points="17 11 12 6 7 11"></polyline>
        <polyline points="17 18 12 13 7 18"></polyline>
      } @else if (name() === 'chevrons-down') {
        <polyline points="7 13 12 18 17 13"></polyline>
        <polyline points="7 6 12 11 17 6"></polyline>
      } @else if (name() === 'corner-down-left') {
        <polyline points="9 10 4 15 9 20"></polyline>
        <path d="M20 4v7a4 4 0 0 1-4 4H4"></path>
      } @else if (name() === 'align-justify') {
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
      } @else if (name() === 'align-center') {
        <line x1="21" y1="6" x2="3" y2="6"></line>
        <line x1="18" y1="10" x2="6" y2="10"></line>
        <line x1="21" y1="14" x2="3" y2="14"></line>
        <line x1="18" y1="18" x2="6" y2="18"></line>
      } @else if (name() === 'layout-list') {
        <rect x="3" y="14" width="7" height="7"></rect>
        <rect x="3" y="3" width="7" height="7"></rect>
        <line x1="14" y1="4" x2="21" y2="4"></line>
        <line x1="14" y1="9" x2="21" y2="9"></line>
        <line x1="14" y1="15" x2="21" y2="15"></line>
        <line x1="14" y1="20" x2="21" y2="20"></line>
      } @else if (name() === 'image') {
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <circle cx="8.5" cy="8.5" r="1.5"></circle>
        <polyline points="21 15 16 10 5 21"></polyline>
      } @else if (name() === 'bookmark') {
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
      } @else if (name() === 'download') {
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
      } @else if (name() === 'folder') {
        <path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      } @else if (name() === 'arrow-up') {
        <line x1="12" y1="19" x2="12" y2="5"></line>
        <polyline points="5 12 12 5 19 12"></polyline>
      } @else if (name() === 'arrow-down') {
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <polyline points="19 12 12 19 5 12"></polyline>
      } @else if (name() === 'filter') {
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
      } @else if (name() === 'columns') {
        <rect x="3" y="3" width="8" height="18"></rect>
        <rect x="13" y="3" width="8" height="18"></rect>
      } @else if (name() === 'layout-grid') {
        <rect x="3" y="3" width="7" height="7" rx="1"></rect>
        <rect x="14" y="3" width="7" height="7" rx="1"></rect>
        <rect x="14" y="14" width="7" height="7" rx="1"></rect>
        <rect x="3" y="14" width="7" height="7" rx="1"></rect>
      } @else if (name() === 'panel-top') {
        <rect x="3" y="3" width="18" height="18" rx="2"></rect>
        <line x1="3" y1="9" x2="21" y2="9"></line>
      } @else if (name() === 'monitor') {
        <rect x="2" y="3" width="20" height="14" rx="2"></rect>
        <line x1="8" y1="21" x2="16" y2="21"></line>
        <line x1="12" y1="17" x2="12" y2="21"></line>
      } @else if (name() === 'tablet') {
        <rect x="4" y="2" width="16" height="20" rx="2"></rect>
        <line x1="12" y1="18" x2="12.01" y2="18"></line>
      } @else if (name() === 'smartphone') {
        <rect x="5" y="2" width="14" height="20" rx="2"></rect>
        <line x1="12" y1="18" x2="12.01" y2="18"></line>

      } @else if (name() === 'camera') {
        <path d="M4 7h3l2-3h6l2 3h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z"></path>
        <circle cx="12" cy="13" r="4"></circle>
      } @else if (name() === 'mic') {
        <rect x="9" y="3" width="6" height="11" rx="3"></rect>
        <path d="M5 11a7 7 0 0 0 14 0"></path>
        <line x1="12" y1="18" x2="12" y2="22"></line>
        <line x1="8" y1="22" x2="16" y2="22"></line>
      } @else if (name() === 'video') {
        <rect x="3" y="6" width="13" height="12" rx="2"></rect>
        <path d="M16 10l5-3v10l-5-3z"></path>

      } @else if (name() === 'lock') {
        <rect x="4" y="11" width="16" height="10" rx="2"></rect>
        <path d="M8 11V7a4 4 0 0 1 8 0v4"></path>
      } @else if (name() === 'upload') {
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="17 8 12 3 7 8"></polyline>
        <line x1="12" y1="3" x2="12" y2="15"></line>
      } @else if (name() === 'image') {
        <rect x="3" y="3" width="18" height="18" rx="2"></rect>
        <circle cx="8.5" cy="8.5" r="1.5"></circle>
        <path d="M21 15l-5-5L5 21"></path>
      } @else if (name() === 'file-text') {
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="8" y1="13" x2="16" y2="13"></line>
        <line x1="8" y1="17" x2="16" y2="17"></line>
      } @else if (name() === 'bar-chart-3') {
        <path d="M3 3v18h18"></path>
        <rect x="7" y="12" width="3" height="5"></rect>
        <rect x="12" y="8" width="3" height="9"></rect>
        <rect x="17" y="5" width="3" height="12"></rect>
      } @else if (name() === 'layout-dashboard') {
        <rect x="3" y="3" width="7" height="9" rx="1"></rect>
        <rect x="14" y="3" width="7" height="5" rx="1"></rect>
        <rect x="14" y="12" width="7" height="9" rx="1"></rect>
        <rect x="3" y="16" width="7" height="5" rx="1"></rect>
      } @else if (name() === 'users') {
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      } @else if (name() === 'more-horizontal') {
        <circle cx="12" cy="12" r="1"></circle>
        <circle cx="19" cy="12" r="1"></circle>
        <circle cx="5" cy="12" r="1"></circle>
      } @else if (name() === 'chevron-left') {
        <polyline points="15 18 9 12 15 6"></polyline>
      } @else if (name() === 'chevron-right') {
        <polyline points="9 18 15 12 9 6"></polyline>
      } @else if (name() === 'settings') {
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1 .6 1.65 1.65 0 0 0-.33 1.82 2 2 0 1 1-3.34 0A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-.6-1 1.65 1.65 0 0 0-1.82-.33 2 2 0 1 1 0-3.34A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-.6 1.65 1.65 0 0 0 .33-1.82 2 2 0 1 1 3.34 0A1.65 1.65 0 0 0 15 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.14.36.36.69.6 1a1.65 1.65 0 0 0 1.82.33 2 2 0 1 1 0 3.34A1.65 1.65 0 0 0 19.4 15z"></path>
      } @else {
        <circle cx="12" cy="12" r="10"></circle>
      }
    </svg>
  `,
  styleUrl: './icon.component.scss'
,
  changeDetection: ChangeDetectionStrategy.OnPush})
export class QoIconComponent {
  name = input.required<string>();
  size = input<QoSize>('md');
  color = input<string>('currentColor');
}

