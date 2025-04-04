interface Firebase {
  firestore: () => any;
  auth: () => any;
  storage: () => any;
  app: any;
}

declare global {
  interface Window {
    firebase: Firebase;
    showToast?: (message: string) => void;
  }
}

export {};
