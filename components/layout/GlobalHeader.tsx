'use client';

import { usePathname } from 'next/navigation';
import PillNav from '@/components/interactive/PillNav';
import type { PillNavItem } from '@/components/interactive/PillNav';

const MASTER_NAV_ITEMS: PillNavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Connect', href: '/connect' },
  { label: 'Workspace', href: '/workspace' },
  { label: 'Reports', href: '/reports' },
  { label: 'Contact', href: '/contact' },
];

function getNavItemsForPath(pathname: string): PillNavItem[] {
  // Filter out the item that matches the current section
  return MASTER_NAV_ITEMS.filter(item => {
    if (item.href === '/' && pathname === '/') return false;
    if (item.href !== '/' && pathname.startsWith(item.href)) return false;
    return true;
  });
}

function getActiveHref(pathname: string): string | undefined {
  // Active state logic is now simplified since current page is removed from nav
  // But we might want to keep it if we ever show the current page active in a different context
  // For this specific request, the current page is NOT in the list, so activeHref is likely not needed 
  // for the items in the list, unless there's a sub-page scenario.
  // However, PillNav expects activeHref. Let's keep it consistent.
  if (pathname === '/') return '/';
  if (pathname.startsWith('/connect')) return '/connect';
  if (pathname.startsWith('/workspace')) return '/workspace';
  if (pathname.startsWith('/reports')) return '/reports';
  if (pathname.startsWith('/contact')) return '/contact';
  return undefined;
}

export default function GlobalHeader() {
  const pathname = usePathname();
  const activeHref = getActiveHref(pathname);

  return (
    <PillNav
      items={getNavItemsForPath(pathname)}
      activeHref={activeHref}
      baseColor="var(--fg)"
      pillColor="var(--bg-surface)"
      hoveredPillTextColor="var(--bg)"
      pillTextColor="var(--fg)"
      initialLoadAnimation={true}
    />
  );
}
