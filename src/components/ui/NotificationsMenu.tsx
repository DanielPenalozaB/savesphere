'use client';

import { BellIcon, DotsIcon } from '@/assets/svg';
import { useOutsideClick } from '@/hooks';
import React, { useState } from 'react';

export function NotificationsMenu() {
    const [open, setOpen] = useState(false);

    const notificationRef = useOutsideClick(() => {
        setOpen(false);
    });

    return (
        <div onClick={() => setOpen(!open)} className="relative">
            <button type="button" title="Notifications">
                <BellIcon className="h-6 w-6 stroke-zinc-600 stroke-1 dark:stroke-zinc-300" />
            </button>
            <div
                ref={notificationRef}
                className={`${
                    open ? 'block' : 'hidden'
                } absolute right-0 top-[calc(100%+1rem)] max-w-80 w-screen rounded-xl bg-white z-30 dark:bg-zinc-900 outline outline-1 outline-zinc-300 dark:outline-zinc-600`}
            >
                <ul className="flex flex-col gap-2 p-2">
                    <li className="flex">
                        <a
                            href=""
                            title='Payment comming soon'
                            className="flex w-full items-center gap-4 rounded-lg px-3 py-2 text-zinc-600 hover:bg-zinc-200 dark:text-zinc-400 hover:dark:bg-zinc-800"
                        >
                            <div className="h-2 w-2 rounded-full bg-savesphere" />
                            <div className="flex flex-1 flex-col gap-1">
                                <span className="font-semibold text-zinc-800 dark:text-zinc-400">
                                    Payment comming soon
                                </span>
                                <span className='text-sm text-zinc-500'>4h ago</span>
                            </div>
                            <button type='button' title='Options' className='rounded-lg p-0.5 hover:outline hover:outline-2 hover:outline-zinc-400'>
                                <DotsIcon className="h-5 w-5 dark:stroke-zinc-400" />
                            </button>
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    );
}
