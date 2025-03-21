import React from 'react';
import OtpInput from './otp-input';
import SelectInput from './select-input';
import DateInput from './date-input';
import RadioCardInput, { RadioCardOption } from './radio-card-input';
import CurrencyInput from './currency-input';

type ExtendedInputType = React.HTMLInputTypeAttribute | 'otp' | 'select' | 'dateRange' | 'radioCard' | 'currency' | 'textarea';

interface InputProps extends Omit<React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, 'type'> {
  type?: ExtendedInputType;
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  children?: React.ReactNode;
  options?: Array<{ value: string; label: string; description?: string; count?: number }>;
  otpLength?: number;
  multiple?: boolean;
  searchable?: boolean;
  minDate?: Date;
  maxDate?: Date;
  formatString?: string;
  showControls?: boolean;
  currencyCode?: string;
  availableCurrencies?: string[];
  showCurrencySelector?: boolean;
  onCurrencyChange?: (currencyCode: string) => void;
  showRecurringSelector?: boolean;
  recurring?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  onRecurringChange?: (value: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly') => void;
  optional?: boolean;
  rows?: number;
  cols?: number;
}

export default function Input(props: InputProps) {
  const {
    label,
    description,
    error,
    children,
    type = 'text',
    options,
    otpLength = 6,
    multiple = false,
    searchable = false,
    minDate,
    maxDate,
    formatString,
    showControls = false,
    currencyCode = 'USD',
    availableCurrencies,
    showCurrencySelector = true,
    onCurrencyChange,
    recurring = 'none',
    showRecurringSelector = false,
    optional = false,
    rows = 3,
    cols,
    ...restProps
  } = props;

  // Validate id and name
  if (restProps.id && !restProps.name) {
    restProps.name = restProps.id;
  } else if (restProps.name && !restProps.id) {
    restProps.id = restProps.name;
  }

  if (!restProps.placeholder && typeof children === 'string') {
    restProps.placeholder = children;
  } else if (!restProps.placeholder && typeof label === 'string') {
    restProps.placeholder = label;
  }

  const className = 'flex h-9 w-full rounded-md border border-neutral-300 bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-neutral-800 placeholder:text-neutral-400 focus-visible:border-calypso-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm';
  const textareaClassName = 'flex min-h-[80px] w-full rounded-md border border-neutral-300 bg-transparent px-3 py-2 text-base shadow-sm transition-colors placeholder:text-neutral-400 focus-visible:border-calypso-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm';

  // Add classes
  const inputClassName = restProps.className ? `${className} ${restProps.className}` : className;
  const textareaInputClassName = restProps.className ? `${textareaClassName} ${restProps.className}` : textareaClassName;

  // Create handler for select onChange that converts from select to input event
  const handleCustomSelectChange = (value: string | string[], syntheticEvent?: React.SyntheticEvent) => {
    if (restProps.onChange && syntheticEvent) {
      // Use the synthetic event provided by CustomSelect
      restProps.onChange(syntheticEvent as React.ChangeEvent<HTMLInputElement>);
    }
  };

  // Create handler for date picker onChange
  const handleDatePickerChange = (value: Date | { start: Date | null; end: Date | null }, syntheticEvent?: React.SyntheticEvent) => {
    if (restProps.onChange && syntheticEvent) {
      restProps.onChange(syntheticEvent as React.ChangeEvent<HTMLInputElement>);
    }
  };

  // Create handler for radio card onChange
  const handleRadioCardChange = (value: string, syntheticEvent: React.ChangeEvent<HTMLInputElement>) => {
    if (restProps.onChange) {
      restProps.onChange(syntheticEvent);
    }
  };

  // Create handler for currency input onChange
  const handleCurrencyChange = (value: number| undefined, syntheticEvent: React.ChangeEvent<HTMLInputElement>) => {
    if (restProps.onChange) {
      const newEvent = {
        ...syntheticEvent,
        target: {
          ...syntheticEvent.target
        }
      };

      restProps.onChange(newEvent as React.ChangeEvent<HTMLInputElement>);
    }
  };

  const handleTextareaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (restProps.onChange) {
      // Convert textarea event to input event
      restProps.onChange(event as unknown as React.ChangeEvent<HTMLInputElement>);
    }
  };

