export type CallBack<Args extends unknown[], V = void> = (...args: Args) => V;

export type CallBackSet = Set<CallBack<unknown[]>>;

class EventLite {
  doMap = new Map<unknown, CallBackSet>();

  constructor() {}

  on<Args extends unknown[], E>(
    event: E,
    genFn: (eventWatcher: EventWatcher<Args, E>) => CallBack<Args>
  ) {
    return new EventWatcher(this, event, genFn).start();
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

  promise<E>(this: EventLite, event: E, timeout: number = -1) {
    return <Args extends unknown[]>() => {
      return new Promise<Args>((resolve, reject) => {
        if (timeout >= 0) {
          const h = setTimeout(() => {
            watcher.cancal();
            reject("timeout");
          }, timeout);
          const watcher = new EventWatcher(this, event, (watcher) => {
            return (...args: Args) => {
              clearTimeout(h);
              resolve(args);
              watcher.cancal();
            };
          });
        } else {
          const watcher = new EventWatcher(this, event, (watcher) => {
            return (...args: Args) => {
              resolve(args);
              watcher.cancal();
            };
          });
        }
      });
    };
  }
}

class EventWatcher<Args extends unknown[], E> {
  fn: CallBack<Args>;
  constructor(
    public eventLite: EventLite,
    public event: E,
    genFn: (eventWatcher: EventWatcher<Args, E>) => CallBack<Args>
  ) {
    this.fn = genFn(this);
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

const eventLite = new EventLite();

// once
eventLite.on("eat", (watcher) => {
  return () => {
    console.log("only eat once");
    watcher.cancal();
  };
});
// on
eventLite.on("eat", (watcher) => {
  return () => {
    console.log("eat");
  };
});
