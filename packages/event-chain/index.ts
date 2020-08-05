export type CallBack<Args extends unknown[], V = unknown> = (
  ...args: Args
) => V;
export type CallBackSet = Set<CallBack<unknown[]>>;

/**
 * notice:注意手动释放内存
 *
 * @export
 * @class EventLite
 */
export class EventLite {
  constructor() {}
  doMap = new Map<unknown, CallBackSet>();
  doOnceMap = new Map<unknown, CallBackSet>();

  event<E>(event: E) {
    return <Args extends unknown[]>() => {
      return this.typed<Args, E>(event);
    };
  }

  on<Args extends unknown[], E>(event: E, fn: CallBack<Args>) {
    const map = this.doMap;
    let callBackSet: CallBackSet;

    if (!(callBackSet = map.get(event))) {
      map.set(event, (callBackSet = new Set()));
    }
    callBackSet.add(fn);

    return this.typed<Args, E>(event);
  }

  once<Args extends unknown[], E>(event: E, fn: CallBack<Args>) {
    const map = this.doOnceMap;
    let callBackSet: CallBackSet;

    if (!(callBackSet = map.get(event))) {
      map.set(event, (callBackSet = new Set()));
    }

    callBackSet.add(fn);
    return this.typed<Args, E>(event);
  }

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
      typedRemove: (fn: CallBack<Args>) => {
        this.remove(event, fn);
        return make;
      },
      eventLite: this,
      typedemit: (...args: Args) => {
        this.emit(event, ...args);
        return make;
      },
      typedPipe: <E, V>(follow: E, fn: CallBack<Args, V>) => {
        const pipeMake = this.typed<[V]>(follow);

        make.typedOn((...args) => {
          const value = fn(...args);
          pipeMake.typedemit(value);
        });

        return pipeMake;
      },
    };
    return make;
  }

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

export type SubjectLiteCallBack<T> = (value: T) => unknown;
export type SubjectLiteOperator<T, W> = (value: T) => W;

/**
 * notice:注意手动释放内存
 *
 * @export
 * @class SubjectLite
 * @template T
 */
export class SubjectLite<T> {
  doSet = new Set<SubjectLiteCallBack<T>>();

  next(value: T) {
    this.doSet.forEach((fn) => {
      fn(value);
    });
    return this;
  }

  subscribe(fn: SubjectLiteCallBack<T>) {
    this.doSet.add(fn);
    return this;
  }

  unsubscribe(fn: SubjectLiteCallBack<T>) {
    this.doSet.delete(fn);
    return this;
  }

  /**
   * 特殊的subscribe，同样注意释放内存
   *
   * @template W
   * @param {SubjectLiteOperator<T, W>} fn
   * @returns
   * @memberof SubjectLite
   */
  pipe<W>(fn: SubjectLiteOperator<T, W>) {
    const newSub = new SubjectLite<W>();

    this.subscribe((value) => {
      newSub.next(fn(value));
    });

    return newSub;
  }
}
