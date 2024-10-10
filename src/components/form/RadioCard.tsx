'use client';

import { CheckCircleFilledIcon } from '@/icons';
import { ChangeEvent, ReactNode, useRef } from 'react';

const ICON_POSITION = {
  'top-left': 'top-4 left-4',
  'top-right': 'top-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'bottom-right': 'bottom-4 right-4'
};

export interface RadioCardInputProps {
  id: string;
  name: string;
  value: string;
  className?: string;
  checked?: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  children: ReactNode;
  iconPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export default function RadioCard({
  id,
  name,
  value,
  className,
  checked,
  onChange,
  children,
  iconPosition = 'top-right'
}: RadioCardInputProps) {
  const radioRef = useRef<HTMLInputElement>(null);

  let radioCardClassName = 'relative flex cursor-pointer rounded-lg border-2 border-neutral-300 bg-white p-4 text-sm text-neutral-800 duration-150 ease-out focus:outline focus:outline-1 focus:outline-blue-500 has-[:checked]:border-blue-500 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-300';

  if (className) {
    radioCardClassName += ` ${className}`;
  }

  return (
    <label htmlFor={id} className={radioCardClassName}>
      <input
        ref={radioRef}
        id={id}
        name={name}
        title={id}
        type="radio"
        className="peer appearance-none"
        checked={checked}
        onChange={onChange}
        value={value}
      />
      <CheckCircleFilledIcon className={`absolute z-10 hidden h-4 w-4 text-blue-400 duration-150 ease-out peer-checked:block peer-checked:duration-150 ${ICON_POSITION[iconPosition]}`} />
      {children}
    </label>
  );
}