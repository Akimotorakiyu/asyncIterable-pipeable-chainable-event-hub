export type CallBack<Args extends unknown[], V = void> = (...args: Args) => V;

export type CallBackSet = Set<CallBack<unknown[]>>;

export class EventLite {
  doMap = new Map<unknown, CallBackSet>();

  constructor() {}

  on<Args extends unknown[], E>(
    event: E,
    genFn: (eventWatcher: EventWatcher<Args, E>) => CallBack<Args>
  ) {
    return new EventWatcher(this, event, genFn).start();
  }

  onLite<Args extends unknown[], E>(event: E, fn: CallBack<Args>) {
    return new EventWatcher(this, event, (eventWatcher) => {
      return fn;
    }).start();
  }

  remove<Args extends unknown[], E>(
    event: E | undefined,
    fn: CallBack<Args> | undefined
  ) {
    if (event && fn) {
      const callBackSet = this.doMap.get(event);
      if (callBackSet) {
        callBackSet.delete(fn);
        if (!callBackSet.size) {
          this.doMap.delete(event);
        }
      }
    } else if (fn) {
      [...this.doMap.entries()].forEach(([eventKey, callBackSet]) => {
        callBackSet.delete(fn);
        if (!callBackSet.size) {
          this.doMap.delete(eventKey);
        }
      });
    } else if (event) {
      this.doMap.delete(event);
    }

    return this;
  }

  emit<Args extends unknown[], E>(event: E, ...args: Args) {
    this.doMap.get(event)?.forEach((fn) => {
      fn(...args);
    });
    return this;
  }

  promise<E>(event: E, timeout: number = -1) {
    return <Args extends unknown[]>() => {
      return new Promise<Args>((resolve, reject) => {
        if (timeout >= 0) {
          const h = setTimeout(() => {
            watcher.cancal();
            reject("timeout");
          }, timeout);
          const watcher = new EventWatcher<Args, E>(this, event, (watcher) => {
            return (...args) => {
              clearTimeout(h);
              resolve(args);
              watcher.cancal();
            };
          });
        } else {
          const watcher = new EventWatcher<Args, E>(this, event, (watcher) => {
            return (...args) => {
              resolve(args);
              watcher.cancal();
            };
          });
        }
      });
    };
  }

  pipe<Args extends unknown[], V, E, F>(
    event: E,
    fn: CallBack<Args, V>,
    follow: F
  ) {
    const watcher = new EventWatcher<Args, E>(this, event, (watcher) => {
      return (...args) => {
        const value = fn(...args);
        watcher.eventLite.emit(follow, value);
      };
    });

    return {
      socket: watcher,
      follow: new EventHandle<[V], E>(this, event),
    };
  }

  connect<Args extends unknown[], E = unknown>(
    event: E,
    eventLite = new EventLite()
  ) {
    const watcher = new EventWatcher<Args, E>(eventLite, event, (watcher) => {
      return (...args) => {
        watcher.emit(...args);
      };
    });

    return {
      src: new EventHandle<Args, E>(this, event),
      socket: watcher,
    };
  }

  async *asyncIterable<Args extends unknown[], R = unknown, E = unknown>(
    event: E
  ) {
    type MyAsyncIterator = {
      cancel: (reason: R) => void;
      args: Args;
    };

    let resolverPool: [
      (myAsyncIterator: MyAsyncIterator) => void,
      (reason: R) => void
    ][] = [];
    const argsPool: Args[] = [];

    const watcher = new EventWatcher<Args, E>(this, event, (watcher) => {
      return (...args) => {
        argsPool.push(args);
        deal();
      };
    });

    let status = true;

    const cancel = (reason: R) => {
      status = false;
      watcher.cancal();
      deal();

      resolverPool.forEach(([resolve, reject]) => {
        reject(reason);
      });

      resolverPool.length = 0;
      argsPool.length = 0;
    };

    const deal = () => {
      while (resolverPool.length && argsPool.length) {
        const [resolve, reject] = resolverPool.shift();
        const args = argsPool.shift();
        resolve({
          args,
          cancel,
        });
      }
    };

    while (status) {
      yield new Promise<MyAsyncIterator>((rsolve, reject) => {
        resolverPool.push([rsolve, reject]);
        deal();
      });
    }
  }

  event<E>(event: E) {
    return <Args extends unknown[]>() => {
      return new EventHandle<Args, E>(this, event);
    };
  }
}

export class EventHandle<Args extends unknown[], E> {
  constructor(public eventLite: EventLite, public event: E) {}

  on(genFn: (eventWatcher: EventWatcher<Args, E>) => CallBack<Args>) {
    const watcher = this.eventLite.on(this.event, genFn);
    return watcher;
  }

  onLite(fn: CallBack<Args>) {
    const watcher = this.eventLite.onLite(this.event, fn);
    return watcher;
  }

  emit(...args: Args) {
    this.eventLite.emit(this.event, ...args);
    return this;
  }

  clear() {
    this.eventLite.remove(this.event, undefined);
  }

  promise(timeout = 0) {
    return this.eventLite.promise(this.event, timeout)<Args>();
  }

  connect(eventLite = new EventLite()) {
    return this.eventLite.connect(eventLite);
  }

  pipe<V, F>(fn: CallBack<Args, V>, follow: F) {
    return this.eventLite.pipe(this.event, fn, follow);
  }
}

export class EventWatcher<Args extends unknown[], E> {
  fn: CallBack<Args>;
  eventHandle: EventHandle<Args, E>;
  constructor(
    public eventLite: EventLite,
    public event: E,
    genFn: (eventWatcher: EventWatcher<Args, E>) => CallBack<Args>
  ) {
    this.fn = genFn(this);
    this.eventHandle = new EventHandle<Args, E>(eventLite, event);
  }

  start() {
    const doMap = this.eventLite.doMap;
    let callBackSet: CallBackSet;
    if (!(callBackSet = doMap.get(this.event))) {
      doMap.set(this.event, (callBackSet = new Set([])));
    }

    callBackSet.add(this.fn);
    return this;
  }

  cancal() {
    this.eventLite.remove(this.event, this.fn);
    return this;
  }

  emit(...args: Args) {
    this.eventLite.emit(this.event, ...args);
    return this;
  }
}
