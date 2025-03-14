'use client';

import { useDropdown } from '@/hooks/useDropdown';
import { BellIcon, CheckIcon } from '../icons';
import Link from 'next/link';

export default function NavNotifications() {
  const notifications = [
    { id: 1, message: 'Your profile has been updated', isRead: false, time: 'Just now' },
    { id: 2, message: 'New feature available', isRead: false, time: '2 hours ago' },
    { id: 3, message: 'Welcome to the app!', isRead: true, time: '2 days ago' }
  ];

  const {
    isOpen,
    dropdownRef,
    toggleDropdown
  } = useDropdown<HTMLDivElement>({
    enableEscapeKey: true,
    onOpen: () => console.log('Dropdown opened')
  });

  return (
    <div className="relative">
      <button
        type="button"
        title="Notifications"
        onClick={toggleDropdown}
        className={`block overflow-hidden rounded-2xl p-2 text-neutral-600 ring-1 ring-black ring-opacity-5 transition-all duration-100 ease-in ${isOpen ? 'bg-calypso-100/50' : 'bg-transparent hover:bg-neutral-100/50'}`}
      >
        <BellIcon className="h-6 w-6" />
      </button>
      {isOpen && (
        <div
          ref={dropdownRef}
          className="dropdown absolute -right-12 top-[calc(100%+0.75rem)] z-10 flex w-72 origin-top-right flex-col gap-1 rounded-2xl bg-white p-2 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
        >
          {notifications.length > 0 ? (
            <div className="flex max-h-96 flex-col gap-0.5 overflow-y-auto">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`relative group px-4 py-3 hover:bg-gray-50 rounded-xl ${notification.isRead ? 'opacity-50' : 'font-medium'}`}
                >
                  <div className="flex justify-between">
                    <p className="text-sm">{notification.message}</p>
                    {!notification.isRead && (
                      <span className="mt-1 h-2 max-h-2 min-h-2 w-2 min-w-2 max-w-2 self-start rounded-full bg-blue-500" />
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">{notification.time}</p>
                  {!notification.isRead && (
                    <button type="button" title='Mark as read' className='absolute right-2 top-2 hidden rounded-lg bg-calypso-100 p-1 text-calypso-400 group-hover:block'>
                      <CheckIcon className='h-4 w-4' />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500">No notifications</div>
          )}
          <Link
            href={'/notifications'}
            className="w-full px-4 pb-1 text-right text-sm font-medium text-calypso-500 transition-all duration-100 ease-in hover:text-calypso-400"
          >
            See all notifications
          </Link>
        </div>
      )}
    </div>
  );
}