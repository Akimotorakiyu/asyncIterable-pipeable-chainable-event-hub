import { EventLite } from "../index";

describe("on", () => {
  test("reactive", () => {
    const eventLite = new EventLite();

    const r = Math.random();

    const someEvent = eventLite.event("eventName")<[number]>();
    someEvent.onLite((n) => {
      expect(n).toBe(r);
    });
  });
});

export {};
