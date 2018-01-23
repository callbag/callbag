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

export type Callbag = (type: number, data: any) => void;
export type Factory = (...args: Array<any>) => Callbag;
export type Operator = (...args: Array<any>) => (source: Callbag) => Callbag;
