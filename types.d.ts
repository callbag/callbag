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

export type CallbagArgs<I, O> =
  // handshake:
  | [type: START, talkback: Callbag<O, I>]
  // data from source:
  | [type: DATA, data: I]
  // pull request:
  | [type: DATA]
  // error:
  | [type: END, error: unknown]
  // end without error:
  | [type: END, _?: undefined]

/**
 * A Callbag dynamically receives input of type I
 * and dynamically delivers output of type O
 */
export interface Callbag<I, O> {
  (...args: CallbagArgs<I, O>): void
}

/**
 * A source only delivers data
 */
export interface Source<T> extends Callbag<never, T> {}

/**
 * A sink only receives data
 */
export interface Sink<T> extends Callbag<T, never> {}

export type SourceFactory<T> = (...args: Array<any>) => Source<T>;

export type SourceOperator<T, R> = (
  ...args: Array<any>
) => (source: Source<T>) => Source<R>;

/**
 * Conditional types for contained type retrieval
 */
export type UnwrapSource<T extends Source<any>> = T extends Source<infer R> ? R : never;
export type UnwrapSink<T extends Sink<any>> = T extends Sink<infer R> ? R : never;
