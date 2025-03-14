import React from 'react';

export interface RadioCardOption {
  value: string;
  label: string;
  description?: string;
  count?: number;
}

interface RadioCardInputProps {
  id?: string;
  name?: string;
  options: RadioCardOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string, e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export default function RadioCardInput({
  id,
  name,
  options,
  value,
  defaultValue,
  onChange,
  onBlur,
  disabled = false,
  required = false,
  className = ''
}: RadioCardInputProps) {
  const [ selectedValue, setSelectedValue ] = React.useState<string>(value || defaultValue || '');

  React.useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [ value ]);

  const handleChange = (optionValue: string, e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedValue(optionValue);

    if (onChange) {
      onChange(optionValue, e);
    }
  };

  return (
    <div className={`grid gap-2 ${className}`}>
      {options.map((option, index) => {
        const optionId = `${id || name}-option-${index}`;
        const isSelected = selectedValue === option.value;

        return (
          <label
            key={optionId}
            htmlFor={optionId}
            className={`relative flex cursor-pointer rounded-lg border p-4 ${
              isSelected
                ? 'border-2 border-calypso-500 bg-calypso-50'
                : 'border-neutral-300 hover:bg-neutral-50'
            } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            <input
              type="radio"
              id={optionId}
              name={name}
              value={option.value}
              className="sr-only"
              checked={isSelected}
              onChange={(e) => handleChange(option.value, e)}
              onBlur={onBlur}
              disabled={disabled}
              required={required}
            />
            <div className="flex w-full items-start">
              <div className="flex-1 text-sm">
                <div className="flex justify-between">
                  <p className="font-medium text-neutral-800">{option.label}</p>
                  <div
                    className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                      isSelected
                        ? 'border-2 border-calypso-500'
                        : 'border-neutral-300'
                    }`}
                  >
                    {isSelected && (
                      <div className="h-2 w-2 rounded-full bg-calypso-500"></div>
                    )}
                  </div>
                </div>
                {option.description && (
                  <p className="mt-1 text-neutral-500">{option.description}</p>
                )}
                {option.count !== undefined && (
                  <span className="mt-2 text-sm text-neutral-500">{option.count}</span>
                )}
              </div>
            </div>
          </label>
        );
      })}
    </div>
  );
}