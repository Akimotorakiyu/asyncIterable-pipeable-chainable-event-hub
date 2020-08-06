import { EventLite } from "event-chain";

const eventLite = new EventLite();

const someEvent = eventLite.event("eventName")<[number, string]>();

let i = 0;

setInterval(() => {
  // with type check
  someEvent.typedEmit(++i, i + "");
}, 1000);

// or
someEvent.typedOn(console.info).typedOnce(console.log).typedRemove(undefined);

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

async function name() {
  for await (const iterator of someEvent.iterable()) {
    console.log(iterator);
  }
}

name();

const follow = someEvent
  .typedPipe("follow", (n, s) => {
    return n;
  })
  .typedOn(console.info)
  .typedOnce(console.log)
  .typedRemove(undefined);
