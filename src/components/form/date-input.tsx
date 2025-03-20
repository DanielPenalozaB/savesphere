'use client';

import React, { useState, useRef, useEffect } from 'react';
import { format, isValid, parse, addMonths, subMonths, isAfter, isBefore, isEqual } from 'date-fns';
import gsap from 'gsap';
import { useDropdown } from '@/hooks/useDropdown';
import { StringUtils } from '@/utils/string-utils';
import { CalendarIcon } from '../icons/calendar';

interface DateInputProps {
  id?: string;
  name?: string;
  value?: Date | { start: Date | null; end: Date | null };
  defaultValue?: Date | { start: Date | null; end: Date | null };
  onChange?: (value: Date | { start: Date | null; end: Date | null }, event?: React.SyntheticEvent) => void;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  rangeMode?: boolean;
  minDate?: Date;
  maxDate?: Date;
  formatString?: string;
  showControls?: boolean;
  showRecurring?: boolean;
  recurring?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  onRecurringChange?: (value: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly') => void;
}

export default function DatePicker({
  id,
  name,
  value,
  defaultValue,
  onChange,
  onBlur,
  placeholder = 'Select date',
  formatString = 'yyyy-MM-dd',
  disabled = false,
  required = false,
  recurring = 'none',
  className = '',
  rangeMode = false,
  showControls = false,
  showRecurring = false,
  onRecurringChange,
  minDate,
  maxDate
}: DateInputProps) {
  // References for animation
  const monthContainerRef = useRef<HTMLDivElement>(null);

  const [ currentMonth, setCurrentMonth ] = useState(new Date());
  const [ selectedDate, setSelectedDate ] = useState<Date | null>(value instanceof Date ? value : defaultValue instanceof Date ? defaultValue : null);
  const [ rangeSelection, setRangeSelection ] = useState<{ start: Date | null; end: Date | null }>(() => {
    if (rangeMode) {
      if (value && typeof value === 'object' && 'start' in value) {
        return value as { start: Date | null; end: Date | null };
      } else if (defaultValue && typeof defaultValue === 'object' && 'start' in defaultValue) {
        return defaultValue as { start: Date | null; end: Date | null };
      }

      return { start: null, end: null };
    }

    return { start: null, end: null };
  });

  const [ hoverDate, setHoverDate ] = useState<Date | null>(null);
  const [ displayValue, setDisplayValue ] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    dropdownRef: calendarRef,
    isOpen: isCalendarOpen,
    toggleDropdown: toggleCalendarDropdown,
    openDropdown: openCalendarDropdown,
    closeDropdown: closeCalendarDropdown
  } = useDropdown({
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

  // State for the selected recurring option
  const [ selectedRecurring, setSelectedRecurring ] = useState<'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'>(recurring);

  // Recurring dropdown state
  const {
    dropdownRef: recurringDropdownRef,
    isOpen: isRecurringOpen,
    toggleDropdown: toggleRecurringDropdown,
    closeDropdown: closeRecurringDropdown
  } = useDropdown<HTMLUListElement>({
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

  // Recurrence options
  const recurrenceOptions = [
    { value: 'none', label: 'None' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  // Handle recurrence selection
  const handleRecurringSelect = (value: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly') => {
    setSelectedRecurring(value); // Update the selected recurring state

    if (onRecurringChange) {
      onRecurringChange(value); // Call the onRecurringChange callback
    }

    closeRecurringDropdown(); // Close the dropdown
  };

  // Format the date for display
  useEffect(() => {
    if (rangeMode) {
      const { start, end } = rangeSelection;

      if (start && end) {
        setDisplayValue(`${format(start, formatString)} - ${format(end, formatString)}`);
      } else if (start) {
        setDisplayValue(`${format(start, formatString)} - Select end date`);
      } else {
        setDisplayValue('');
      }
    } else if (selectedDate) {
      setDisplayValue(format(selectedDate, formatString));
    } else {
      setDisplayValue('');
    }
  }, [ selectedDate, rangeSelection, formatString, rangeMode ]);

  // Animate calendar opening and closing
  useEffect(() => {
    if (isCalendarOpen && calendarRef.current) {
      gsap.fromTo(
        calendarRef.current,
        { opacity: 0, y: -10, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: 'power2.out' }
      );
    }
  }, [ isCalendarOpen, calendarRef ]);

  // Handle click outside to close calendar
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closeCalendarDropdown();
      }
    };

    if (isCalendarOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [ isCalendarOpen, closeCalendarDropdown ]);

  // Generate days for the current month
  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Get the day of the week for the first day (0 = Sunday, 6 = Saturday)
    const startOffset = firstDay.getDay();

    // Calculate total number of days to display (previous month, current month, next month)
    const totalDays = startOffset + lastDay.getDate();
    const totalCells = Math.ceil(totalDays / 7) * 7;

    const days = [];

    // Previous month's days
    const prevMonthLastDay = new Date(year, month, 0).getDate();

    for (let i = 0; i < startOffset; i++) {
      const day = prevMonthLastDay - startOffset + i + 1;
      days.push({
        date: new Date(year, month - 1, day),
        dayOfMonth: day,
        isCurrentMonth: false
      });
    }

    // Current month's days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({
        date: new Date(year, month, i),
        dayOfMonth: i,
        isCurrentMonth: true
      });
    }

    // Next month's days
    const remainingCells = totalCells - days.length;

    for (let i = 1; i <= remainingCells; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        dayOfMonth: i,
        isCurrentMonth: false
      });
    }

    return days;
  };

  // Handle month navigation
  const goToPrevMonth = () => {
    if (monthContainerRef.current) {
      gsap.to(monthContainerRef.current, {
        opacity: 0,
        x: 20,
        duration: 0.15,
        onComplete: () => {
          setCurrentMonth((prevMonth) => subMonths(prevMonth, 1));
          gsap.fromTo(
            monthContainerRef.current!,
            { opacity: 0, x: -20 },
            { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out' }
          );
        }
      });
    } else {
      setCurrentMonth((prevMonth) => subMonths(prevMonth, 1));
    }
  };

  const goToNextMonth = () => {
    if (monthContainerRef.current) {
      gsap.to(monthContainerRef.current, {
        opacity: 0,
        x: -20,
        duration: 0.15,
        onComplete: () => {
          setCurrentMonth((prevMonth) => addMonths(prevMonth, 1));
          gsap.fromTo(
            monthContainerRef.current!,
            { opacity: 0, x: 20 },
            { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out' }
          );
        }
      });
    } else {
      setCurrentMonth((prevMonth) => addMonths(prevMonth, 1));
    }
  };

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    // If date is disabled, don't select it
    if (
      (minDate && isBefore(date, minDate))
      || (maxDate && isAfter(date, maxDate))
    ) {
      return;
    }

    if (rangeMode) {
      if (!rangeSelection.start || (rangeSelection.start && rangeSelection.end)) {
        // Start new selection
        const newRange = { start: date, end: null };
        setRangeSelection(newRange);
        triggerChange(newRange);
      } else {
        // Complete the selection
        let newRange;

        if (isBefore(date, rangeSelection.start)) {
          // If selected date is before start date, swap them
          newRange = { start: date, end: rangeSelection.start };
        } else {
          newRange = { start: rangeSelection.start, end: date };
        }

        setRangeSelection(newRange);
        triggerChange(newRange);
        closeCalendarDropdown();
      }
    } else {
      setSelectedDate(date);
      triggerChange(date);
      closeCalendarDropdown();
    }
  };

  // Trigger onChange callback with custom synthetic event
  const triggerChange = (newValue: (Date | { start: Date | null; end: Date | null; }) | null) => {
    if (onChange) {
      if (newValue === null) {
        // Handle the case where newValue is null
        // For example, you can call onChange with a default value
        onChange({ start: null, end: null }, undefined);
      } else {
        // Create a custom synthetic event
        const syntheticEvent = {
          target: {
            name: name || '', // Ensure name is a string (empty string if undefined)
            value: newValue
          },
          currentTarget: {
            name: name || '', // Ensure name is a string (empty string if undefined)
            value: newValue
          },
          preventDefault: () => undefined,
          stopPropagation: () => undefined
        } as unknown as React.SyntheticEvent;

        onChange(newValue, syntheticEvent);
      }
    }
  };

  // Handle input change for manual date entry
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setDisplayValue(inputValue);

    if (rangeMode && inputValue.includes('-')) {
      const [ startStr, endStr ] = inputValue.split('-').map((str) => str.trim());

      try {
        const parsedStart = parse(startStr, formatString, new Date());
        const parsedEnd = parse(endStr, formatString, new Date());

        if (isValid(parsedStart) && isValid(parsedEnd)) {
          const newRange = { start: parsedStart, end: parsedEnd };
          setRangeSelection(newRange);
          triggerChange(newRange);
        }
      } catch (error) {
        console.error(error);
      }
    } else if (!rangeMode) {
      try {
        const parsed = parse(inputValue, formatString, new Date());

        if (isValid(parsed)) {
          setSelectedDate(parsed);
          triggerChange(parsed);
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  // Handle input blur
  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (onBlur) {
      onBlur(e);
    }
  };

  // Check if a date is in the selected range
  const isInRange = (date: Date) => {
    if (!rangeMode || !rangeSelection.start || !hoverDate) return false;

    const start = rangeSelection.start;
    const end = rangeSelection.end || hoverDate;

    return (
      (isAfter(date, start) && isBefore(date, end))
      || (isAfter(date, end) && isBefore(date, start))
    );
  };

  // Handle hover for range selection preview
  const handleDateHover = (date: Date) => {
    if (rangeMode && rangeSelection.start && !rangeSelection.end) {
      setHoverDate(date);
    }
  };

  // Generate day elements for the calendar
  const dayElements = getDaysInMonth().map((day, index) => {
    const isSelected = !rangeMode && selectedDate && isEqual(day.date, selectedDate);
    const isDisabled = (minDate && isBefore(day.date, minDate))
      || (maxDate && isAfter(day.date, maxDate));

    const isRangeStart = rangeMode
      && rangeSelection.start
      && isEqual(day.date, rangeSelection.start);

    const isRangeEnd = rangeMode
      && rangeSelection.end
      && isEqual(day.date, rangeSelection.end);

    const inRange = isInRange(day.date);

    let dayClassName = 'flex h-7 w-7 items-center justify-center rounded-md text-sm';

    if (!day.isCurrentMonth) {
      dayClassName += ' text-neutral-400';
    } else if (isDisabled) {
      dayClassName += ' text-neutral-300 cursor-not-allowed';
    } else if (isRangeStart || isRangeEnd || isSelected) {
      dayClassName += ' bg-calypso-500 text-white hover:bg-calypso-600';
    } else if (inRange) {
      dayClassName += ' bg-calypso-100 text-calypso-800 hover:bg-calypso-200';
    } else {
      dayClassName += ' text-neutral-700 hover:bg-neutral-100';
    }

    return (
      <button
        key={index}
        type="button"
        onClick={() => !isDisabled && handleDateSelect(day.date)}
        onMouseEnter={() => handleDateHover(day.date)}
        className={dayClassName}
        disabled={isDisabled}
      >
        {day.dayOfMonth}
      </button>
    );
  });

  // Days of week header
  const daysOfWeek = [ 'Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa' ];

  return (
    <div ref={containerRef} className="relative">
      <div className="relative flex">
        <div className="relative w-full">
          <input
            id={id}
            name={name}
            type="text"
            value={displayValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            onClick={() => !disabled && openCalendarDropdown()}
            className={`flex h-9 w-full rounded-md border border-neutral-300 bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-400 focus-visible:border-calypso-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm${showRecurring ? ' rounded-r-none' : ''} ${className}`}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <button
              type="button"
              onClick={() => !disabled && toggleCalendarDropdown()}
              className="text-neutral-500 hover:text-neutral-700"
            >
              <CalendarIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
        {showRecurring && (
          <div className={`relative inline-block${isRecurringOpen ? ' z-10' : ''}`}>
            <button
              type="button"
              onClick={toggleRecurringDropdown}
              disabled={disabled}
              className="flex h-9 items-center justify-center rounded-r-md border border-l-0 border-neutral-300 bg-neutral-50 px-2 transition-colors hover:bg-neutral-100 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="mr-1 text-sm font-medium">{StringUtils.capitalize(selectedRecurring)}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            {isRecurringOpen && (
              <ul ref={recurringDropdownRef} className="absolute right-0 z-10 mt-1 max-h-60 w-48 overflow-auto rounded-lg border border-neutral-200 bg-white p-1 text-sm shadow-lg">
                {recurrenceOptions.map((option) => (
                  <li
                    key={option.value}
                    onClick={() => handleRecurringSelect(option.value as 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly')}
                    className={`flex w-full items-center rounded-md px-2 py-1.5 cursor-pointer text-left hover:bg-neutral-100 ${
                      option.value === selectedRecurring ? 'bg-neutral-50 font-medium' : ''
                    }`}
                  >
                    {option.label}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Calendar dropdown (existing code) */}
      {isCalendarOpen && (
        <div
          ref={calendarRef}
          className="absolute z-10 mt-1 w-64 origin-top-right rounded-md bg-white p-4 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
        >
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={goToPrevMonth}
              className="p-1 text-neutral-500 hover:text-neutral-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <div ref={monthContainerRef} className="text-sm font-medium text-neutral-800">
              {format(currentMonth, 'MMMM yyyy')}
            </div>
            <button
              type="button"
              onClick={goToNextMonth}
              className="p-1 text-neutral-500 hover:text-neutral-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {daysOfWeek.map((day, i) => (
              <div key={i} className="text-xs font-medium text-neutral-500">
                {day}
              </div>
            ))}
            {dayElements}
          </div>
          {showControls && (
            <div className="mt-4 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  if (rangeMode) {
                    setRangeSelection({ start: null, end: null });
                    triggerChange({ start: null, end: null });
                  } else {
                    setSelectedDate(null);
                    triggerChange(null as Date | null);
                  }

                  setDisplayValue('');
                }}
                className="rounded-md px-2 py-1 text-xs text-neutral-600 hover:bg-neutral-100"
              >
              Clear
              </button>
              <button
                type="button"
                onClick={() => closeCalendarDropdown()}
                className="rounded-md bg-calypso-500 px-2 py-1 text-xs text-white hover:bg-calypso-600"
              >
              Close
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}