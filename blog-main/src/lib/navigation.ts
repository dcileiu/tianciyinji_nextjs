import { primaryNavItems } from './site-config';

export const NAV_ITEMS = primaryNavItems;

export const NAV_ITEMS_LEGACY = NAV_ITEMS.filter((item) => item.enabled).map((item) => ({
  name: item.label,
  path: item.href,
}));
