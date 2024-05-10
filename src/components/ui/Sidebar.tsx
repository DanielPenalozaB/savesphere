'use client';

import { BookmarkSquareIcon, ChevronDownIcon } from '@/assets/svg';
import { ROUTES } from '@/constants';
import Link from 'next/link';
import React, { useState } from 'react';
import Badge from './Badge';

export default function Sidebar() {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <aside
            role="navigation"
            aria-label="Sidebar"
            aria-describedby="A navigation element"
            className="h-screen"
        >
            <nav className="flex rounded-lg border-neutral-400 bg-white">
                <div className="relative flex max-w-[4.5rem] flex-col justify-between border-r border-neutral-400 px-4 py-6">
                    <button
                        role="button"
                        aria-label={isExpanded ? 'Collapse' : 'Expand'}
                        type="button"
                        title={isExpanded ? 'Collapse' : 'Expand'}
                        className="absolute -right-3 top-8 flex h-6 w-6 items-center justify-center rounded-full border border-neutral-300 bg-white outline-none duration-300 ease-out hover:bg-neutral-200 focus:outline-1 focus:outline-offset-1 focus:outline-teal-500"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        <ChevronDownIcon
                            className={`h-4 w-4 text-neutral-500 duration-300 ease-out stroke-3 ${
                                isExpanded ? '-rotate-90' : 'rotate-90'
                            }`}
                        />
                    </button>
                    <div className="flex flex-col gap-6">
                        <Link
                            href={ROUTES.HOME}
                            aria-label="Home"
                            title="Home"
                            className="bg- rounded-lg bg-teal-500 p-2 text-white hover:bg-teal-400"
                        >
                            <BookmarkSquareIcon className="h-6 w-6" />
                        </Link>
                        <div className="flex flex-col">
                            <CollapsedItem />
                        </div>
                    </div>
                </div>
            </nav>
        </aside>
    );
}

function CollapsedItem() {
    return (
        <Link
            href={ROUTES.HOME}
            aria-label="Home"
            title="Home"
            className="flex min-h-[2.5rem] items-center justify-between gap-2 rounded-lg bg-teal-400 p-2 hover:bg-teal-300"
        >
            <div className="flex flex-1 items-center gap-2 text-white">
                <BookmarkSquareIcon className="h-6 max-h-[1.5rem] min-h-[1.5rem] w-6 min-w-[1.5rem] max-w-[1.5rem] stroke-2" />
            </div>
        </Link>
    );
}

function ExpandedItem() {
    return (
        <Link
            href={ROUTES.HOME}
            aria-label="Home"
            title="Home"
            className="flex min-h-[2.5rem] items-center justify-between gap-2 rounded-lg px-3 py-2"
        >
            <div className="flex flex-1 items-center gap-2 text-neutral-800">
                <span className="h-2 max-h-[0.5rem] min-h-[0.5rem] w-2 min-w-[0.5rem] max-w-[0.5rem] rounded-full bg-teal-500" />
                <BookmarkSquareIcon className="h-6 max-h-[1.5rem] min-h-[1.5rem] w-6 min-w-[1.5rem] max-w-[1.5rem] text-neutral-400" />
                <span className="w-full truncate text-base font-medium text-inherit">
                    Item
                </span>
            </div>
            <div className="flex items-center gap-2">
                <Badge
                    label="10"
                    type="Pill"
                    size="sm"
                    showStartIcon
                    icon={<ChevronDownIcon className="h-4 w-4" />}
                />
            </div>
        </Link>
    );
}
