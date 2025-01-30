'use client';

import { CheckIcon, ExclamationIcon } from '@/icons';
import { CheckboxProps } from '@/interfaces';

const sizeClasses = {
  sm: 'h-4 w-4 rounded',
  md: 'h-5 w-5 rounded',
  lg: 'h-5 w-5 rounded',
  xl: 'h-6 w-6 rounded',
  '2xl': 'h-6 w-6 rounded',
  '3xl': 'h-6 w-6 rounded'
};

const labelSizeClasses = {
  sm: 'text-sm',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-base',
  '2xl': 'text-lg',
  '3xl': 'text-lg'
};

export default function Checkbox(props: CheckboxProps) {
  const {
    id,
    name,
    className,
    label,
    message,
    isInvalid,
    checkboxPosition = 'left',
    checked,
    size = 'md',
    ...rest
  } = props;

  const sizeClass = sizeClasses[size];
  const labelSizeClass = labelSizeClasses[size];

  const checkboxElement = (
    <div className="relative flex items-center">
      <input
        type="checkbox"
        name={name}
        id={id}
        checked={checked}
        className={`peer relative cursor-pointer appearance-none border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 transition-all duration-200 checked:border-blue-500 checked:bg-blue-500 checked:dark:bg-blue-500 checked checked:dark:border-blue-500:hover:bg-blue-500 hover:border-blue-500 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50 ${sizeClass} ${isInvalid ? 'border-red-500' : 'border-neutral-300'}${className ? ` ${className}` : ''}`}
        {...rest}
      />
      <CheckIcon className='pointer-events-none absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 stroke-2 text-white opacity-0 transition-opacity duration-200 peer-checked:opacity-100 peer-hover:text-blue-500 peer-hover:opacity-100 peer-checked:peer-hover:text-white dark:text-neutral-200 peer-hover:dark:text-white' />
    </div>
  );

  return (
    <dl>
      <dd>
        <div className="group flex items-center gap-2">
          {checkboxPosition === 'left' && checkboxElement}
          {label && (
            <label
              htmlFor={id}
              className={`cursor-pointer select-none text-neutral-700 dark:text-neutral-400 transition-colors duration-200 group-hover:text-neutral-900 group-hover:dark:text-neutral-300 ${labelSizeClass}`}
            >
              {label}
            </label>
          )}
          {checkboxPosition === 'right' && checkboxElement}
        </div>
        {message && (
          <p className={`flex items-center gap-1 mt-1.5 text-xs ${isInvalid ? 'text-red-500' : 'text-neutral-500'}`}>
            {isInvalid && <ExclamationIcon className="h-4 w-4" />}
            {message}
          </p>
        )}
      </dd>
    </dl>
  );
}