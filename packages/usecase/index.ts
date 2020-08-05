import { EventLite } from "event-chain";

const bus = new EventLite();

const test = bus.event("test")<[number, string]>();

async function name() {
  for await (const iterator of test.iterable()) {
    console.log(iterator);
    iterator;
  }
}

let i = 0;
setInterval(() => {
  test.typedemit(++i, i + "");
}, 1000);

name();
