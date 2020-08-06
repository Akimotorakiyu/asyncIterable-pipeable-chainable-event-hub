import { EventLite } from "../index";

describe("on", () => {
  test("reactive", () => {
    const eventLite = new EventLite();

    const r = Math.random();

    const someEvent = eventLite.event("eventName");
    someEvent()
      .typedOn((n) => {
        expect(n).toBe(r);
      })
      .typedEmit(r);
  });
});

export {};
