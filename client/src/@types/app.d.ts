declare global {
  declare module '*.svg';
  declare module '*.proto';

  interface Window {
    chrome: any;
  }

  type PartialRecord<K extends keyof any, T> = {
    [P in K]?: T;
  };

  type Replace<
    T extends string,
    S extends string,
    D extends string,
    A extends string = '',
  > = T extends `${infer L}${S}${infer R}`
    ? Replace<R, S, D, `${A}${L}${D}`>
    : `${A}${T}`;
}

export {};
