import { useDropdown } from '@/hooks/useDropdown';
import React from 'react';

export interface DropdownOption {
  label: string;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

interface DropdownMenuProps {
  children: React.ReactNode;
  options: DropdownOption[];
  position?:
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right'
    | 'right-top'
    | 'right-center'
    | 'right-bottom'
    | 'left-top'
    | 'left-center'
    | 'left-bottom'
    | 'top-left'
    | 'top-center'
    | 'top-right';
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  children,
  options,
  position = 'bottom-left'
}) => {
  const { isOpen, dropdownRef, toggleDropdown, closeDropdown } = useDropdown({
    enableEscapeKey: true,
    animation: {
      open: {
        duration: 0.3,
        ease: 'elastic.out(1, 0.75)',
        opacity: 1,
        y: 0
      },
      close: {
        duration: 0.2,
        ease: 'power2.in',
        opacity: 0,
        y: -10
      }
    }
  });

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-left':
        return 'top-full left-0 mt-2';
      case 'bottom-center':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
      case 'bottom-right':
        return 'top-full right-0 mt-2';
      case 'right-top':
        return 'left-full top-0 ml-2';
      case 'right-center':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-2';
      case 'right-bottom':
        return 'left-full bottom-0 ml-2';
      case 'left-top':
        return 'right-full top-0 mr-2';
      case 'left-center':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-2';
      case 'left-bottom':
        return 'right-full bottom-0 mr-2';
      case 'top-left':
        return 'bottom-full left-0 mb-2';
      case 'top-center':
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
      case 'top-right':
        return 'bottom-full right-0 mb-2';
      default:
        return 'top-full left-0 mt-2'; // Default to bottom-left
    }
  };

  return (
    <div className="relative">
      <div onClick={toggleDropdown} className="cursor-pointer">
        {children}
      </div>
      {isOpen && (
        <div
          ref={dropdownRef}
          className={`absolute z-50 w-48 ${getPositionClasses()}`}
        >
          <div className="flex max-h-60 w-full flex-col overflow-auto rounded-lg border border-neutral-200 bg-white p-1 text-sm">
            {options.map((option, index) => (
              <button
                key={index}
                onClick={() => {
                  option.onClick();
                  closeDropdown();
                }}
                title={option.label}
                disabled={option.disabled}
                className={`flex w-full items-center justify-between px-2 py-1.5 cursor-pointer hover:bg-neutral-100 rounded-md text-sm text-gray-700 ${
                  option.disabled
                    ? 'cursor-not-allowed opacity-50'
                    : 'hover:bg-gray-100 hover:text-gray-900'
                } ${option.className}`}
              >
                {(option.icon && option.iconPosition === 'left') && (<span className="mr-2">{option.icon}</span>)}
                {option.label}
                {(option.icon && (option.iconPosition === 'right' || !option.iconPosition)) && (<span className="mr-2">{option.icon}</span>)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};