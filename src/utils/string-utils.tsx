/**
 * String formatting utility functions.
 */
export const StringUtils = {
  /**
   * Convert a string to lowercase.
   * @param str - The input string.
   * @returns The string in lowercase.
   */
  toLowerCase: (str: string): string => str.toLowerCase(),

  /**
   * Convert a string to uppercase.
   * @param str - The input string.
   * @returns The string in uppercase.
   */
  toUpperCase: (str: string): string => str.toUpperCase(),

  /**
   * Capitalize the first letter of a string.
   * @param str - The input string.
   * @returns The string with the first letter capitalized.
   */
  capitalize: (str: string): string => str.charAt(0).toUpperCase() + str.slice(1),

  /**
   * Convert a string to snake_case.
   * @param str - The input string.
   * @returns The string in snake_case.
   */
  toSnakeCase: (str: string): string => str
    .replace(/\W+/g, ' ')
    .split(/ |\B(?=[A-Z])/)
    .map((word) => word.toLowerCase())
    .join('_'),

  /**
   * Convert a string to camelCase.
   * @param str - The input string.
   * @returns The string in camelCase.
   */
  toCamelCase: (str: string): string => str
    .replace(/\s(.)/g, (_, char) => char.toUpperCase())
    .replace(/\s/g, '')
    .replace(/^(.)/, (_, char) => char.toLowerCase()),

  /**
   * Convert a string to kebab-case.
   * @param str - The input string.
   * @returns The string in kebab-case.
   */
  toKebabCase: (str: string): string => str
    .replace(/\W+/g, ' ')
    .split(/ |\B(?=[A-Z])/)
    .map((word) => word.toLowerCase())
    .join('-'),

  /**
   * Convert a string to PascalCase.
   * @param str - The input string.
   * @returns The string in PascalCase.
   */
  toPascalCase: (str: string): string => str
    .replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .replace(/\s+/g, ''),

  /**
   * Trim whitespace from both ends of a string.
   * @param str - The input string.
   * @returns The trimmed string.
   */
  trim: (str: string): string => str.trim(),

  /**
   * Replace all occurrences of a substring within a string.
   * @param str - The input string.
   * @param searchValue - The substring to search for.
   * @param replaceValue - The substring to replace with.
   * @returns The string with replacements.
   */
  replaceAll: (str: string, searchValue: string, replaceValue: string): string => str.split(searchValue).join(replaceValue),

  /**
   * Reverse a string.
   * @param str - The input string.
   * @returns The reversed string.
   */
  reverse: (str: string): string => str.split('').reverse().join(''),

  /**
   * Check if a string contains a substring.
   * @param str - The input string.
   * @param substring - The substring to search for.
   * @returns True if the substring is found, otherwise false.
   */
  contains: (str: string, substring: string): boolean => str.includes(substring),

  /**
   * Check if a string starts with a substring.
   * @param str - The input string.
   * @param substring - The substring to check.
   * @returns True if the string starts with the substring, otherwise false.
   */
  startsWith: (str: string, substring: string): boolean => str.startsWith(substring),

  /**
   * Check if a string ends with a substring.
   * @param str - The input string.
   * @param substring - The substring to check.
   * @returns True if the string ends with the substring, otherwise false.
   */
  endsWith: (str: string, substring: string): boolean => str.endsWith(substring),

  /**
   * Count the number of words in a string.
   * @param str - The input string.
   * @returns The number of words.
   */
  countWords: (str: string): number => str.split(/\s+/).filter(Boolean).length,

  /**
   * Count the number of characters in a string.
   * @param str - The input string.
   * @returns The number of characters.
   */
  countChars: (str: string): number => str.length,

  /**
   * Generate a random string of a given length.
   * @param length - The length of the random string.
   * @returns A random string.
   */
  generateRandomString: (length: number): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return result;
  }
};