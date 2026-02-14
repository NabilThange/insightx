'use client';

import { usePathname } from 'next/navigation';
import PillNav from '@/components/interactive/PillNav';
import type { PillNavItem } from '@/components/interactive/PillNav';

const NAV_ITEMS: PillNavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Connect', href: '/connect' },
  { label: 'Workspace', href: '/workspace' },
  { label: 'Contact', href: '/contact' },
];

function getActiveHref(pathname: string): string | undefined {
  if (pathname === '/') return '/';
  if (pathname.startsWith('/connect')) return '/connect';
  if (pathname.startsWith('/workspace')) return '/workspace';
  if (pathname.startsWith('/reports')) return '/reports'; // Keep internal logic separate if needed, though not in nav
  if (pathname.startsWith('/contact')) return '/contact';
  return undefined;
}

export default function GlobalHeader() {
  const pathname = usePathname();
  const activeHref = getActiveHref(pathname);

  return (
    <PillNav
      items={NAV_ITEMS}
      activeHref={activeHref}
      baseColor="var(--fg)"
      pillColor="var(--bg-surface)"
      hoveredPillTextColor="var(--bg)"
      pillTextColor="var(--fg)"
      initialLoadAnimation={true}
    />
  );
}
