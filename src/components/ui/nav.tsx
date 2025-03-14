import Link from 'next/link';
import NavUser from './nav-user';
import SavesphereIcon from '../icons/savesphere';
import { Cog6ToothIcon } from '../icons';
import NavNotifications from './nav-notifications';
import NavItems from './nav-items';

export default function Nav() {
  return (
    <nav className="flex items-center justify-between gap-4 p-6">
      <Link href={'/'} className="flex items-center gap-2 text-neutral-800">
        <div className="rounded-2xl bg-neutral-200 p-2">
          <SavesphereIcon className="h-6 w-6" />
        </div>
        <h1 className="relative bottom-0.5 font-playfair text-2xl font-bold leading-7">SaveSphere</h1>
      </Link>
      <NavItems />
      <ul className="flex h-auto items-center gap-2">
        <li>
          <button
            type="button"
            title='Settings'
            className="block overflow-hidden rounded-2xl p-2 text-neutral-600 ring-1 ring-black ring-opacity-5 transition-all duration-100 ease-in hover:bg-neutral-100/50"
          >
            <Cog6ToothIcon className="h-6 w-6" />
          </button>
        </li>
        <li>
          <NavNotifications />
        </li>
        <li>
          <NavUser />
        </li>
      </ul>
    </nav>
  );
}
