'is client';

import { ExclamationIcon } from '@/icons';
import { InputHTMLAttributes, LegacyRef } from 'react';

// Input component interface
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  type?: InputTypeAttribute;
  label?: string;
  message?: string;
  isInvalid?: boolean;
}

type InputTypeAttribute =
  | 'text'
  | 'textarea'
  | 'number'
  | 'currency'
  | 'email'
  | 'select'
  | 'date'
  | 'password'
  | 'tel'
  | 'location'
  | 'url';

// Main Input component
export default function Input(props: InputProps) {
  const { id, name, type, placeholder, className, children, label, message, isInvalid, ...rest } = props;

  return (
    <dl>
      {label && (
        <dt className="mb-1.5">
          {label}
        </dt>
      )}
      <dd>
        <input
          type={type}
          name={name}
          id={id}
          placeholder={placeholder}
          className={`focus w-[28rem] max-w-full rounded-md border bg-white px-3 py-2 text-sm text-neutral-700 placeholder:text-neutral-500 focus:border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-neutral-100 disabled:text-neutral-500 ${isInvalid ? 'border-red-500' : 'border-neutral-300 '}${className ? ` ${className}` : ''}`}
          {...rest}
        />
        {message && (
          <p className={`flex gap-1 items-center mt-1.5 text-xs ${isInvalid ? 'text-red-500' : 'text-neutral-500'}`}>
            {isInvalid && (<ExclamationIcon className='h-4 w-4' />)}
            {message}
          </p>
        )}
      </dd>
    </dl>
  );
}