'use client';

import { useState } from 'react';
import { ChevronDownIcon, WalletIcon } from '@/icons';
import { SidebarOptionProps } from '@/interfaces';

interface SidebarProps {
  options: SidebarOptionProps[];
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
}

export default function Sidebar({
  options,
  isOpen: defaultIsOpen = true,
  onToggle
}: SidebarProps) {
  const [ isOpen, setIsOpen ] = useState(defaultIsOpen);
  const [ expandedGroups, setExpandedGroups ] = useState<Record<string, boolean>>({});

  const toggleSidebar = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    onToggle?.(newState);
  };

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  return (
    <aside className="group peer hidden md:block">
      <div className={`inset-y-0 left-0 z-10 hidden h-svh border-r border-neutral-800 transition-all duration-300 ease-in-out md:block ${isOpen ? 'w-64' : 'w-16'}`}>
        <div className="relative flex h-full w-full flex-col bg-light dark:bg-neutral-900">
          <div className="flex flex-col gap-2 p-2">
            <div className={'flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left outline-none transition-all duration-300'}>
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg bg-blue-500">
                <WalletIcon className="size-4" />
              </div>
              <div className={`grid flex-1 text-left text-sm leading-tight transition-all duration-300 ${isOpen ? 'opacity-100' : 'w-0 opacity-0'}`}>
                <span className="truncate font-semibold">SaveSphere</span>
              </div>
            </div>
          </div>
          <div className='flex flex-1 flex-col gap-1 overflow-auto'>
            {options.length > 0 && options.map((option, index) => (
              <div key={index} className={`relative flex w-full flex-col ${isOpen ? 'px-2' : 'px-4'}`}>
                {option.title && (
                  <div className={`flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-neutral-500 outline-none transition-all duration-300 ${isOpen ? 'opacity-100' : 'w-0 opacity-0'}`}>
                    {option.title}
                  </div>
                )}
                {option.childrenOptions && option.childrenOptions.length > 0 ? (
                  <ul className='flex w-full flex-col gap-1'>
                    <li className="group/menu-item group/collapsible relative">
                      <button
                        onClick={() => toggleGroup(`group-${index}`)}
                        className={`peer/menu-button ring-sidebar-ring flex h-8 w-full items-center overflow-hidden rounded-md p-2 text-left text-sm font-medium text-neutral-200 outline-none transition-all duration-300 hover:bg-neutral-800 hover:text-neutral-50 focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 ${isOpen ? 'gap-2' : 'justify-center gap-0 w-fit'}`}
                      >
                        {option.icon && option.icon}
                        <span className={`transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>
                          {option.label}
                        </span>
                        {isOpen && (
                          <ChevronDownIcon className={`ml-auto size-2.5 transition-transform duration-300 ${expandedGroups[`group-${index}`] ? 'rotate-180' : ''}`} />
                        )}
                      </button>
                      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedGroups[`group-${index}`] ? 'max-h-96' : 'max-h-0'} ${isOpen ? '' : 'hidden'}`}>
                        {option.childrenOptions.map((childrenOption, idx) => (
                          <ul key={idx} className="ml-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-neutral-800 py-0.5 pl-2.5">
                            <li>
                              <a
                                href={childrenOption.href}
                                className="ring-sidebar-ring flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sm font-medium text-neutral-200 outline-none hover:bg-neutral-800 hover:text-neutral-50 focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50"
                              >
                                <span>{childrenOption.label}</span>
                              </a>
                            </li>
                          </ul>
                        ))}
                      </div>
                    </li>
                  </ul>
                ) : (
                  <a
                    href={option.href}
                    className='ring-sidebar-ring flex h-8 w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm font-medium text-neutral-200 outline-none transition-all duration-300 hover:bg-neutral-800 hover:text-neutral-50 focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50'
                  >
                    {option.icon && option.icon}
                    <span className={`transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>
                      {option.label}
                    </span>
                  </a>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={toggleSidebar}
            title="Toggle Sidebar"
            className="absolute inset-y-0 left-[calc(100%_-_0.5rem)] z-20 w-4 cursor-w-resize outline-none transition-all ease-linear after:absolute after:inset-x-1/2 after:inset-y-0 after:w-0.5 after:transition-all after:duration-200 after:ease-linear after:content-[''] after:hover:bg-neutral-700 focus:outline-none after:focus:bg-neutral-700"
          />
        </div>
      </div>
    </aside>
  );
}