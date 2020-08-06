export type CallBack<Args extends unknown[], V = unknown> = (
  ...args: Args
) => V;
export type CallBackSet = Set<CallBack<unknown[]>>;

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
   * @template E
   * @param {E} event
   * @returns
   * @memberof EventLite
   */
  event<E>(event: E) {
    return <Args extends unknown[]>() => {
      return this.typed<Args, E>(event);
    };
  }

  /**
   *
   *
   * @template Args
   * @template E
   * @param {E} event
   * @param {CallBack<Args>} fn
   * @returns
   * @memberof EventLite
   */
  on<Args extends unknown[], E>(event: E, fn: CallBack<Args>) {
    const map = this.doMap;
    let callBackSet: CallBackSet;

    if (!(callBackSet = map.get(event))) {
      map.set(event, (callBackSet = new Set()));
    }
    callBackSet.add(fn);

    return this.typed<Args, E>(event);
  }

  /**
   *
   *
   * @template Args
   * @template E
   * @param {E} event
   * @param {CallBack<Args>} fn
   * @returns
   * @memberof EventLite
   */
  once<Args extends unknown[], E>(event: E, fn: CallBack<Args>) {
    const map = this.doOnceMap;
    let callBackSet: CallBackSet;

    if (!(callBackSet = map.get(event))) {
      map.set(event, (callBackSet = new Set()));
    }

    callBackSet.add(fn);
    return this.typed<Args, E>(event);
  }

  /**
   *
   *
   * @template Args
   * @template E
   * @param {E} event
   * @returns
   * @memberof EventLite
   */
  typed<Args extends unknown[], E = unknown>(event: E) {
    const make = {
      event,
      async *iterable() {
        while (true) {
          yield new Promise<Args>((rsolve) => {
            make.typedOnce((...args) => {
              rsolve(args);
            });
          });
        }
      },
      typedOn: (fn: CallBack<Args>) => {
        this.on(event, fn);
        return make;
      },
      typedOnce: (fn: CallBack<Args>) => {
        this.once(event, fn);
        return make;
      },
      typedRemove: (fn: CallBack<Args> | undefined) => {
        this.remove(event, fn);
        return make;
      },
      eventLite: this,
      typedEmit: (...args: Args) => {
        this.emit(event, ...args);
        return make;
      },
      typedPipe: <E, V>(follow: E, fn: CallBack<Args, V>) => {
        const pipeMake = this.typed<[V]>(follow);

        make.typedOn((...args) => {
          const value = fn(...args);
          pipeMake.typedEmit(value);
        });

        return pipeMake;
      },
    };
    return make;
  }

  /**
   *
   *
   * @template Args
   * @template E
   * @param {E} event
   * @param {...Args} args
   * @returns
   * @memberof EventLite
   */
  emit<Args extends unknown[], E>(event: E, ...args: Args) {
    this.doMap.get(event)?.forEach((fn) => {
      fn(...args);
    });

    this.doOnceMap.get(event)?.forEach((fn) => {
      fn(...args);
    });

    this.doOnceMap.delete(event);

    return this.typed<Args, E>(event);
  }

  /**
   *
   *
   * @template Args
   * @template E
   * @param {(E | undefined)} event
   * @param {(CallBack<Args> | undefined)} fn
   * @returns
   * @memberof EventLite
   */
  remove<Args extends unknown[], E>(
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
}
