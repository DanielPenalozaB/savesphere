'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

export default function ThemeSwitch() {
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            type="button"
            className={`flex h-7 max-h-7 min-h-7 w-12 items-center rounded-full border border-zinc-400 bg-white p-1 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-savesphere dark:border-zinc-500 dark:bg-zinc-900`}
        >
            <div
                className={`${
                    theme === 'light' ? 'ml-[1.15rem]' : 'm-0'
                } duration-300 ease-out rounded-full bg-savesphere p-0.5 text-zinc-900`}
            >
                {theme === 'light' ? (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 fill-inherit stroke-zinc-900 stroke-2"
                        viewBox="0 0 24 24"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path
                            d="M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0"
                            className='stroke-none'
                        />
                        <path d="M3 12h1m8 -9v1m8 8h1m-9 8v1m-6.4 -15.4l.7 .7m12.1 -.7l-.7 .7m0 11.4l.7 .7m-12.1 -.7l-.7 .7" />
                    </svg>
                ) : (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 fill-inherit stroke-2"
                        viewBox="0 0 24 24"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z" />
                    </svg>
                )}
            </div>
        </button>
    );
}
