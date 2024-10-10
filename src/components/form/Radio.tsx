'use client';

import { ReactNode } from 'react';

export interface RadioInputProps {
  children: ReactNode;
  id: string;
  name: string;
  value: string;
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function RadioInput({
  children,
  id,
  name,
  value,
  checked,
  onChange
}: RadioInputProps) {
  return (
    <div className="flex items-center">
      <input
        id={id}
        name={name}
        title={id}
        type="radio"
        className="peer relative h-4 w-4 cursor-pointer appearance-none rounded-full outline-none before:block before:h-4 before:w-4 before:rounded-full before:bg-white before:duration-150 before:ease-out after:absolute after:left-1/2 after:top-1/2 after:h-1.5 after:w-1.5 after:-translate-x-1/2 after:-translate-y-1/2 after:rounded-full after:bg-white before:checked:bg-blue-500 focus:outline focus:outline-offset-2 focus:outline-blue-500"
        checked={checked}
        onChange={onChange}
        value={value}
      />
      <label
        htmlFor={id}
        className="ml-3 block cursor-pointer text-sm font-medium leading-6 text-neutral-800 peer-focus:text-neutral-600 dark:text-neutral-300 dark:peer-focus:text-white"
      >
        {children}
      </label>
    </div>
  );
}