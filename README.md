# asyncIterable-pipeable-chainable-event-hub

![CI/test](https://github.com/Akimotorakiyu/asyncIterable-pipeable-chainable-event-hub/workflows/CI/test/badge.svg)

`chainable`, `asyncIterable`, `pipeable` with `type infer`

it will be useful when work with `EventEmitter`, `rxjs`, `Socket (Socket extends EventEmitter)` or other `event driven` bussiness.

## Example

### Create an instance

create an `EventLite` instance

```ts
import { EventLite } from "asyncIterable-pipeable-chainable-event-hub";

const eventLite = new EventLite();
```

optional but useful `event hub`

```ts
const someEvent = eventLite.event("eventName")<[number, string]>();
```

### Emit

`emit` on anywhere

```ts
let i = 0;
setInterval(() => {
  // with type check
  someEvent.typedEmit(++i, i + "");
  // or without type check
  eventLite.emit("eventName", ++i, i + "");
}, 1000);
```

### Add listener

`chainable` and `with type infer`

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
  .typedRemove(undefined);

// or
eventLite
  .event("eventName")<[number, string]>()
  .typedOn(console.info)
  .typedOnce(console.log)
  .typedRemove(undefined);
```

### Async Iterable

`asyncIterable` and `with type infer`

```ts
for await (const { data, cancel } of someEvent.iterable()) {
  console.log(data);
}
```

### Pipeable

`pipeable` and `with type infer`

```ts
const followEvent = someEvent
  .typedPipe((n, s) => {
    return n;
  })
  .typedOn(console.info)
  .typedOnce(console.log)
  .typedRemove(undefined);
```

`connect` and `pipe` to a another or a new EventLite instance

```ts
const followEventLite = someEvent
  .typedConnect()
  .typedOn(console.info)
  .typedOnce(console.log)
  .typedRemove(undefined).eventLite;
```

## Note: about remove

`remove` function have two arg, first one is `event key`,secondone is `event listener` callback, `typedRemove` just need the second arg of `remove`.

```ts
// just remove eventListener from listeners list of the event for `event key`
eventLite.remove("event key", eventListener);

// remove all eventListener from listeners list of the event for `event key`
eventLite.remove("event key", undefined);

// remove eventListener from listeners list of all event
eventLite.remove(undefined, eventListener);
```
