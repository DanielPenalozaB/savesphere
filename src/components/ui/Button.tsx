import { LoadingCircle } from '@/icons';
import React, { ButtonHTMLAttributes } from 'react';

const sizeClasses = {
  xs: 'px-3 py-2 text-xs max-h-[32px]',
  xsIcon: 'p-2 text-xs max-h-[32px]',
  sm: 'px-4 py-2 text-sm max-h-[36px]',
  smIcon: 'p-2 text-sm max-h-[36px]',
  md: 'px-4 py-2 text-base max-h-[40px]',
  mdIcon: 'p-2 text-base max-h-[40px]',
  lg: 'px-6 py-3 text-base max-h-[48px]',
  lgIcon: 'p-3 text-base max-h-[48px]',
  xl: 'px-6 py-4 text-lg max-h-[60px]',
  xlIcon: 'p-4 text-lg max-h-[60px]'
};

const variantClasses = {
  filled: 'text-white bg-blue-500 hover:bg-blue-400 focus:bg-blue-600 disabled:bg-neutral-300 border border-transparent disabled:dark:bg-neutral-600 disabled:dark:text-neutral-500',
  outline: 'border border-blue-500 text-blue-500 hover:bg-blue-100 focus:bg-blue-100 disabled:border-blue-300 disabled:text-blue-300',
  shades: 'text-blue-500 border border-transparent hover:bg-blue-100 focus:bg-blue-100 disabled:text-blue-300 disabled:border-blue-300',
  text: 'text-blue-500 hover:text-blue-400 focus:text-blue-600 disabled:text-blue-300'
};

const iconClasses = {
  xs: 'h-4 w-4',
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-5 w-5',
  xl: 'h-6 w-6'
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
	variant?: 'filled' | 'outline' | 'shades' | 'text';
	icon?: React.ElementType;
	iconPosition?: 'start' | 'end' | 'only';
  iconClassName?: string;
	isLoading?: boolean;
	children?: string | number;
}

export default function Button(props: ButtonProps) {
  const { type = 'button',  size = 'md', variant = 'filled', className, icon: Icon, iconClassName, iconPosition = 'end', isLoading, children, ...rest } = props;

  const sizeClass = sizeClasses[size];
  const variantClass = variantClasses[variant];
  const iconClass = iconClasses[size];

  return (
    <button
      type={type}
      className={`group relative flex w-full items-center justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white transition duration-150 ease-in-out focus:outline-none focus:ring-2 min-h-[40px] focus:ring-offset-2 ${sizeClass ?? ''} ${variantClass ?? ''} ${className ?? ''}`}
      { ...rest }
    >
      {isLoading ? (
        <>
          {children}
          <LoadingCircle className='animate-spin' />
        </>
      ) : (
        <>
          {(Icon && iconPosition === 'start') && <Icon className={`${iconClass} ${iconClassName}`} />}
          {children}
          {(Icon && (iconPosition === 'end' || iconPosition === 'only')) && <Icon className={`${iconClass} ${iconClassName}`} />}
        </>
      )}
    </button>
  );
}