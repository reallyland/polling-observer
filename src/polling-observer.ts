import { delayUntil } from './delay-until.js';
import { globalPerformance } from './global-performance.js';
import { PollingMeasure } from './polling-entry.js';

interface PollingObserverOptions {
  timeout?: number;
  interval?: number;
}
type PollingFunctionType<T> = () => T | Promise<T>;
type ConditionCallbackType<T> = (
  data: T | null | undefined,
  records: PollingObserver<T>['_records'],
  object: PollingObserver<T>
) => boolean | Promise<boolean>;

function isPromise<T>(r: T | Promise<T>): r is Promise<T> {
  return 'function' === typeof((r as Promise<T>).then);
}

export class PollingObserver<T> {
  private _forceStop: boolean = false;
  private _records: PollingMeasure[] = [];

  constructor(public conditionCallback: ConditionCallbackType<T>) {
    if ('function' !== typeof(conditionCallback)) {
      throw new TypeError(
        `Expected 'conditionCallback' to be expected, but received ${conditionCallback}`);
    }
  }

  public disconnect() {
    this._forceStop = true;
    this._records = [];
  }

  public async observe(fn: PollingFunctionType<T>, options: PollingObserverOptions) {
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

    let totalTime = 0;
    let data: T | undefined = void 0;
    let i = 0;

    polling: while (true) {
      if (this._forceStop) {
        this._forceStop = false;
        break polling;
      }

      const conditionResult = this.conditionCallback(data, this._records, this);
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
  }

  public takeRecords() {
    return this._records;
  }
}

export default PollingObserver;

// TODO: To add `pollingfinish` event when polling completes
