'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getRoleNavItems } from '@/lib/navigation/role-nav';

type RoleNavMenuProps = {
  activeRole: string | null;
  t: (key: string) => string;
  variant: 'desktop' | 'mobile';
  onNavigate?: () => void;
};

export function RoleNavMenu({ activeRole, t, variant, onNavigate }: RoleNavMenuProps) {
  const pathname = usePathname();
  const items = getRoleNavItems(activeRole);

  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname.startsWith(`${href}/`));

  if (variant === 'desktop') {
    return (
      <nav className="pointer-events-auto hidden min-w-0 items-center justify-center gap-0.5 overflow-x-auto px-1 md:flex lg:gap-1">
        {items.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`whitespace-nowrap rounded-lg px-2 py-2 text-xs font-medium transition-all lg:px-3 lg:text-sm ${
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              }`}
            >
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {items.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.id}
            href={item.href}
            onClick={onNavigate}
            className={`rounded-lg px-4 py-3 text-left text-sm font-medium transition-all ${
              active
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
            }`}
          >
            {t(item.labelKey)}
          </Link>
        );
      })}
    </div>
  );
}
