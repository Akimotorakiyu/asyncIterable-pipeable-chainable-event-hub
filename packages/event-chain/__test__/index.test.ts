import { EventLite } from "../index";

describe("on", () => {
  test("reactive", () => {
    const eventLite = new EventLite();

    const r = Math.random();

    const someEvent = eventLite.eventHandle("eventName");
    someEvent()
      .handleOn((n) => {
        expect(n).toBe(r);
      })
      .handleEmit(r);
  });
});

export {};
