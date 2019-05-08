import { delayUntil } from './delay-until.js';
import { globalPerformance } from './global-performance.js';
import { PollingMeasure } from './polling-entry.js';

interface PollingObserverOptions {
  timeout?: number;
  interval?: number;
}
type PollingData<T> = T | null | undefined;
type PollingFunction<T> = () => T | Promise<T>;
type ConditionCallback<T> = (
  data: PollingData<T>,
  records: PollingObserver<T>['_records'],
  object: PollingObserver<T>
) => boolean | Promise<boolean>;
type OnFinishCallback<T> = (...data: Parameters<ConditionCallback<T>>) => unknown;

function isPromise<T>(r: T | Promise<T>): r is Promise<T> {
  return 'function' === typeof((r as Promise<T>).then);
}

export class PollingObserver<T> {
  public onfinish?: OnFinishCallback<T>;

  private _forceStop: boolean = false;
  private _records: PollingMeasure[] = [];

  constructor(public conditionCallback: ConditionCallback<T>) {
    if ('function' !== typeof(conditionCallback)) {
      throw new TypeError(
        `Expected 'conditionCallback' to be expected, but received ${conditionCallback}`);
    }
  }

  public disconnect() {
    this._forceStop = true;
    this._records = [];
  }

  public async observe(fn: PollingFunction<T>, options: PollingObserverOptions) {
    /**
     * NOTE(motss): To ensure `this._forceStop` is always reset before start observing.
     */
    this._forceStop = false;

    const { interval, timeout }: PollingObserverOptions = options || {};
    const isValidInterval = 'number' === typeof(interval) && interval > 0;
    const obsTimeout = 'number' === typeof(timeout) ? +timeout : -1;
    const obsInterval = isValidInterval ? +interval! : -1;

    const perf = await globalPerformance();
    const isInfinitePolling = obsTimeout < 1;
    const records = this._records;
    const onfinishCallback = this.onfinish;

    let totalTime = 0;
    let data: PollingData<T> = void 0;
    let i = 0;

    polling: while (true) {
      if (this._forceStop) {
        this._forceStop = false;
        break polling;
      }

      const conditionResult = this.conditionCallback(data, records, this);
      const didConditionMeet = isPromise(conditionResult) ?
        await conditionResult : conditionResult;
      const didTimeout = isInfinitePolling ? false : totalTime >= obsTimeout;

      if (didTimeout || didConditionMeet) {
        if (didConditionMeet) console.log('stop after condition met');
        if (didTimeout) console.log('stop after timeout reached');

        this._forceStop = false;
        break polling;
      }

      const startAt = perf.now();
      const r = fn();
      data = isPromise(r) ? await r : r;
      const endAt = perf.now();
      const duration = endAt - startAt;
      const timeLeft = isValidInterval ? obsInterval - duration : 0;

      this._records.push(new PollingMeasure(`polling:${i}`, duration, startAt));

      totalTime += (duration > obsInterval ? duration : obsInterval);
      i += 1;

      if (timeLeft > 0) await delayUntil(timeLeft);
    }

    if ('function' === typeof(onfinishCallback)) onfinishCallback(data, this._records, this);
  }

  public takeRecords() {
    return this._records;
  }
}

export default PollingObserver;
