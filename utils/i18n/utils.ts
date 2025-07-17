export type DotPrefix<T extends string> = T extends '' ? '' : `.${T}`;

export type DotNestedKeys<T> = (
  T extends object
    ? {
        [K in keyof T & string]: `${K}${DotPrefix<DotNestedKeys<T[K]>>}`;
      }[keyof T & string]
    : ''
);