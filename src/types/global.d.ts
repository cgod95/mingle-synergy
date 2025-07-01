interface Firebase {
  firestore: () => unknown;
  auth: () => unknown;
  storage: () => unknown;
  app: unknown;
}

declare global {
  interface Window {
    firebase: Firebase;
    showToast?: (message: string) => void;
  }
}

export {};
