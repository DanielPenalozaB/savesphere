import { BadgeProps } from '@/interfaces';

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs font-medium rounded-sm max-h-[19px]',
  md: 'px-2.5 py-1 text-xs font-medium rounded-md max-h-[23px]',
  lg: 'px-3 py-1.5 text-sm font-medium rounded-md max-h-[29px]',
  xl: 'px-3.5 py-2 text-sm font-medium rounded-lg max-h-[33px]',
  '2xl': 'px-4 py-2.5 text-base font-medium rounded-xl max-h-[39px]',
  '3xl': 'px-4 py-2.5 text-lg font-medium rounded-xl max-h-[42px]'
};

const variantClasses = {
  outline: 'outline outline-1 outline-blue-500 text-blue-500',
  filled: 'bg-blue-200 text-blue-500',
  shades: 'bg-blue-200 outline outline-1 outline-blue-500 text-blue-500',
  text: 'text-blue-500'
};

export default function Badge({
  type = 'pill',
  size = 'md',
  variant = 'filled',
  showDot = false,
  icon,
  iconPosition = 'left',
  children
}: BadgeProps) {
  const sizeClass = sizeClasses[size];
  const variantClass = variantClasses[variant];

  return (
    <div className={`flex items-center justify-center gap-1.5 ${type === 'pill' ? '!rounded-full' : ''} ${sizeClass} ${variantClass}`}>
      {iconPosition === 'left' && icon}
      {showDot && <span className="h-1.5 max-h-1.5 min-h-1.5 w-1.5 min-w-1.5 max-w-1.5 rounded-full bg-blue-500" />}
      {children}
      {iconPosition === 'right' && icon}
    </div>
  );
}