  // Render different input types
  const renderInput = () => {
    if (type === 'textarea') {
      return (
        <textarea
          id={restProps.id}
          name={restProps.name}
          value={restProps.value as string}
          defaultValue={restProps.defaultValue as string}
          placeholder={restProps.placeholder}
          disabled={restProps.disabled}
          required={restProps.required}
          className={textareaInputClassName}
          onChange={handleTextareaChange}
          onBlur={restProps.onBlur as unknown as React.FocusEventHandler<HTMLTextAreaElement>}
          autoFocus={restProps.autoFocus}
          rows={rows}
          cols={cols}
        />
      );
    }

    if (type === 'currency') {
      return (
        <CurrencyInput
          id={restProps.id}
          name={restProps.name}
          value={restProps.value as string | number}
          defaultValue={restProps.defaultValue as string | number}
          placeholder={restProps.placeholder}
          disabled={restProps.disabled}
          required={restProps.required}
          className={restProps.className}
          onChange={handleCurrencyChange}
          onBlur={restProps.onBlur}
          autoFocus={restProps.autoFocus}
          currencyCode={currencyCode}
          availableCurrencies={availableCurrencies}
          showCurrencySelector={showCurrencySelector}
          onCurrencyChange={onCurrencyChange}
        />
      );
    }

    if (type === 'radioCard' && options) {
      return (
        <RadioCardInput
          id={restProps.id}
          name={restProps.name}
          options={options as RadioCardOption[]}
          value={restProps.value as string}
          defaultValue={restProps.defaultValue as string}
          disabled={restProps.disabled}
          required={restProps.required}
          className={restProps.className}
          onChange={handleRadioCardChange}
          onBlur={restProps.onBlur}
        />
      );
    }

    // For the date input
    if (type === 'date') {
      return (
        <DateInput
          id={restProps.id}
          name={restProps.name}
          value={restProps.value ? new Date(restProps.value.toString()) : undefined}  // Add the unknown cast first
          defaultValue={restProps.defaultValue ? new Date(restProps.defaultValue.toString()) : undefined}  // Add the unknown cast first
          placeholder={restProps.placeholder}
          disabled={restProps.disabled}
          required={restProps.required}
          className={restProps.className}
          onChange={handleDatePickerChange}
          onBlur={restProps.onBlur}
          minDate={minDate}
          maxDate={maxDate}
          formatString={formatString}
          showControls={showControls}
          showRecurring={showRecurringSelector}
          onRecurringChange={restProps.onRecurringChange}
        />
      );
    }

    if (type === 'dateRange') {
      return (
        <DateInput
          id={restProps.id}
          name={restProps.name}
          value={restProps.value as unknown as { start: Date | null; end: Date | null }}  // Add the unknown cast first
          defaultValue={restProps.defaultValue as unknown as { start: Date | null; end: Date | null }}  // Add the unknown cast first
          placeholder={restProps.placeholder}
          disabled={restProps.disabled}
          required={restProps.required}
          className={restProps.className}
          onChange={handleDatePickerChange}
          onBlur={restProps.onBlur}
          rangeMode={true}
          minDate={minDate}
          maxDate={maxDate}
          formatString={formatString}
          showControls={showControls}
          recurring={recurring}
          showRecurring={showRecurringSelector}
        />
      );
    }

    if (type === 'select' && options) {
      return (
        <SelectInput
          id={restProps.id}
          name={restProps.name}
          options={options}
          value={restProps.value as string | string[]}
          defaultValue={restProps.defaultValue as string | string[]}
          placeholder={restProps.placeholder}
          multiple={multiple}
          searchable={searchable}
          disabled={restProps.disabled}
          required={restProps.required}
          className={restProps.className}
          onChange={handleCustomSelectChange}
          onBlur={restProps.onBlur}
        />
      );
    }

    if (type === 'otp') {
      return (
        <OtpInput
          id={restProps.id}
          name={restProps.name}
          value={restProps.value as string}
          defaultValue={restProps.defaultValue as string}
          otpLength={otpLength}
          disabled={restProps.disabled}
          autoFocus={restProps.autoFocus}
          required={restProps.required}
          onChange={restProps.onChange}
          onBlur={restProps.onBlur}
          className={restProps.className}
        />
      );
    }

    return <input type={type as React.HTMLInputTypeAttribute} {...restProps} className={inputClassName} />;
  };

  return (
    <div className='flex flex-col gap-2'>
      {(children || label) && (
        <label
          htmlFor={restProps.id}
          className="flex items-center gap-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {children || label}
          {(optional && !restProps.required) && (<span className='text-xs text-neutral-500'>(optional)</span>)}
        </label>
      )}
      {renderInput()}
      {(error || description) && (
        <p className={`text-[0.8rem] ${error ? 'text-red-500' : 'text-neutral-500'}`}>
          {error || description}
        </p>
      )}
    </div>
  );
}