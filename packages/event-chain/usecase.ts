import { EventLite } from "./index";

const eventLite = new EventLite();

const someEvent = eventLite.eventHandle("eventName")<[number, string]>();

let i = 0;

setInterval(() => {
  // with type check
  someEvent.handleEmit(++i, i + "");
  // or without type check
  eventLite.emit("eventName", ++i, i + "");
}, 1000);

// or
someEvent
  .handleOn(console.info)
  .handleOnce(console.log)
  .handleRemove(undefined);

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

async function name() {
  for await (const { data, cancel } of someEvent.handleAsyncIterable()) {
    console.log(data);
  }
}

name();

const follow = someEvent
  .handlePipe((n, s) => {
    return n;
  }, "follow")
  .handleOn(console.info)
  .handleOnce(console.log)
  .handleRemove(undefined);

const followEventLite = someEvent
  .handleConnect()
  .handleOn(console.info)
  .handleOnce(console.log)
  .handleRemove(undefined);

const eventListener = console.log;

// just remove eventListener from listeners list of the event for `event key`
eventLite.remove("event key", eventListener);

// remove all eventListener from listeners list of the event for `event key`
eventLite.remove("event key", undefined);

// remove eventListener from listeners list of all event
eventLite.remove(undefined, eventListener);
