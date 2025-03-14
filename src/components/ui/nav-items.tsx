'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NavItems() {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Overview', href: '/' },
    { name: 'Calendar', href: '/calendar' },
    { name: 'Transactions', href: '/transactions' },
    { name: 'Budget', href: '/budget' }
  ];

  return (
    <ul className="flex h-auto items-center gap-0.5 rounded-2xl bg-neutral-100/50 p-1 backdrop-blur-xl">
      {menuItems.map((item) => (
        <li key={item.name}>
          <Link
            href={item.href}
            title={item.name}
            className={`block rounded-xl px-4 py-1.5 text-neutral-600 transition-all duration-100 ease-in ${ item.href === pathname ? 'bg-calypso-200 text-calypso' : 'hover:bg-calypso-200 hover:text-calypso'}`}
          >
            {item.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}