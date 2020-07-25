(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SubjectLite = exports.EventLite = void 0;
    /**
     * notice:注意手动释放内存
     *
     * @export
     * @class EventLite
     */
    class EventLite {
        constructor() {
            this.doMap = new Map();
            this.onceDoMap = new Map();
        }
        on(event, fn) {
            const map = this.doMap;
            let callBackSet;
            if (!(callBackSet = map.get(event))) {
                map.set(event, (callBackSet = new Set()));
            }
            callBackSet.add(fn);
            return this.typed(event);
        }
        once(event, fn) {
            const map = this.onceDoMap;
            let callBackSet;
            if (!(callBackSet = map.get(event))) {
                map.set(event, (callBackSet = new Set()));
            }
            callBackSet.add(fn);
            return this.typed(event);
        }
        typed(event) {
            const make = {
                event,
                typedOn: (fn) => {
                    this.on(event, fn);
                    return make;
                },
                typedOnce: (fn) => {
                    this.once(event, fn);
                    return make;
                },
                typedRemove: (fn) => {
                    this.remove(event, fn);
                    return make;
                },
                eventLite: this,
                typedemit: (...args) => {
                    this.emit(event, ...args);
                    return make;
                },
                typedPipe: (follow, fn) => {
                    const pipeMake = this.typed(follow);
                    make.typedOn((...args) => {
                        const value = fn(...args);
                        pipeMake.typedemit(value);
                    });
                    return pipeMake;
                },
            };
            return make;
        }
        emit(event, ...args) {
            let callBackSet;
            if ((callBackSet = this.doMap.get(event))) {
                callBackSet.forEach((fn) => {
                    fn(...args);
                });
            }
            if ((callBackSet = this.onceDoMap.get(event))) {
                callBackSet.forEach((fn) => {
                    fn(...args);
                });
                this.onceDoMap.delete(event);
            }
            return this.typed(event);
        }
        remove(event, fn) {
            var _a, _b;
            if (event && fn) {
                (_a = this.doMap.get(event)) === null || _a === void 0 ? void 0 : _a.delete(fn);
                (_b = this.onceDoMap.get(event)) === null || _b === void 0 ? void 0 : _b.delete(fn);
            }
            else if (fn) {
                this.doMap.forEach((set) => {
                    set.delete(fn);
                });
                this.onceDoMap.forEach((set) => {
                    set.delete(fn);
                });
            }
            else if (event) {
                this.doMap.delete(event);
                this.onceDoMap.delete(event);
            }
            return this;
        }
    }
    exports.EventLite = EventLite;
    /**
     * notice:注意手动释放内存
     *
     * @export
     * @class SubjectLite
     * @template T
     */
    class SubjectLite {
        constructor() {
            this.doSet = new Set();
        }
        next(value) {
            this.doSet.forEach((fn) => {
                fn(value);
            });
            return this;
        }
        subscribe(fn) {
            this.doSet.add(fn);
            return this;
        }
        unsubscribe(fn) {
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
        pipe(fn) {
            const newSub = new SubjectLite();
            this.subscribe((value) => {
                newSub.next(fn(value));
            });
            return newSub;
        }
    }
    exports.SubjectLite = SubjectLite;
    console.log("ts");
});
