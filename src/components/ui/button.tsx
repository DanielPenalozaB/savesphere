import Link from 'next/link';
import { ButtonHTMLAttributes, DetailedHTMLProps } from 'react';
import { LoaderIcon } from '../icons/loader';

const variantStyles = {
  fill: 'bg-calypso text-white hover:bg-calypso-400 focus:bg-calypso-600 disabled:bg-neutral-300 disabled:text-neutral-500',
  outline: 'border border-calypso text-calypso hover:bg-calypso-100 dark:hover:bg-calypso-900 dark:border-calypso-900 focus:bg-calypso-200 disabled:border-calypso-300 disabled:text-calypso-300 dark:disabled:border-calypso-900 dark:disabled:text-calypso-900 disabled:hover:bg-transparent dark:disabled:hover:bg-transparent',
  shades: 'bg-light text-calypso hover:bg-calypso-100 dark:bg-dark dark:hover:bg-calypso-900 disabled:border-calypso-300 disabled:text-calypso-300 dark:disabled:border-calypso-900 dark:disabled:text-calypso-900 disabled:hover:bg-transparent dark:disabled:hover:bg-transparent',
  text: 'text-calypso hover:text-calypso-400 focus:text-calypso-600 disabled:text-calypso-300'
};

const sizeStyles = {
  xs: 'px-3 py-2 text-xs',
  sm: 'px-4 py-2 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-base',
  xl: 'px-6 py-4 text-lg'
};

export interface ButtonProps extends DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
	children: React.ReactNode;
	variant?: keyof typeof variantStyles;
	size?: keyof typeof sizeStyles;
	isLoading?: boolean;
	isDisabled?: boolean;
	leftIcon?: React.ReactNode;
	rightIcon?: React.ReactNode;
	href?: string;
}

export default function Button({
  children,
  variant = 'fill',
  size = 'md',
  isLoading = false,
  isDisabled = false,
  leftIcon,
  rightIcon,
  href,
  ...props
}: ButtonProps) {
  const className = 'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none disabled:cursor-not-allowed';

  const { type = 'button', ...restProps } = props;

  if (typeof children === 'string') {
    restProps.title = restProps.title || children.toString();
  }

  if (href) {
    return (
      <Link
        href={href}
        className={`${className} ${variantStyles[variant]} ${sizeStyles[size]} ${restProps.className}`}
        title={restProps.title}
        rel="noopener noreferrer"
      >
        {isLoading && (
          <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
        )}
        {!isLoading && leftIcon && (
          <>{leftIcon}</>
        )}
        {children}
        {!isLoading && rightIcon && (
          <>{rightIcon}</>
        )}
      </Link>
    );
  }

  return (
    <button
      type={type}
      disabled={isDisabled || isLoading}
      {...restProps}
      className={`${className} ${variantStyles[variant]} ${sizeStyles[size]} ${restProps.className}`}
    >
      {isLoading && (
        <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
      )}
      {!isLoading && leftIcon && (
        <>{leftIcon}</>
      )}
      {children}
      {!isLoading && rightIcon && (
        <>{rightIcon}</>
      )}
    </button>
  );
}