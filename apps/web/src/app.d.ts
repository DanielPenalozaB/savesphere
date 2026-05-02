// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
  namespace App {
    interface Error {
      message: string;
      code?: string;
    }
    // interface Locals {}
    interface PageData {
      /** Will be populated by +page.ts load functions */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [key: string]: any;
    }
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
