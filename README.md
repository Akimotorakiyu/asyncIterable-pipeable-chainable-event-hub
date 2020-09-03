# asyncIterable-pipeable-chainable-event-hub

![CI/test](https://github.com/Akimotorakiyu/asyncIterable-pipeable-chainable-event-hub/workflows/CI/test/badge.svg)

`chainable`, `asyncIterable`, `pipeable` with `type infer`

It will be useful when work with `EventEmitter`, `rxjs`, `Socket (Socket extends EventEmitter)` or other `event driven` bussiness.

## Example

```bash
npm install asyncIterable-pipeable-chainable-event-hub
#or
yarn add asynciterable-pipeable-chainable-event-hub
```

### Create an instance

create an `EventLite` instance

```ts
import { EventLite } from "asyncIterable-pipeable-chainable-event-hub";

const eventLite = new EventLite();
```

optional but useful `event hub`

```ts
const someEvent = eventLite.eventHandle("eventName")<[number, string]>();
```

### Emit

`emit` on anywhere

```ts
let i = 0;
setInterval(() => {
  // with type check
  someEvent.handleEmit(++i, i + "");
  // or without type check
  eventLite.emit("eventName", ++i, i + "");
}, 1000);
```

### Add listener

`chainable` and `with type infer`

```ts
// or
someEvent.handleOn(console.info).handleOnce(console.log).handleRemove();

// or
eventLite
  .handleOn("eventName", (n: number, s: string) => {
    console.log(n, s);
  })
  .handleOn(console.info)
  .handleOnce(console.log)
  .handleRemove(undefined);

// or
eventLite
  .eventHandle("eventName")<[number, string]>()
  .handleOn(console.info)
  .handleOnce(console.log)
  .handleRemove(undefined);
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
  .handlePipe((n, s) => {
    return n;
  }, "follow")
  .handleOn(console.info)
  .handleOnce(console.log)
  .handleRemove(undefined);
```

`connect` and `pipe` to a another or a new EventLite instance

```ts
const followEventLite = someEvent
  .handleConnect()
  .handleOn(console.info)
  .handleOnce(console.log)
  .handleRemove(undefined).eventLite;
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
