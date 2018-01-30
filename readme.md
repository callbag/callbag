# Callbag 👜

> A standard for JS callbacks that enables lightweight observables and iterables

* Minimal overhead streams, Iterables, Observables, AsyncIterables, etc
* Modular (each operator is its own npm package)
* Light (few memory allocations)
* Not a library, just a standard (for a real library, see [callbag-basics](https://github.com/staltz/callbag-basics))
* Easy to create your own utilities, [read how here](https://github.com/staltz/callbag/blob/master/getting-started.md)

## Summary

- Every producer of data is a function `(type: number, payload?: any) => void`
- Every consumer of data is a function `(type: number, payload?: any) => void`
- `type === 0` means "start" (a.k.a. "subscribe" on Observables)
- `type === 1` means "data" (a.k.a. "next" on Observers)
- `type === 2` means "end" (a.k.a. "unsubscribe" on Subscriptions)

## Specification

**`(type: number, payload?: any) => void`**

### Definitions

- *Callbag*: a function of signature (TypeScript syntax:) `(type: 0 | 1 | 2, payload?: any) => void`
- *Greet*: if a callbag is called with `0` as the first argument, we say "the callbag is greeted", while the code which performed the call "greets the callbag"
- *Deliver*: if a callbag is called with `1` as the first argument, we say "the callbag is delivered data", while the code which performed the call "delivers data to the callbag"
- *Terminate*: if a callbag is called with `2` as the first argument, we say "the callbag is terminated", while the code which performed the call "terminates the callbag"
- *Source*: a callbag which is expected to deliver data
- *Sink*: a callbag which is expected to be delivered data
- *Puller*: a sink that delivers data to a source
- *Pullable*: a source that delivers data to a sink for each time it is delivered data from the sink
- *Listener*: a sink that does not deliver data to the source
- *Listenable*: a source that delivers data to a sink, but ignores any data deliverd to it

### Protocol

The capitalized keywords used here follow [IETF's RFC 2119](https://www.ietf.org/rfc/rfc2119.txt).

**Greets**: `(type: 0, cb: Callbag) => void`

A callbag is *greeted* when the first argument is `0` and the second argument is another callbag (a function).

**Handshake**

When a source is greeted and given a sink as payload, the sink MUST be greeted back with a callbag payload that is either the source itself or another callbag (known as the "talkback"). In other words, greets are mutual. Reciprocal greeting is called "handshaking".

**Termination**: `(type: 2, err?: any) => void`

A callbag is *terminated* when the first argument is `2` and the second argument is either undefined (signalling successful termination) or any truthy value (signalling failed termination).

After a mutual greet between source and sink, the source MAY terminate the sink. Alternatively, the sink MAY terminate the source. If the source terminates the sink, then the sink SHOULD NOT terminate the source, and vice-versa. In other words, termination SHOULD NOT be mutual.

**Data delivery** `(type: 1, data: any) => void`

A sink MAY be delivered data, one or multiple times.

A source MUST NOT deliver data to a sink before handshake.
A source MUST not deliver data to a sink after terminating it.
A sink MUST NOT be delivered data after it terminates a source.

A source MAY be delivered data, one or multiple times. This possibility enables pullable sources which then deliver data to a sink. However, this spec puts no restriction on the ratio of source deliveries versus sink deliveries in a pull relationship between source and sink.

### Unspecified

A callbag SHOULD NOT be called with either of these numbers as the first argument: `3`, `4`, `5`, `6`, `7`, `8`, `9`. Those are called *reserved codes*.

## Legal

This project is offered to the Public Domain in order to allow free use by interested parties who want to create compatible implementations. For details see `COPYING` and `CopyrightWaivers.txt`.

<p xmlns:dct="http://purl.org/dc/terms/" xmlns:vcard="http://www.w3.org/2001/vcard-rdf/3.0#">
  <a rel="license" href="http://creativecommons.org/publicdomain/zero/1.0/">
    <img src="http://i.creativecommons.org/p/zero/1.0/88x31.png" style="border-style: none;" alt="CC0" />
  </a>
  <br />
  To the extent possible under law,
  <a rel="dct:publisher" href="http://github.com/callbag/callbag">
    <span property="dct:title">Callbag Standard Special Interest Group</span></a>
  has waived all copyright and related or neighboring rights to
  <span property="dct:title">Callbag Standard</span>.
  This work is published from:
  <span property="vcard:Country" datatype="dct:ISO3166" content="FI" about="http://github.com/callbag/callbag">Finland</span>.
</p>
