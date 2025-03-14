'use client';

import { useDropdown } from '@/hooks/useDropdown';
import { thumbs } from '@dicebear/collection';
import { createAvatar } from '@dicebear/core';
import { useMemo } from 'react';
import { ArrowRightStartOnRectangleIcon, UserIcon } from '../icons';

export default function NavUser() {
  const userMenuItems = [
    { label: 'Profile', onClick: handleProfileClick, icon: <UserIcon className="h-4 w-4" /> },
    { label: 'Sign out', onClick: handleSignOut, icon: <ArrowRightStartOnRectangleIcon className="h-4 w-4" /> }
  ];

  const {
    isOpen,
    dropdownRef,
    toggleDropdown
  } = useDropdown<HTMLDivElement>({
    enableEscapeKey: true
  });

  const avatar = useMemo(() => createAvatar(thumbs, {
    size: 40,
    seed: 'Adrian'
  }).toDataUri(), []);

  function handleSignOut() {
    // Handle sign out logic here
    console.log('Signing out...');
  }

  function handleProfileClick() {
    // Handle profile navigation here
    console.log('Navigating to profile...');
  }

  return (
    <div className="relative">
      <button
        type="button"
        title="User"
        onClick={toggleDropdown}
        className="block overflow-hidden rounded-2xl text-neutral-600 transition-all duration-100 ease-in hover:bg-neutral-100"
      >
        <img src={avatar} alt="User" className="h-10 w-10" draggable="false" />
      </button>
      {isOpen && (
        <div
          ref={dropdownRef}
          className="dropdown absolute right-0 top-[calc(100%+0.75rem)] z-10 flex w-48 origin-top-right flex-col gap-1 rounded-2xl bg-white p-2 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
        >
          <div className="px-3 py-2">
            <p className="text-sm font-medium">Adrian</p>
            <p className="truncate text-sm text-gray-500">adrian@example.com</p>
          </div>
          {userMenuItems.map((item) => (
            <button
              key={item.label}
              onClick={item.onClick}
              title={item.label}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-neutral-600 hover:bg-gray-100 hover:text-neutral-800"
            >
              {item.icon}
              {item.label}
            </button>
          ))}
          <div className="mt-1 flex items-center px-3 py-2 text-xs text-gray-500">
            SaveSphere v1.0.3
          </div>
        </div>
      )}
    </div>
  );
}