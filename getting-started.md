# Creating your own utilities

The Callbag spec is unopinionated and doesn't dictate how the implementation should go. This guide gives opinionated examples of how to implement some Callbag patterns. It helps you to get a concrete understanding how to use the spec.

## Handshakes and talkbacks

A handshake is when the sink greets the source and the source greets the sink back. Usually the order is `source(0, sink)` then inside the implementation of `source` we call `sink(0, talkback)`. Notice that `talkback` is the payload. It is possible that `talkback === source`, but often the talkback will be another function.

Talkbacks receive `type=1` and `type=2` messages from the sink, but never `type=0`, because the handshake has already occurred (it's just two `type=0` messages, not more than two).

We will see later with examples how this is important.

## Creating a sink

Sinks are easy to create because they are meant for just receiving data, and require less code to work. Sinks can be either listeners or pullers. Let's first implement a listener sink.

### Listener

A listener sink is a callbag function:

```js
function sink(type, data) {
}
```

The names of the arguments doesn't matter, but I (@staltz) often use `type`/`data` or `t`/`d`. When the listener gets called with `type` 0, the `data` is the talkback.

```js
function sink(type, data) {
  if (type === 0) {
    const talkback = data;
    // ...
  }
}
```

The sink can use this talkback to terminate the relationship with the source. For instance, we can terminate after 3 seconds have passed. 

```js
function sink(type, data) {
  if (type === 0) {
    const talkback = data;
    setTimeout(() => talkback(2), 3000);
  }
}
```

To make the sink actually receive data, we need to pick `type=1`:

```js
function sink(type, data) {
  if (type === 0) {
    const talkback = data;
    setTimeout(() => talkback(2), 3000);
  }
  if (type === 1) {
    // consume the data here, for instance:
    console.log(data);
  }
}
```

If the sink receives `type=2`, it means the source is terminating the sink, and it's the right moment to dispose of resources. For instance, we should cancel that setTimeout, but for that we need to keep a reference to the returned timeout handle:

```js
let handle;
function sink(type, data) {
  if (type === 0) {
    const talkback = data;
    handle = setTimeout(() => talkback(2), 3000);
  }
  if (type === 1) {
    console.log(data);
  }
  if (type === 2) {
    clearTimeout(handle);
  }
}
```

Because it's common to keep state in a closure, we convert the code above into a sink factory function:

```js
function makeSink() {
  let handle;
  return function sink(type, data) {
    if (type === 0) {
      const talkback = data;
      handle = setTimeout(() => talkback(2), 3000);
    } 
    if (type === 1) {
      console.log(data);
    }
    if (type === 2) {
      clearTimeout(handle);
    }
  }
}
```

You can also store the talkback in the closure. Or, a different implementation is through classes:

```js
class Sink {
  constructor() {
    this.handle = null; 
    this.talkback = null;
  }

  sink(type, data) {
    if (type === 0) {
      this.talkback = data;
      this.handle = setTimeout(() => this.talkback(2), 3000);
    } 
    if (type === 1) {
      console.log(data);
    }
    if (type === 2) {
      clearTimeout(this.handle);
    }
  }
}
```

When using the sink from a class, remember to (1) create an instance of the class, (2) pass the callbag method using `.bind(instance)`.

### Puller

A puller sink is also a listener, but it can call the `talkback` with `type=1` as argument. In the example below, the puller requests data from the source every 1 second:

```js
let handle;
function sink(type, data) {
  if (type === 0) {
    const talkback = data;
    handle = setInterval(() => talkback(1), 1000);
  }
  if (type === 1) {
    console.log(data);
  }
  if (type === 2) {
    clearInterval(handle);
  }
}
```

## Creating a source

Now that you know how to create sinks (consumers of data), we can create sources (producers of data) of two modes: listenables or pullables.

### Listenable

A listenable source sends data to a sink regardless of requests `type=1` from the sink to the source. A basic example is to create a listenable source that wraps the `setInterval` API. In the example below, we will send `null` to the sink every 1 second:

```js
function source(type, data) {
  if (type === 0) {
    const sink = data;
    setInterval(() => {
      sink(1, null);
    }, 1000);
  }
}
```

We are missing something important, though: greeting the sink with a talkback function (see Handshake section above).

```js
function source(type, data) {
  if (type === 0) {
    const sink = data;
    setInterval(() => {
      sink(1, null);
    }, 1000);
    sink(0, /* talkback callbag here */);
  }
}
```

Now the question is: what should be the talkback? Its purpose is for the sink to send `type=2` messages upwards, for cancelling the setInterval for instance. If we make `talkback=source`, then we lose support for multiple sinks. How? Think about it: if the source is called multiple times with `type=0` and a sink payload, then we have called `setInterval` multiple times. When one of those sinks sends `type=2` upwards, we want to stop the setInterval only for that sink, not for all of them. This is why we need a talkback for every different sink. Below, we make the talkback recognize `type=2` messages and clearInterval:

```js
function source(type, data) {
  if (type === 0) {
    const sink = data;
    let handle = setInterval(() => {
      sink(1, null);
    }, 1000);
    const talkback = (t, d) => {
      if (t === 2) clearInterval(handle);
    };
    sink(0, talkback);
  }
}
```

We don't need to handle `type=1` neither `type=2` for the `source` because its only purpose is to setup the setInterval and then plug the sink with the talkback. Basically the sink thinks that the source is the talkback. It's so common to only handle `type=0` in sources, that we can rename its arguments to `start` and `sink`:

```js
function source(start, sink) {
  if (start !== 0) return;
  let handle = setInterval(() => {
    sink(1, null);
  }, 1000);
  const talkback = (t, d) => {
    if (t === 2) clearInterval(handle);
  };
  sink(0, talkback);
}
```

### Pullable

A pullable source differs from a listenable source in that it waits for the sink to send a `type=1` request to the talkback before sending a `type=1` response back. The example below sends numbers 10 until 20, only on demand:

```js
function source(start, sink) {
  if (start !== 0) return;
  let i = 10;
  const talkback = (t, d) => {
    if (t === 1) {
      if (i <= 20) sink(1, i++);
      else sink(2);
    }
  };
  sink(0, talkback);
}
```

Notice that in this case the talkback doesn't need to check `type=2` messages, because there is nothing to be disposed. Some pullable sources may have resources to be disposed upon `type=2`, though.

## Creating an operator

Operators are functions that take a source as input and return another source based on the first one. They are useful for creating transformation pipelines through a utility like [`pipe`](https://github.com/staltz/callbag-pipe). The Callbag spec itself doesn't dictate how you should create operators, but if you want to keep your operators interoperable with `pipe`, then follow the simple convention:

`const myOperator = args => inputSource => outputSource`

This way, when you call it in a pipe as `myOperator(args)`, it
's equivalent to putting `inputSource => outputSource` in the pipe:

```js
pipe(
  source,
  myOperator(args),
  iterate(x => console.log(x))
)
// same as...
pipe(
  source,
  inputSource => outputSource,
  iterate(x => console.log(x))
)
```

Let's see an example operator called `multiplyBy` that works on a source of numbers:

```js
const multiplyBy = factor => inputSource => {
  return function outputSource(start, outputSink) {
    if (start !== 0) return;
    inputSource(0, (t, d) => {
      if (t === 1) outputSink(1, d * factor);
      else outputSink(t, d);
    });
  };
}
```

Two patterns are worth remembering:

- Calling the operator returns `inputSource => outputSource`
- Inside the implementation of `outputSource`, call `inputSource`

The input source is called with `(t, d) => ...`, an anonymous sink that does the core logic of the operator. In this case, we multiply `inputSource` data by `factor`, and pass it to the output sink.

## Factories

Factories of sources are similar, but even simpler than operators. They just don't have `inputSource` arguments. So it's just:

`const myFactory = args => outputSource`

Examples are: [fromIter](https://github.com/staltz/callbag-from-iter), [fromObs](https://github.com/staltz/callbag-from-obs), [interval](https://github.com/staltz/callbag-interval), [combine](https://github.com/staltz/callbag-combine), [merge](https://github.com/staltz/callbag-merge).

## Inspiration

For more examples, look at real source code for some existing operators. Since it's often short, it's possible to understand quickly. Examples:

- [scan](https://github.com/staltz/callbag-scan)
- [take](https://github.com/staltz/callbag-take)
- [merge](https://github.com/staltz/callbag-merge)

