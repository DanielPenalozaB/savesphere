import * as m from '$lib/paraglide/messages.js';

export const routeMap: Record<string, string | (() => string)> = {
  dashboard: () => m.sidebar_nav_dashboard(),
  wallets: () => m.sidebar_nav_wallets(),
  bills: () => m.sidebar_nav_bills(),
  transactions: () => m.sidebar_nav_transactions(),
  history: () => m.sidebar_nav_history(),
  categories: () => m.sidebar_nav_categories(),
  insights: () => m.sidebar_nav_insights(),
  planning: () => m.sidebar_nav_planning(),
  subscriptions: () => m.sidebar_nav_subscriptions(),
  simulations: () => m.sidebar_nav_simulations(),
  management: () => m.sidebar_nav_management(),
  taxonomy: () => m.sidebar_nav_taxonomy(),
  support: () => m.sidebar_nav_support(),
  feedback: () => m.sidebar_nav_feedback()
};

export const formatFallback = (segment: string) => {
  return segment
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
