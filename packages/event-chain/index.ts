export type CallBack<Args extends unknown[], V = unknown> = (
  ...args: Args
) => V;
export type CallBackSet = Set<CallBack<unknown[]>>;

class EventHandle<Args extends unknown[], E> {
  constructor(public eventLite: EventLite, public event: E) {}

  handleOn(fn: CallBack<Args>) {
    this.eventLite.on(this.event, fn);
    return this;
  }

  handleOnCancelable(fn: CallBack<Args>) {
    this.eventLite.on(this.event, fn);
    return {
      cancel: () => {
        this.handleRemove(fn);
        return this;
      },
      eventHandle: this,
    };
  }

  handleOnce(fn: CallBack<Args>) {
    this.eventLite.once(this.event, fn);
    return this;
  }

  handleOnceCancelable(fn: CallBack<Args>) {
    this.eventLite.once(this.event, fn);
    return {
      cancel: () => {
        this.handleRemove(fn);
        return this;
      },
      eventHandle: this,
    };
  }

  handleRemove(fn: CallBack<Args> | undefined) {
    this.eventLite.remove(this.event, fn);
    return this;
  }

  handleEmit(...args: Args) {
    this.eventLite.emit(this.event, ...args);
    return this;
  }

  handlePipe<V, F>(fn: CallBack<Args, V>, follow: F) {
    return this.eventLite.pipe(this.event, fn, follow);
  }

  handleConnect() {
    return this.eventLite.connect<Args, E>(this.event);
  }

  handleAsyncIterable<R = unknown>() {
    return this.eventLite.asyncIterable<Args, R, E>(this.event);
  }

  handelePromise() {
    return this.eventLite.promise(this.event)<Args>();
  }
}

/**
 *
 *
 * @export
 * @class EventLite
 */
export class EventLite {
  constructor() {}
  doMap = new Map<unknown, CallBackSet>();
  doOnceMap = new Map<unknown, CallBackSet>();

  /**
   *
   *
   * @template E typeof event key
   * @param {E} event event key
   * @returns typed handler
   * @memberof EventLite
   */
  eventHandle<E>(this: EventLite, event: E) {
    return <Args extends unknown[]>() => {
      return new EventHandle<Args, E>(this, event);
    };
  }

  promise<E>(this: EventLite, event: E, timeout: number = 0) {
    return <Args extends unknown[]>() => {
      return new Promise<Args>((resolve, reject) => {
        const eventHandle = this.eventHandle(event)<Args>();

        const handle = (...args: Args) => {
          clearTimeout(h);
          resolve(args);
        };

        const h = setTimeout(() => {
          eventHandle.handleRemove(handle);
          reject("timeout");
        }, timeout);

        eventHandle.handleOnce(handle);
      });
    };
  }

  /**
   *
   *
   * @template Args typeof args for callback
   * @template E typeof event key
   * @param {E} event event key
   * @param {CallBack<Args>} fn callback
   * @returns
   * @memberof EventLite
   */
  on<Args extends unknown[], E>(this: EventLite, event: E, fn: CallBack<Args>) {
    const map = this.doMap;
    let callBackSet: CallBackSet;

    if (!(callBackSet = map.get(event))) {
      map.set(event, (callBackSet = new Set()));
    }
    callBackSet.add(fn);

    return this;
  }

  /**
   *
   *
   * @template Args typeof args for callback
   * @template E typeof event key
   * @param {E} event event key
   * @param {CallBack<Args>} fn callback
   * @returns
   * @memberof EventLite
   */
  handleOn<Args extends unknown[], E>(
    this: EventLite,
    event: E,
    fn: CallBack<Args>
  ) {
    this.on(event, fn);
    return new EventHandle<Args, E>(this, event);
  }

  /**
   *
   *
   * @template Args typeof args for callback
   * @template E  typeof event key
   * @param {E} event event key
   * @param {CallBack<Args>} fn callback
   * @returns
   * @memberof EventLite
   */
  once<Args extends unknown[], E>(
    this: EventLite,
    event: E,
    fn: CallBack<Args>
  ) {
    const map = this.doOnceMap;
    let callBackSet: CallBackSet;

    if (!(callBackSet = map.get(event))) {
      map.set(event, (callBackSet = new Set()));
    }

    callBackSet.add(fn);
    return new EventHandle<Args, E>(this, event);
  }

  /**
   *
   *
   * @template Args typeof args for callback
   * @template E  typeof event key
   * @param {E} event event key
   * @param {CallBack<Args>} fn callback
   * @returns
   * @memberof EventLite
   */
  handleOnce<Args extends unknown[], E>(
    this: EventLite,
    event: E,
    fn: CallBack<Args>
  ) {
    this.handleOnce(event, fn);
    return new EventHandle<Args, E>(this, event);
  }

  /**
   *
   *
   * @template Args typeof args for callback
   * @template E typeof event key
   * @param {E} event event key
   * @param {...Args} args args
   * @returns
   * @memberof EventLite
   */
  emit<Args extends unknown[], E>(this: EventLite, event: E, ...args: Args) {
    const doOnce = this.doOnceMap.get(event);

    this.doMap.get(event)?.forEach((fn) => {
      doOnce?.delete(fn);
      fn(...args);
    });

    doOnce?.forEach((fn) => {
      fn(...args);
    });

    this.doOnceMap.delete(event);

    return new EventHandle<Args, E>(this, event);
  }

