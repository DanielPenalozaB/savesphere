/**
 * Opens the "Record movement" sheet from anywhere in the app shell. Only mutated from click
 * handlers in the browser, so it is never shared between server requests.
 */
export const quickAdd = $state({ open: false });
