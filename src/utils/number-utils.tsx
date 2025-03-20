/**
 * Number formatting utility functions.
 */
export const NumberUtils = {
  /**
   * Format a number as currency.
   * @param value - The numeric value to format.
   * @param currency - The currency code (e.g., 'USD', 'EUR').
   * @param locale - The locale to use for formatting (e.g., 'en-US').
   * @returns The formatted currency string.
   */
  formatCurrency: (value: number, currency: string = 'USD', locale?: string): string => {
    // Map currency codes to their respective locales
    const currencyToLocaleMap: Record<string, string> = {
      USD: 'en-US', // US Dollar
      EUR: 'en-US', // Euro (can also use 'de-DE' for Germany)
      COP: 'es-CO', // Colombian Peso
      MXN: 'es-MX', // Mexican Peso
      GBP: 'en-GB', // British Pound
      JPY: 'ja-JP' // Japanese Yen
    };

    // Use the provided locale or infer it from the currency
    const inferredLocale = locale || currencyToLocaleMap[currency] || 'en-US';

    return new Intl.NumberFormat(inferredLocale, {
      style: 'currency',
      currency
    }).format(value);
  },

  /**
   * Format a number with commas as thousand separators.
   * @param value - The numeric value to format.
   * @param locale - The locale to use for formatting (e.g., 'en-US').
   * @returns The formatted number string.
   */
  formatWithCommas: (value: number, locale: string = 'en-US'): string => new Intl.NumberFormat(locale).format(value),

  /**
   * Round a number to a specified number of decimal places.
   * @param value - The numeric value to round.
   * @param decimals - The number of decimal places (default: 0).
   * @returns The rounded number.
   */
  round: (value: number, decimals: number = 0): number => {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  },

  /**
   * Truncate a number to a specified number of decimal places.
   * @param value - The numeric value to truncate.
   * @param decimals - The number of decimal places (default: 0).
   * @returns The truncated number.
   */
  truncate: (value: number, decimals: number = 0): number => {
    const factor = Math.pow(10, decimals);
    return Math.trunc(value * factor) / factor;
  },

  /**
   * Pad a number with leading zeros.
   * @param value - The numeric value to pad.
   * @param length - The total length of the padded string.
   * @returns The padded number as a string.
   */
  padWithZeros: (value: number, length: number): string => value.toString().padStart(length, '0'),

  /**
   * Convert a number to a percentage.
   * @param value - The numeric value to convert.
   * @param decimals - The number of decimal places (default: 2).
   * @returns The percentage string.
   */
  toPercentage: (value: number, decimals: number = 2): string => `${NumberUtils.round(value * 100, decimals)}%`,

  /**
   * Convert bytes to a human-readable format (e.g., KB, MB, GB).
   * @param bytes - The number of bytes.
   * @param decimals - The number of decimal places (default: 2).
   * @returns The human-readable file size string.
   */
  formatBytes: (bytes: number, decimals: number = 2): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = [ 'Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB' ];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${NumberUtils.round(bytes / Math.pow(k, i), decimals)} ${sizes[i]}`;
  },

  /**
   * Generate a random number within a range.
   * @param min - The minimum value (inclusive).
   * @param max - The maximum value (inclusive).
   * @returns A random number between min and max.
   */
  randomInRange: (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min,

  /**
   * Check if a value is a number.
   * @param value - The value to check.
   * @returns True if the value is a number, otherwise false.
   */
  isNumber: (value: unknown): boolean => typeof value === 'number' && !isNaN(value),

  /**
   * Clamp a number between a minimum and maximum value.
   * @param value - The value to clamp.
   * @param min - The minimum value.
   * @param max - The maximum value.
   * @returns The clamped value.
   */
  clamp: (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max),

  /**
   * Calculate the sum of an array of numbers.
   * @param numbers - The array of numbers.
   * @returns The sum of the numbers.
   */
  sum: (numbers: number[]): number => numbers.reduce((acc, num) => acc + num, 0),

  /**
   * Calculate the average of an array of numbers.
   * @param numbers - The array of numbers.
   * @returns The average of the numbers.
   */
  average: (numbers: number[]): number => {
    if (numbers.length === 0) return 0;
    return NumberUtils.sum(numbers) / numbers.length;
  },

  /**
   * Calculate the median of an array of numbers.
   * @param numbers - The array of numbers.
   * @returns The median of the numbers.
   */
  median: (numbers: number[]): number => {
    if (numbers.length === 0) return 0;

    const sorted = [ ...numbers ].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
      return (sorted[mid - 1] + sorted[mid]) / 2;
    }

    return sorted[mid];
  },

  /**
   * Calculate the difference between two numbers as a percentage.
   * @param oldValue - The original value.
   * @param newValue - The new value.
   * @returns The percentage difference.
   */
  percentageDifference: (oldValue: number, newValue: number): number => {
    if (oldValue === 0) return 0;
    return ((newValue - oldValue) / oldValue) * 100;
  }
};