  /**
   *
   *
   * @template Args typeof args for callback
   * @template E typeof event key
   * @param {E} event event key
   * @param {...Args} args args
   * @returns
   * @memberof EventLite
   */
  handleEmit<Args extends unknown[], E>(
    this: EventLite,
    event: E,
    ...args: Args
  ) {
    this.emit(event, ...args);

    return new EventHandle<Args, E>(this, event);
  }

  /**
   *
   *
   * @template Args typeof args for callback
   * @template E typeof event key
   * @param {(E | undefined)} event event key
   * @param {(CallBack<Args> | undefined)} fn callback
   * @returns current EventLite instance
   * @memberof EventLite
   */
  remove<Args extends unknown[], E>(
    this: EventLite,
    event: E | undefined,
    fn: CallBack<Args> | undefined
  ) {
    if (event && fn) {
      this.doMap.get(event)?.delete(fn);
      this.doOnceMap.get(event)?.delete(fn);
    } else if (fn) {
      this.doMap.forEach((set) => {
        set.delete(fn);
      });
      this.doOnceMap.forEach((set) => {
        set.delete(fn);
      });
    } else if (event) {
      this.doMap.delete(event);
      this.doOnceMap.delete(event);
    }

    return this;
  }

  pipe<Args extends unknown[], V, E, F>(
    this: EventLite,
    event: E,
    fn: CallBack<Args, V>,
    follow: F
  ) {
    this.on<Args, E>(event, (...args) => {
      const value = fn(...args);
      this.emit(follow, value);
    });

    return this;
  }

  handlePipe<Args extends unknown[], V, E, F>(
    this: EventLite,
    event: E,
    fn: CallBack<Args, V>,
    follow: F
  ) {
    this.pipe(event, fn, follow);
    return new EventHandle<[V], F>(this, follow);
  }

  connect<Args extends unknown[], E = unknown>(
    this: EventLite,
    event: E,
    eventLite = new EventLite()
  ) {
    const connectionPoint = eventLite.eventHandle(event)<Args>();

    this.eventHandle(event)<Args>().handleOn((...args) => {
      connectionPoint.handleEmit(...args);
    });

    return connectionPoint;
  }

  async *asyncIterable<Args extends unknown[], R = unknown, E = unknown>(
    this: EventLite,
    event: E
  ) {
    let resolverPool: [
      (args: { cancel: (reason: R) => void; data: Args }) => void,
      (reason: R) => void
    ][] = [];
    const pool: Args[] = [];

    function recive(...args: Args) {
      pool.push(args);
      deal();
    }

    this.on(event, recive);

    let status = true;
    const cancel = (reason: R) => {
      status = false;
      this.remove(event, recive);
      deal();

      resolverPool.forEach(([resolve, reject]) => {
        reject(reason);
      });

      resolverPool.length = 0;
      pool.length = 0;
    };

    const deal = () => {
      while (resolverPool.length && pool.length) {
        const [resolve] = resolverPool.shift();
        const args = pool.shift();
        resolve({
          data: args,
          cancel,
        });
      }
    };

    while (status) {
      yield new Promise<{ cancel: (reason: R) => void; data: Args }>(
        (rsolve, reject) => {
          resolverPool.push([rsolve, reject]);
          deal();
        }
      );
    }
  }
}

export type CallBackWithCancel<Args extends unknown[], E, V = unknown> = (
  eventWatcherHandle: EventWatcherHandle<Args, E>,
  ...args: Args
) => V;
// export type CallBackSet = Set<CallBack<unknown[]>>;

class EventWatcherHandle<Args extends unknown[], E> {
  constructor(
    public eventWatcher: EventWatcher,
    public event: E,
    public fn: CallBackWithCancel<Args, E>
  ) {}

  cancel() {
    this.eventWatcher.remove(event, this.fn);
    return this;
  }

  start() {
    const map = this.eventWatcher.doMap;
    let callBackSet: CallBackSet;
    if (!(callBackSet = map.get(event))) {
      map.set(event, (callBackSet = new Set()));
    }
    callBackSet.add(this.fn);
    return this;
  }

  emit(...args: Args) {
    this.eventWatcher.emit(this.event, ...args);
  }
}

export class EventWatcher {
  doMap = new Map<unknown, CallBackSet>();
  constructor() {}
  /**
   *
   *
   * @template Args typeof args for callback
   * @template E typeof event key
   * @param {E} event event key
   * @param {CallBack<Args>} fn callback
   * @returns
   * @memberof EventLite
   */
  on<Args extends unknown[], E>(event: E, fn: CallBackWithCancel<Args, E>) {
    return new EventWatcherHandle(this, event, fn).start();
  }

  /**
   *
   *
   * @template Args typeof args for callback
   * @template E typeof event key
   * @param {E} event event key
   * @param {...Args} args args
   * @returns
   * @memberof EventLite
   */
  emit<Args extends unknown[], E>(event: E, ...args: Args) {
    this.doMap.get(event)?.forEach((fn) => {
      fn(new EventWatcherHandle(this, event, fn), ...args);
    });

    return this;
  }

  /**
   *
   *
   * @template Args typeof args for callback
   * @template E typeof event key
   * @param {(E | undefined)} event event key
   * @param {(CallBack<Args> | undefined)} fn callback
   * @returns current EventLite instance
   * @memberof EventLite
   */
  remove<Args extends unknown[], E>(
    event: E | undefined,
    fn: CallBack<Args> | undefined
  ) {
    if (event && fn) {
      this.doMap.get(event)?.delete(fn);
    } else if (fn) {
      this.doMap.forEach((set) => {
        set.delete(fn);
      });
    } else if (event) {
      this.doMap.delete(event);
    }

    return this;
  }
}
