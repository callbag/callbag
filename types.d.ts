export type START = 0;
export type DATA = 1;
export type END = 2;
export type RESERVED_3 = 3;
export type RESERVED_4 = 4;
export type RESERVED_5 = 5;
export type RESERVED_6 = 6;
export type RESERVED_7 = 7;
export type RESERVED_8 = 8;
export type RESERVED_9 = 9;

export type Callbag<T = any, E = any> =
  & ((start: START, talkback: Callbag) => void)
  & ((data: DATA, payload?: T) => void)
  & ((end: END, error?: E) => void);

export type Factory = <T = any, E = any>(...args: Array<any>) => Callbag<T, E>;

export type Operator = <T = any, E = any>(...args: Array<any>) => (source: Callbag) => Callbag<T, E>;
