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

/**
 * A Callbag dynamically receives input of type I
 * and dynamically delivers output of type O
 */
export type Callbag<I, O> = {
  (t: START, d: Callbag<O, I>): void;
  (t: DATA, d: I): void;
  (t: END, d?: any): void;
};

/**
 * A source only delivers data
 */
export type Source<T> = Callbag<void, T>;

/**
 * A sink only receives data
 */
export type Sink<T> = Callbag<T, void>;

export type SourceFactory<T> = (...args: Array<any>) => Source<T>;

export type SourceOperator<T, R> = (
  ...args: Array<any>
) => (source: Source<T>) => Source<R>;

/**
 * Conditional types for contained type retrieval
 */
export type UnwrapSource<T extends Source<any>> = T extends Source<infer R> ? R : never;
export type UnwrapSink<T extends Sink<any>> = T extends Sink<infer R> ? R : never;
