import { BadgeInterface } from '@/interfaces';
import React from 'react';

export default function Badge({
    type = 'Badge',
    size = 'md',
    style = 'solid',
    showDot = false,
    className = '', label ='',
    showStartIcon = false,
    showEndIcon = false,
    icon = <></>,
}: BadgeInterface) {
    switch (size) {
        case 'sm': {
            return (
                <div
                    className={`flex gap-1.5 px-2 py-0.5 text-xs border items-center justify-center border-neutral-300 text-neutral-500 ${
                        type === 'Badge' ? 'rounded-md' : 'rounded-full'
                    } ${className}`}
                >
                    {showStartIcon && icon}
                    {showDot && (
                        <span className="h-1.5 max-h-[0.375rem] min-h-[0.375rem] w-1.5 min-w-[0.375rem] max-w-[0.375rem] rounded-full bg-neutral-400" />
                    )}
                    {label}
                    {showEndIcon && icon}
                </div>
            );
        }

        case 'md':
        default: {
            return (
                <div
                    className={`flex gap-1.5 px-2.5 py-1 border text-xs items-center justify-center border-neutral-300 text-neutral-500 ${
                        type === 'Badge' ? 'rounded-md' : 'rounded-full'
                    } ${className}`}
                >
                    {showStartIcon && icon}
                    {showDot && (
                        <span className="h-1.5 max-h-[0.375rem] min-h-[0.375rem] w-1.5 min-w-[0.375rem] max-w-[0.375rem] rounded-full bg-neutral-400" />
                    )}
                    {label}
                    {showEndIcon && icon}
                </div>
            );
        }

        case 'lg':{
            return (
                <div
                    className={`flex gap-1.5 px-3 py-1.5 border text-sm items-center justify-center border-neutral-300 text-neutral-500 ${
                        type === 'Badge' ? 'rounded-md' : 'rounded-full'
                    } ${className}`}
                >
                    {showStartIcon && icon}
                    {showDot && (
                        <span className="h-1.5 max-h-[0.375rem] min-h-[0.375rem] w-1.5 min-w-[0.375rem] max-w-[0.375rem] rounded-full bg-neutral-400" />
                    )}
                    {label}
                    {showEndIcon && icon}
                </div>
            );
        }

        case 'xl':{
            return (
                <div
                    className={`flex gap-1.5 px-3.5 py-2 border text-sm items-center justify-center border-neutral-300 text-neutral-500 ${
                        type === 'Badge' ? 'rounded-lg' : 'rounded-full'
                    } ${className}`}
                >
                    {showStartIcon && icon}
                    {showDot && (
                        <span className="h-1.5 max-h-[0.375rem] min-h-[0.375rem] w-1.5 min-w-[0.375rem] max-w-[0.375rem] rounded-full bg-neutral-400" />
                    )}
                    {label}
                    {showEndIcon && icon}
                </div>
            );
        }

        case '2xl':{
            return (
                <div
                    className={`flex gap-1.5 px-4 py-2.5 border text-base items-center justify-center border-neutral-300 text-neutral-500 ${
                        type === 'Badge' ? 'rounded-xl' : 'rounded-full'
                    } ${className}`}
                >
                    {showStartIcon && icon}
                    {showDot && (
                        <span className="h-1.5 max-h-[0.375rem] min-h-[0.375rem] w-1.5 min-w-[0.375rem] max-w-[0.375rem] rounded-full bg-neutral-400" />
                    )}
                    {label}
                    {showEndIcon && icon}
                </div>
            );
        }

        case '3xl':{
            return (
                <div
                    className={`flex gap-1.5 px-4 py-2.5 border text-lg items-center justify-center border-neutral-300 text-neutral-500 ${
                        type === 'Badge' ? 'rounded-xl' : 'rounded-full'
                    } ${className}`}
                >
                    {showStartIcon && icon}
                    {showDot && (
                        <span className="h-1.5 max-h-[0.375rem] min-h-[0.375rem] w-1.5 min-w-[0.375rem] max-w-[0.375rem] rounded-full bg-neutral-400" />
                    )}
                    {label}
                    {showEndIcon && icon}
                </div>
            );
        }
    }
}
