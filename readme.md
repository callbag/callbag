# Callbag 👜

> A standard for JS callbacks that enables lightweight observables and iterables

* Minimal overhead streams, Iterables, Observables, AsyncIterables, etc
* Modular (each operator is its own npm package)
* Light (few memory allocations)
* Not a library, just a standard (for real libraries, see [callbag-basics](https://github.com/staltz/callbag-basics) or the [wiki](https://github.com/callbag/callbag/wiki))
* Easy to create your own utilities, [read how here](https://github.com/staltz/callbag/blob/master/getting-started.md)

Read also the [announcement blog post](https://staltz.com/why-we-need-callbags.html) and this [introductory blog post](http://blog.krawaller.se/posts/callbags-introduction/).

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

### Protocol

The capitalized keywords used here follow [IETF's RFC 2119](https://www.ietf.org/rfc/rfc2119.txt).

**Greets**: `(type: 0, cb: Callbag) => void`

A callbag is *greeted* when the first argument is `0` and the second argument is another callbag (a function).

**Handshake**

When a source is greeted and given a sink as payload, the sink MUST be greeted back with a callbag payload that is either the source itself or another callbag (known as the "talkback"). In other words, greets are mutual. Reciprocal greeting is called a *handshake*.

**Termination**: `(type: 2, err?: any) => void`

A callbag is *terminated* when the first argument is `2` and the second argument is either undefined (signalling termination due to success) or any truthy value (signalling termination due to failure).

After the handshake, the source MAY terminate the sink. Alternatively, the sink MAY terminate the source after the handshake has occurred. If the source terminates the sink, then the sink SHOULD NOT terminate the source, and vice-versa. In other words, termination SHOULD NOT be mutual.

**Data delivery** `(type: 1, data: any) => void`

Amount of deliveries:

- A callbag (either sink or source) MAY be delivered data, once or multiple times

Window of valid deliveries:

- A callbag MUST NOT be delivered data before it has been greeted
- A callbag MUST NOT be delivered data after it has been terminated
- A sink MUST NOT be delivered data after it terminates its source

**Reserved codes**

A callbag SHOULD NOT be called with any of these numbers as the first argument: `3`, `4`, `5`, `6`, `7`, `8`, `9`. Those are called *reserved codes*. A callbag MAY be called with codes other than those in the range `[0-9]`, but this specification makes no claims in those cases.

## Legal

This project is offered to the Public Domain in order to allow free use by interested parties who want to create compatible implementations. For details see `COPYING` and `CopyrightWaivers.txt`.

<p xmlns:dct="http://purl.org/dc/terms/" xmlns:vcard="http://www.w3.org/2001/vcard-rdf/3.0#">
  <a rel="license" href="http://creativecommons.org/publicdomain/zero/1.0/">
    <img src="http://i.creativecommons.org/p/zero/1.0/88x31.png" style="border-style: none;" alt="CC0" />
  </a>
  <br />
  To the extent possible under law,
  <a rel="dct:publisher" href="https://github.com/callbag/callbag/blob/master/CopyrightWaivers.txt">
    <span property="dct:title">Callbag Standard Special Interest Group</span></a>
  has waived all copyright and related or neighboring rights to
  <span property="dct:title">Callbag Standard</span>.
  This work is published from:
  <span property="vcard:Country" datatype="dct:ISO3166" content="FI" about="http://github.com/callbag/callbag">Finland</span>.
</p>
