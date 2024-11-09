const isChrome =
  typeof navigator !== 'undefined' &&
  /Chrome/.test(navigator.userAgent) &&
  /Google Inc/.test(navigator.vendor);

export const isServer =
  typeof window === 'undefined' || (isChrome && !window.chrome);
