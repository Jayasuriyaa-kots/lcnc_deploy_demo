import { computed, Injectable, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { QoBreadcrumbItem } from '@qo/ui-components';
import { filter, map, startWith } from 'rxjs';
import { NotificationsFacadeService } from '../../../pages/notifications/services/notifications-facade.service';
import { OrganisationsFacadeService } from './organisations-facade.service';
import { DeployerI18nService } from '../../../services/deployer-i18n.service';

@Injectable({ providedIn: 'root' })
export class AppShellFacadeService {
  private readonly notificationsFacade = inject(NotificationsFacadeService);
  private readonly organisationsFacade = inject(OrganisationsFacadeService);
  private readonly i18n = inject(DeployerI18nService);
  private readonly router = inject(Router);
  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
      startWith(this.router.url)
    ),
    { initialValue: this.router.url }
  );

  readonly organisationSearch = signal('');
  readonly organisations = this.organisationsFacade.organisations;
  readonly activeOrganisationId = this.organisationsFacade.selectedOrganisationId;
  readonly addingOrganisation = this.organisationsFacade.isAddModalOpen;
  readonly organisationForm = this.organisationsFacade.organisationForm;
  readonly organisationEntityTypes = this.organisationsFacade.organisationEntityTypes;
  readonly profileMenuOpen = signal(false);
  readonly notificationsOpen = this.notificationsFacade.open;
  readonly unreadCount = this.notificationsFacade.unreadCount;
  readonly topTabs = signal([
    { label: this.i18n.translate('dashboard.title'), path: '/dashboard' },
    { label: this.i18n.translate('users.usersPageTitle'), path: '/users' },
    { label: this.i18n.translate('usage.title'), path: '/usage' },
    { label: this.i18n.translate('settings.title'), path: '/settings' }
  ] as const);
  readonly filteredOrganisations = computed(() => {
    const query = this.organisationSearch().toLowerCase().trim();

    return this.organisations().filter((organisation) =>
      [
        organisation.name,
        organisation.entityType,
        organisation.primaryOwnerEmail,
        organisation.billingEmail,
        ...(organisation.additionalAdminUsers ?? [])
      ].some((value) => value.toLowerCase().includes(query))
    );
  });
  readonly breadcrumbItems = computed<readonly QoBreadcrumbItem[]>(() => {
    const segment = this.currentUrl().split('/').filter(Boolean).at(-1) ?? 'dashboard';

    return [
      { label: this.i18n.translate('organisations.workspaceBreadcrumb') },
      { label: segment.replace('-', ' ') }
    ];
  });

  selectOrganisation(organisationId: string): void {
    this.organisationsFacade.selectOrganisation(organisationId);
  }

  openAddOrganisationModal(): void {
    this.organisationsFacade.openAddOrganisationModal();
  }

  closeAddOrganisationModal(): void {
    this.organisationsFacade.closeAddOrganisationModal();
  }

  submitOrganisationForm(): void {
    this.organisationsFacade.submitOrganisationForm();
  }

  toggleProfileMenu(): void {
    this.profileMenuOpen.update((open) => !open);
  }

  closeProfileMenu(): void {
    this.profileMenuOpen.set(false);
  }
}
