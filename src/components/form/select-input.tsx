import { useDropdown } from '@/hooks/useDropdown';
import React, { useState, useEffect, useRef, useMemo, KeyboardEvent, ChangeEvent } from 'react';
import { CheckIcon } from '../icons';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectInputProps {
  id?: string;
  name?: string;
  options: SelectOption[];
  value?: string | string[];
  defaultValue?: string | string[];
  placeholder?: string;
  multiple?: boolean;
  searchable?: boolean;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  onChange?: (value: string | string[], event?: React.SyntheticEvent) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

export default function SelectInput({
  id,
  name,
  options,
  value,
  defaultValue,
  placeholder = 'Select an option',
  multiple = false,
  searchable = false,
  disabled = false,
  required = false,
  className = '',
  onChange,
  onBlur
}: SelectInputProps) {
  // Track selected values (either string or array of strings)
  const [ selectedValues, setSelectedValues ] = useState<string | string[]>(multiple ? (value || defaultValue || []) : (value || defaultValue || ''));

  // Track search input
  const [ searchTerm, setSearchTerm ] = useState('');

  // Add a flag to track if we're searching
  const isSearchingRef = useRef(false);

  // Hidden input for form submission
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  // Input ref for the search/display field
  const inputRef = useRef<HTMLInputElement>(null);

  // Setup dropdown with animation
  const { isOpen, dropdownRef, toggleDropdown, openDropdown, closeDropdown } = useDropdown({
    animation: {
      open: {
        duration: 0.2,
        ease: 'power2.out',
        opacity: 1,
        y: 0
      },
      close: {
        duration: 0.1,
        ease: 'power2.in',
        opacity: 0,
        y: -5
      }
    }
  });

  // Filter options based on search term
  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;

    return options.filter((option) => option.label.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [ options, searchTerm ]);

  // Update display text based on selected values
  const displayText = useMemo(() => {
    if (multiple && Array.isArray(selectedValues)) {
      if (selectedValues.length === 0) return '';

      // Map selected values to their labels
      const selectedLabels = selectedValues.map((val) => {
        const option = options.find((opt) => opt.value === val);
        return option?.label || val;
      });

      return selectedLabels.join(', ');
    }

    // For single selection
    const selectedOption = options.find((opt) => opt.value === selectedValues);
    return selectedOption?.label || '';
  }, [ selectedValues, options, multiple ]);

  // Handle selection of an option
  const handleSelect = (option: SelectOption) => {
    let newValue: string | string[];

    if (multiple && Array.isArray(selectedValues)) {
      // Toggle selection for multiple select
      if (selectedValues.includes(option.value)) {
        newValue = selectedValues.filter((val) => val !== option.value);
      } else {
        newValue = [ ...selectedValues, option.value ];
      }
    } else {
      // Set value for single select
      newValue = option.value;
      // Close dropdown for single select after selection
      closeDropdown();
    }

    // Update state
    setSelectedValues(newValue);

    // Update hidden input value
    if (hiddenInputRef.current) {
      if (Array.isArray(newValue)) {
        hiddenInputRef.current.value = newValue.join(',');
      } else {
        hiddenInputRef.current.value = newValue;
      }
    }

    // Call onChange callback if provided
    if (onChange) {
      const syntheticEvent = {
        target: {
          name,
          value: newValue
        }
      } as React.ChangeEvent<HTMLInputElement>;

      onChange(newValue, syntheticEvent);
    }

    // Clear search term after selection
    if (searchable) {
      setSearchTerm('');
    }
  };

  // Handle search input change
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    isSearchingRef.current = true;
    setSearchTerm(e.target.value);

    // Open dropdown when typing if it's not already open
    if (!isOpen) {
      openDropdown();
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
        if (!isOpen) {
          openDropdown();
        }

        break;
      case 'ArrowDown':
        if (!isOpen) {
          openDropdown();
        }

        break;
      case 'Tab':
        if (isOpen) {
          closeDropdown();
        }

        break;
    }
  };

  // Check if an option is selected
  const isSelected = (optionValue: string) => {
    if (multiple && Array.isArray(selectedValues)) {
      return selectedValues.includes(optionValue);
    }

    return selectedValues === optionValue;
  };

  // Update internal state when external value changes
  useEffect(() => {
    if (value !== undefined) {
      setSelectedValues(value);
    }
  }, [ value ]);

  // Base styles
  const baseClassName = 'flex h-9 w-full rounded-md border border-neutral-300 bg-transparent px-3 py-1 text-base shadow-sm transition-colors placeholder:text-neutral-400 focus-visible:border-calypso-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm';
  const selectClassName = className ? `${baseClassName} ${className}` : baseClassName;

  return (
    <div className="relative w-full" onKeyDown={handleKeyDown}>
      {/* Hidden input for form submission */}
      <input
        ref={hiddenInputRef}
        type="hidden"
        name={name}
        id={id}
        value={Array.isArray(selectedValues) ? selectedValues.join(',') : selectedValues}
        required={required}
      />
      {/* Visible input/button */}
      <div
        className={`${selectClassName} cursor-pointer flex items-center justify-between ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
        onClick={() => {
          if (!disabled) {
            if (searchable && inputRef.current) {
              inputRef.current.focus();
            } else {
              toggleDropdown();
            }
          }
        }}
      >
        {searchable ? (
          <input
            ref={inputRef}
            type="text"
            className="w-full border-none bg-transparent p-0 outline-none focus:ring-0"
            value={isOpen ? searchTerm : displayText}
            onChange={handleSearchChange}
            placeholder={placeholder}
            disabled={disabled}
            onFocus={() => {
              if (!isOpen) openDropdown();
              // Clear display text when focusing
              if (!isOpen) setSearchTerm('');
            }}
            onBlur={(e) => {
              // Wait a short moment before resetting the searching flag
              // This helps prevent issues with click handlers
              setTimeout(() => {
                isSearchingRef.current = false;
              }, 200);

              // Restore display text when losing focus if dropdown is closed
              if (!isOpen && onBlur) {
                onBlur(e);
              }
            }}
          />
        ) : (
          <div className="truncate">
            {displayText || <span className="text-neutral-400">{placeholder}</span>}
          </div>
        )}
        <div className={`ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>
      {/* Dropdown menu */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-10 mt-1 w-full shadow-lg"
          onClick={(e) => {
            // Prevent dropdown from closing if clicking inside when searching
            if (searchable && isSearchingRef.current) {
              e.stopPropagation();
            }
          }}
        >
          <ul className='flex max-h-60 w-full flex-col overflow-auto rounded-lg border border-neutral-200 bg-white p-1 text-sm'>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <li
                  key={option.value}
                  className={`px-2 py-1.5 cursor-pointer hover:bg-neutral-100 rounded-md ${
                    !multiple && isSelected(option.value) ? 'bg-neutral-100 font-medium' : ''
                  }`}
                  onClick={() => handleSelect(option)}
                >
                  {multiple && (
                    <div className="flex items-center justify-between">
                      {option.label}
                      <CheckIcon className={`h-3.5 transition-opacity duration-150 ease-in ${isSelected(option.value) ? 'opacity-100' : 'opacity-0'}`}/>
                    </div>
                  )}
                  {!multiple && option.label}
                </li>
              ))
            ) : (
              <div className="px-2 py-1.5 text-neutral-500">No options found</div>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}