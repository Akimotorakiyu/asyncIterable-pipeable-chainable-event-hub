export type CallBack<Args extends unknown[], V = unknown> = (
  ...args: Args
) => V;
export type CallBackSet = Set<CallBack<unknown[]>>;

class EventHandle<Args extends unknown[], E> {
  constructor(public eventLite: EventLite, public event: E) {}
  handleOn(fn: CallBack<Args>) {
    this.eventLite.on(event, fn);
    return this;
  }

  handleOnce(fn: CallBack<Args>) {
    this.eventLite.once(event, fn);
    return this;
  }

  handleRemove(fn: CallBack<Args> | undefined) {
    this.eventLite.remove(event, fn);
    return this;
  }

  handleEmit(...args: Args) {
    this.eventLite.emit(event, ...args);
    return this;
  }

  handlePipe<V, E>(fn: CallBack<Args, V>, follow?: E) {
    const pipethis = this.eventLite.eventHandle(follow ?? Symbol())<[V]>();

    this.handleOn((...args) => {
      const value = fn(...args);
      pipethis.handleEmit(value);
    });

    return pipethis;
  }

  handleConnect() {
    return this.eventLite.connect<Args, E>(this.event);
  }

  async *iterable<R>() {
    let resolverPool: [
      (args: { cancel: (reason: R) => void; data: Args }) => void,
      (reason: R) => void
    ][] = [];
    const pool: Args[] = [];

    function recive(...args: Args) {
      pool.push(args);
      deal();
    }

    this.handleOn(recive);

    let status = true;
    const cancel = (reason: R) => {
      status = false;
      this.handleRemove(recive);
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
   * @template E typeof event key
   * @param {E} event event key
   * @param {...Args} args args
   * @returns
   * @memberof EventLite
   */
  emit<Args extends unknown[], E>(this: EventLite, event: E, ...args: Args) {
    this.doMap.get(event)?.forEach((fn) => {
      fn(...args);
    });

    this.doOnceMap.get(event)?.forEach((fn) => {
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
}
