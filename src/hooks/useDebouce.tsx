import { useEffect, useState } from 'react';

// Custom debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [ debouncedValue, setDebouncedValue ] = useState<T>(value);

  useEffect(() => {
    // Set a timeout to update the debounced value after the specified delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup the timeout if the value or delay changes
    return () => {
      clearTimeout(handler);
    };
  }, [ value, delay ]);

  return debouncedValue;
}

export default useDebounce;