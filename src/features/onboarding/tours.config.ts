/**
 * Single source of truth for every guided tour in the app. Add a new tour
 * (or a new step to an existing one) by editing this file only — the
 * engine (OnboardingContext/TourHost/TourOverlay/TourPopover) never needs
 * to change. Steps target real elements via `[data-tour="<targetId>"]`
 * attributes already on the component; if a step's `route` differs from
 * the current page, TourHost navigates there before highlighting.
 */

export interface TourStep {
  /** Also doubles as the value components check to opt into "open me while
   * this step is active" behavior (see ProfileMenu). */
  id: string
  title: string
  description: string
  /** Matches a `data-tour="<targetId>"` attribute somewhere in the DOM. */
  targetId: string
  /** Route the step's target lives on. Omit if reachable from anywhere
   * (e.g. the navbar/profile menu, which render on every page). */
  route?: string
  placement?: 'top' | 'bottom' | 'left' | 'right'
}

export interface TourDefinition {
  id: string
  title: string
  steps: TourStep[]
}

const clientMain: TourDefinition = {
  id: 'client-main',
  title: 'TopDek Tour',
  steps: [
    {
      id: 'nav-overview',
      title: 'Get around TopDek',
      description: 'Use the navbar to browse professionals, check your bookings, and manage everything else.',
      targetId: 'nav-links',
      placement: 'bottom',
    },
    {
      id: 'client-search',
      title: 'Search for professionals',
      description: 'Find providers by name or location right from your dashboard.',
      targetId: 'client-search',
      route: '/dashboard',
      placement: 'bottom',
    },
    {
      id: 'saved-providers',
      title: 'Your saved providers',
      description: "Heart a provider you like and they'll show up here for quick access later.",
      targetId: 'saved-providers',
      route: '/dashboard',
      placement: 'top',
    },
    {
      id: 'notification-bell',
      title: 'Stay in the loop',
      description: 'Booking updates land here — and as real push notifications, even when TopDek is closed.',
      targetId: 'notification-bell',
      placement: 'bottom',
    },
    {
      id: 'profile-menu',
      title: 'Your account',
      description: 'Everything account-related lives behind your email — dashboard, settings, and logging out.',
      targetId: 'profile-menu',
      placement: 'bottom',
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'Manage your account here — and replay this tour any time you want.',
      targetId: 'settings-link',
      placement: 'bottom',
    },
    {
      id: 'help',
      title: 'Help & Support',
      description: "Stuck on something? You'll always find help here.",
      targetId: 'help-link',
      placement: 'bottom',
    },
    {
      id: 'become-provider',
      title: 'Have a service to offer?',
      description: 'Set up your own store and start taking bookings from clients — free forever.',
      targetId: 'become-provider',
      route: '/dashboard',
      placement: 'top',
    },
  ],
}

const providerMain: TourDefinition = {
  id: 'provider-main',
  title: 'TopDek Tour',
  steps: [
    {
      id: 'nav-overview',
      title: 'Get around TopDek',
      description: 'Your navbar includes quick links to your bookings and availability, alongside the rest of the app.',
      targetId: 'nav-links',
      placement: 'bottom',
    },
    {
      id: 'provider-dashboard',
      title: 'Your provider dashboard',
      description: 'Everything about running your store — bookings, availability, services, and your public profile — starts here.',
      targetId: 'provider-dashboard-cards',
      route: '/provider',
      placement: 'right',
    },
    {
      id: 'notification-bell',
      title: 'Stay in the loop',
      description: 'New booking requests land here — and as real push notifications, even when TopDek is closed.',
      targetId: 'notification-bell',
      placement: 'bottom',
    },
    {
      id: 'create-service',
      title: 'Add a service',
      description: 'This is where you list what you offer — pricing, duration, and photos.',
      targetId: 'add-service-form',
      route: '/provider/services',
      placement: 'left',
    },
    {
      id: 'availability',
      title: 'Set your availability',
      description: 'Add the dates and times clients can actually book you.',
      targetId: 'availability-section',
      route: '/provider/availability',
      placement: 'bottom',
    },
    {
      id: 'profile-menu',
      title: 'Your account',
      description: 'Everything account-related lives behind your email — dashboard, settings, and logging out.',
      targetId: 'profile-menu',
      placement: 'bottom',
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'Manage your account here — and replay this tour any time you want.',
      targetId: 'settings-link',
      placement: 'bottom',
    },
    {
      id: 'help',
      title: 'Help & Support',
      description: "Stuck on something? You'll always find help here.",
      targetId: 'help-link',
      placement: 'bottom',
    },
  ],
}

export const tours: Record<string, TourDefinition> = {
  'client-main': clientMain,
  'provider-main': providerMain,
}

export function getTour(tourId: string): TourDefinition | undefined {
  return tours[tourId]
}
