'use client';

import {
    ArrowBarLeftIcon,
    ChevronDownIcon,
    UserSquareRoundedIcon,
} from '@/assets/svg';
import { useOutsideClick } from '@/hooks';
import React, { useState } from 'react';

export function UserMenu() {
    const [open, setOpen] = useState(false);

    const menuRef = useOutsideClick(() => {
        setOpen(false);
    });

    return (
        <div className="relative flex gap-1">
            <div
                onClick={() => setOpen(!open)}
                title="Menu"
                className="before:content-[' '] relative h-8 w-8 cursor-pointer rounded-full bg-savesphere before:absolute before:right-0 before:top-0 before:h-2 before:w-2 before:rounded-full before:bg-savesphere before:ring-4 before:ring-white before:dark:bg-savesphere-200 before:dark:ring-zinc-900"
            ></div>
            <button onClick={() => setOpen(!open)} type="button" title="Menu">
                <ChevronDownIcon className="h-5 w-5 stroke-zinc-600 stroke-1 dark:stroke-zinc-300" />
            </button>
            <div
                ref={menuRef}
                className={`${
                    open ? 'block' : 'hidden'
                } absolute right-0 top-[calc(100%+1rem)] rounded-xl bg-white dark:bg-zinc-900 outline outline-1 outline-zinc-300 dark:outline-zinc-600 z-30`}
            >
                <ul className="flex flex-col gap-2 p-2">
                    <li className="flex">
                        <a
                            href=""
                            className="flex w-full items-center gap-4 rounded-lg px-3 py-2 text-zinc-600 hover:bg-zinc-200 dark:text-zinc-400 hover:dark:bg-zinc-800"
                        >
                            <UserSquareRoundedIcon className="h-5 w-5 stroke-zinc-600 dark:stroke-zinc-300" />
                            Account
                        </a>
                    </li>
                    <li className="flex">
                        <a
                            href=""
                            className="flex w-full items-center gap-4 rounded-lg px-3 py-2 text-zinc-600 hover:bg-zinc-200 dark:text-zinc-400 hover:dark:bg-zinc-800"
                        >
                            <ArrowBarLeftIcon className="h-5 w-5 stroke-zinc-600 dark:stroke-zinc-300" />
                            Logout
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    );
}
