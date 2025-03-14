import React, { useRef, useEffect } from 'react';

interface OtpInputProps {
  id?: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  otpLength?: number;
  disabled?: boolean;
  autoFocus?: boolean;
  required?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  className?: string;
}

export default function OtpInput({
  id,
  name,
  value,
  defaultValue,
  otpLength = 6,
  disabled,
  autoFocus,
  required,
  onChange,
  onBlur,
  className
}: OtpInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  // Base class for individual OTP inputs
  const baseClassName = 'flex h-9 w-full rounded-md border border-neutral-300 bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-neutral-800 placeholder:text-neutral-400 focus-visible:border-calypso-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm';
  const inputClassName = className ? `${baseClassName} ${className} w-10 text-center` : `${baseClassName} w-10 text-center`;

  // Set initial value if provided
  useEffect(() => {
    if ((value || defaultValue) && inputRef.current) {
      const initialValue = (value || defaultValue || '').substring(0, otpLength);

      // Update hidden input
      inputRef.current.value = initialValue;

      // Fill individual OTP inputs
      initialValue.split('').forEach((char, index) => {
        if (otpRefs.current[index]) {
          otpRefs.current[index]!.value = char;
        }
      });
    }
  }, [ value, defaultValue, otpLength ]);

  // Handle OTP input change
  const handleOtpChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Only allow one character per input
    if (inputValue.length > 1) {
      e.target.value = inputValue.charAt(inputValue.length - 1);
    }

    // Move to next input after entering a digit
    if (inputValue && index < otpLength - 1 && otpRefs.current[index + 1]) {
      otpRefs.current[index + 1]?.focus();
    }

    updateHiddenInput();
  };

  // Handle OTP paste event
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();

    // Only process if paste data is numeric and doesn't exceed OTP length
    if (pasteData.length <= otpLength && /^\d+$/.test(pasteData)) {
      // Fill in the OTP inputs
      pasteData.split('').forEach((char, index) => {
        if (index < otpLength && otpRefs.current[index]) {
          const input = otpRefs.current[index];

          if (input) {
            input.value = char;
          }
        }
      });

      // Focus on the next empty field or the last field
      const nextEmptyIndex = pasteData.length < otpLength ? pasteData.length : otpLength - 1;
      otpRefs.current[nextEmptyIndex]?.focus();

      updateHiddenInput(pasteData.substring(0, otpLength));
    }
  };

  // Handle OTP backspace
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      const input = otpRefs.current[index] as HTMLInputElement;

      // If current input is empty, focus and clear previous input
      if (!input.value && index > 0) {
        const prevInput = otpRefs.current[index - 1];

        if (prevInput) {
          prevInput.focus();
          prevInput.value = '';
          updateHiddenInput();
        }
      }
    }
  };

  // Update hidden input and trigger onChange
  const updateHiddenInput = (directValue?: string) => {
    if (inputRef.current) {
      // Either use direct value or combine all OTP values
      const otpValue = directValue || otpRefs.current
        .map((input) => input?.value || '')
        .join('');

      // Update the hidden input with complete value
      inputRef.current.value = otpValue;

      // Trigger change event on the hidden input
      const event = new Event('input', { bubbles: true });
      inputRef.current.dispatchEvent(event);

      // If onChange prop exists, call it with the new value
      if (onChange) {
        const syntheticEvent = {
          target: inputRef.current
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      }
    }
  };

  // Create a ref callback for OTP inputs
  const setOtpRef = (index: number) => (el: HTMLInputElement | null) => {
    otpRefs.current[index] = el;
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Hidden input to store the entire OTP value */}
      <input
        type="hidden"
        id={id}
        name={name}
        ref={inputRef}
        required={required}
        disabled={disabled}
      />

      {/* OTP input fields */}
      <div className="flex gap-2">
        {Array.from({ length: otpLength }).map((_, index) => (
          <input
            key={index}
            type="text"
            inputMode="numeric"
            pattern="[0-9]"
            maxLength={1}
            className={inputClassName}
            ref={setOtpRef(index)}
            onChange={(e) => handleOtpChange(index, e)}
            onKeyDown={(e) => handleOtpKeyDown(index, e)}
            onPaste={index === 0 ? handleOtpPaste : undefined}
            onBlur={index === otpLength - 1 ? onBlur : undefined}
            disabled={disabled}
            autoFocus={index === 0 && autoFocus}
          />
        ))}
      </div>
    </div>
  );
}