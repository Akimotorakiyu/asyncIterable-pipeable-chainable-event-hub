# asyncIterable-pipeable-chainable-event-hub

![CI/test](https://github.com/Akimotorakiyu/asyncIterable-pipeable-chainable-event-hub/workflows/CI/test/badge.svg)

`chainable`, `asyncIterable`, `pipeable` with `type infer`

it will be useful when work with `EventEmitter`, `rxjs`, `Socket (Socket extends EventEmitter)` or other `event driven` bussiness.

## hwo to use

create an `EventLite` instance

```ts
import { EventLite } from "event-chain";

const eventLite = new EventLite();
```

optional but useful `event hub`

```ts
const someEvent = eventLite.event("eventName")<[number, string]>();
```

`emit` on anywhere

```ts
let i = 0;
setInterval(() => {
  // with type check
  someEvent.typedEmit(++i, i + "");
}, 1000);
```

deal event, `chainable` and `with type infer`

```ts
// or
someEvent.typedOn(console.info).typedOnce(console.log).typedRemove();

// or
eventLite
  .on("eventName", (n: number, s: string) => {
    console.log(n, s);
  })
  .typedOn(console.info)
  .typedOnce(console.log)
  .typedRemove();

// or
eventLite
  .event("eventName")<[number, string]>()
  .typedOn(console.info)
  .typedOnce(console.log)
  .typedRemove();
```

`asyncIterable` and `with type infer`

```ts
for await (const iterator of someEvent.iterable()) {
  console.log(iterator);
}
```

`pipeable` and `with type infer`

```ts
const follow = someEvent
  .typedPipe("follow", (n, s) => {
    return n;
  })
  .typedOn(console.info)
  .typedOnce(console.log)
  .typedRemove();
```
