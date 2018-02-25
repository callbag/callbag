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

export type Callbag = (type: START | DATA | END, payload?: any) => void;

export type SourceTalkback =
& ((request: DATA) => void)
& ((terminate: END) => void);

export type SinkTalkback =
& ((start: START, sourceTalkback: SourceTalkback) => void)
& ((deliver: DATA, data: any) => void)
& ((terminate: END, error?: any) => void);

export type SourceInitiator = (type: START, payload: SinkTalkback) => void;

export type SinkConnector = (source: SourceInitiator) => SourceInitiator | void;

export type SourceFactory = (...args: any[]) => SourceInitiator;

export type Operator = (...args: any[]) => SinkConnector;
