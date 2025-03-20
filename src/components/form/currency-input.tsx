import { useDropdown } from '@/hooks/useDropdown';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NumericFormat } from 'react-number-format';

// Define currency configurations
export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  decimalSeparator: string;
  thousandsSeparator: string;
  decimalPlaces: number;
  symbolPosition: 'before' | 'after';
}

// Common currency configurations
export const CURRENCY_CONFIGS: Record<string, CurrencyConfig> = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimalPlaces: 2,
    symbolPosition: 'before'
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    decimalSeparator: ',',
    thousandsSeparator: '.',
    decimalPlaces: 2,
    symbolPosition: 'after'
  },
  COP: {
    code: 'COP',
    symbol: '$',
    name: 'Colombian Peso',
    decimalSeparator: ',',
    thousandsSeparator: '.',
    decimalPlaces: 0,
    symbolPosition: 'before'
  },
  MXN: {
    code: 'MXN',
    symbol: '$',
    name: 'Mexican Peso',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimalPlaces: 2,
    symbolPosition: 'before'
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimalPlaces: 2,
    symbolPosition: 'before'
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimalPlaces: 0,
    symbolPosition: 'before'
  }
};

interface CurrencyInputProps {
  id?: string;
  name?: string;
  value?: string | number | null;
  defaultValue?: string | number;
  onChange?: (value: number | undefined, syntheticEvent: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onCurrencyChange?: (currencyCode: string) => void;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  className?: string;
  currencyCode?: string;
  availableCurrencies?: string[];
  showCurrencySelector?: boolean;
  autoFocus?: boolean;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
  blurOnEscapeKey?: boolean;
}

export default function CurrencyInput({
  id,
  name,
  value,
  defaultValue,
  onChange,
  onBlur,
  onCurrencyChange,
  disabled = false,
  required = false,
  placeholder = '0',
  className = '', currencyCode ='USD',
  availableCurrencies = Object.keys(CURRENCY_CONFIGS),
  showCurrencySelector = true,
  autoFocus = false,
  onKeyDown,
  blurOnEscapeKey = false
}: CurrencyInputProps) {
  // References
  const inputRef = useRef<HTMLInputElement>(null);

  // State
  const [ numericValue, setNumericValue ] = useState<number | null>(null);
  const [ selectedCurrency, setSelectedCurrency ] = useState<string>(currencyCode);

  // Get current currency config
  const getCurrencyConfig = useCallback(
    (): CurrencyConfig => CURRENCY_CONFIGS[selectedCurrency] || CURRENCY_CONFIGS.USD,
    [ selectedCurrency ]
  );

  // Setup dropdown with animation
  const { isOpen, dropdownRef, toggleDropdown, closeDropdown } = useDropdown<HTMLUListElement>({
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

  // Initialize from props
  useEffect(() => {
    if (value !== undefined && value !== null) {
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      setNumericValue(numValue);
    } else if (defaultValue !== undefined && numericValue === null) {
      const numValue = typeof defaultValue === 'string' ? parseFloat(defaultValue) : defaultValue;
      setNumericValue(numValue);
    }
  }, [ value, defaultValue, numericValue ]);

  // Handle key down
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle escape key if blurOnEscapeKey is true
    if (blurOnEscapeKey && e.key === 'Escape' && inputRef.current) {
      inputRef.current.blur();
    }

    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  // Handle currency selection
  const handleCurrencySelect = (code: string) => {
    setSelectedCurrency(code);
    closeDropdown();

    // Call the onCurrencyChange handler
    if (onCurrencyChange) {
      onCurrencyChange(code);
    }

    // Focus the input after currency selection
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const config = getCurrencyConfig();

  return (
    <div className="relative">
      <div className={`flex ${disabled ? 'opacity-50' : ''}`}>
        <div className="relative flex-grow">
          <NumericFormat
            getInputRef={inputRef}
            id={id}
            name={name}
            value={numericValue}
            onValueChange={(values) => {
              setNumericValue(values.floatValue || null);

              if (onChange) {
                const syntheticEvent = {
                  target: {
                    name,
                    value: values.floatValue
                  }
                };

                onChange(values.floatValue, syntheticEvent as unknown as React.ChangeEvent<HTMLInputElement>);
              }
            }}
            onBlur={onBlur}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            required={required}
            placeholder={placeholder}
            className={`flex h-9 w-full rounded-md border border-neutral-300 bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-neutral-800 placeholder:text-neutral-400 focus-visible:border-calypso-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm ${className} ${showCurrencySelector ? 'rounded-r-none' : ''}`}
            autoFocus={autoFocus}
            thousandSeparator={config.thousandsSeparator}
            decimalSeparator={config.decimalSeparator}
            decimalScale={config.decimalPlaces}
            prefix={config.symbolPosition === 'before' ? config.symbol : ''}
            suffix={config.symbolPosition === 'after' ? ` ${config.symbol}` : ''}
          />
        </div>
        {showCurrencySelector && (
          <div className={`relative inline-block${isOpen ? ' z-10' : ''}`}>
            <button
              type="button"
              onClick={toggleDropdown}
              disabled={disabled}
              className="flex h-9 items-center justify-center rounded-r-md border border-l-0 border-neutral-300 bg-neutral-50 px-2 transition-colors hover:bg-neutral-100 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="mr-1 text-sm font-medium">{selectedCurrency}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className='h-4 w-4' width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            {isOpen && (
              <ul ref={dropdownRef} className="absolute right-0 z-10 mt-1 max-h-60 w-48 overflow-auto rounded-lg border border-neutral-200 bg-white p-1 text-sm shadow-lg">
                {availableCurrencies.map((code) => {
                  const currency = CURRENCY_CONFIGS[code];
                  if (!currency) return null;

                  return (
                    <li
                      key={code}
                      onClick={() => handleCurrencySelect(code)}
                      className={`flex w-full items-center rounded-md px-2 py-1.5 cursor-pointer text-left hover:bg-neutral-100 ${
                        code === selectedCurrency ? 'bg-neutral-50 font-medium' : ''
                      }`}
                    >
                      <span className="mr-2">{currency.symbol}</span>
                      <span>{currency.code}</span>
                      <span className="ml-1 text-xs text-neutral-500">- {currency.name}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}