# async-iterable-pipeable-chainable-event-hub

![CI/test](https://github.com/Akimotorakiyu/async-iterable-pipeable-chainable-event-hub/workflows/CI/test/badge.svg)

`chainable`, `async`, `iterable`, `pipeable` with `type infer`

It will be useful when work with `EventEmitter`, `rxjs`, `Socket (Socket extends EventEmitter)` or other `event driven` bussiness.

## index.d.ts

```ts
export declare type CallBack<Args extends unknown[], V = void> = (
  ...args: Args
) => V;
export declare type CallBackSet = Set<CallBack<unknown[]>>;

export declare class EventLite {
  doMap: Map<unknown, CallBackSet>;
  constructor();
  on<Args extends unknown[], E>(
    event: E,
    genFn: (eventWatcher: EventWatcher<Args, E>) => CallBack<Args>
  ): any;
  onLite<Args extends unknown[], E>(
    event: E,
    fn: CallBack<Args>
  ): EventWatcher<unknown[], E>;
  remove<Args extends unknown[], E>(
    event: E | undefined,
    fn: CallBack<Args> | undefined
  ): this;
  emit<Args extends unknown[], E>(event: E, ...args: Args): this;
  promise<E>(
    event: E,
    timeout?: number
  ): <Args extends unknown[]>() => Promise<Args>;
  pipe<Args extends unknown[], V, E, F>(
    event: E,
    fn: CallBack<Args, V>,
    follow: F
  ): {
    socket: EventWatcher<Args, E>;
    follow: EventHandle<[V], E>;
  };
  connect<Args extends unknown[], E = unknown>(
    event: E,
    eventLite?: EventLite
  ): {
    src: EventHandle<Args, E>;
    socket: EventWatcher<Args, E>;
  };
  asyncIterable<Args extends unknown[], R = unknown, E = unknown>(
    event: E
  ): AsyncGenerator<
    {
      cancel: (reason: R) => void;
      args: Args;
    },
    void,
    unknown
  >;
  event<E>(event: E): <Args extends unknown[]>() => EventHandle<Args, E>;
}

export declare class EventHandle<Args extends unknown[], E> {
  eventLite: EventLite;
  event: E;
  constructor(eventLite: EventLite, event: E);
  on(genFn: (eventWatcher: EventWatcher<Args, E>) => CallBack<Args>): any;
  onLite(fn: CallBack<Args>): EventWatcher<unknown[], E>;
  emit(...args: Args): this;
  clear(): void;
  promise(timeout?: number): Promise<Args>;
  connect(
    eventLite?: EventLite
  ): {
    src: EventHandle<unknown[], EventLite>;
    socket: EventWatcher<unknown[], EventLite>;
  };
  pipe<V, F>(
    fn: CallBack<Args, V>,
    follow: F
  ): {
    socket: EventWatcher<Args, E>;
    follow: EventHandle<[V], E>;
  };
}

export declare class EventWatcher<Args extends unknown[], E> {
  eventLite: EventLite;
  event: E;
  fn: CallBack<Args>;
  eventHandle: EventHandle<Args, E>;
  constructor(
    eventLite: EventLite,
    event: E,
    genFn: (eventWatcher: EventWatcher<Args, E>) => CallBack<Args>
  );
  start(): this;
  cancal(): this;
  emit(...args: Args): this;
}
```
