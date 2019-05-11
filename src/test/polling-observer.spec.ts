interface MockData {
  items: number[];
  status?: 'complete' | 'in-progress';
}

import { PollingMeasure } from '../polling-measure.js';
import {
  OnfinishFulfilled,
  OnfinishRejected,
  PollingObserver,
} from '../polling-observer.js';

describe('polling-observer', () => {
  describe('error', () => {
    it(`throws when 'conditionCallback' is undefined`, () => {
      expect(() => new PollingObserver(undefined!))
        .toThrowError(new TypeError(`'conditionCallback' is not defined`));
    });

    it(`stops polling when error occurs`, (done) => {
      const obs = new PollingObserver<MockData>(() => false);
      obs.observe(
        async () => {
          throw new Error('polling error');
        },
        { interval: 1e3 });

      obs.onfinish = (d) => {
        const { status, reason } = d as OnfinishRejected;

        expect(status).toStrictEqual('error');
        expect(reason).toStrictEqual(new Error('polling error'));
        done();
      };
    }, 10e3);

  });

  describe('ok', () => {
    it(`finishes polling with condition fulfills`, (done) => {
      const data: MockData = { items: [Math.floor(Math.random() * Math.PI)] };
      const obs = new PollingObserver<MockData>(d => Boolean(d && d.items.length > 0));
      obs.observe(
        async () => {
          return new Promise<MockData>(yay => setTimeout(() => yay(data), 2e3));
        },
        { interval: 1e3, timeout: 5e3 });

      obs.onfinish = (d) => {
        const { status, value } = d as OnfinishFulfilled<MockData>;

        expect(status).toStrictEqual('finish');
        expect(value).toStrictEqual({ ...data });
        done();
      };
    }, 10e3);

    it(`timeouts a polling`, (done) => {
      const data: MockData = { items: [Math.floor(Math.random() * Math.PI)] };
      const obs = new PollingObserver<MockData>(() => false);
      obs.observe(
        async () => {
          return new Promise<MockData>(yay => setTimeout(() => yay(data), 7e3));
        },
        { interval: 1e3, timeout: 5e3 });

      obs.onfinish = (d) => {
        const { status, value } = d as OnfinishFulfilled<MockData>;

        expect(status).toStrictEqual('timeout');
        expect(value).toStrictEqual({ ...data });
        done();
      };
    }, 10e3);

    it(`timeouts a polling with > 1 repeat`, (done) => {
      const data: MockData = { items: [Math.floor(Math.random() * Math.PI)] };
      const obs = new PollingObserver<MockData>(() => false);
      obs.observe(
        async () => {
          /**
           * NOTE(motss): The promise resolves after 1s timeout and the next run will be
           * scheduled to happen in roughly (1e3 - 1) milliseconds.
           */
          return new Promise<MockData>(yay => setTimeout(() => yay(data), 1));
        },
        { interval: 1e3, timeout: 5e3 });

      obs.onfinish = (d) => {
        const { status, value } = d as OnfinishFulfilled<MockData>;

        expect(status).toStrictEqual('timeout');
        expect(value).toStrictEqual({ ...data });
        done();
      };
    }, 10e3);

    it(`reads records when polling finishes`, (done) => {
      const data: MockData = { items: [Math.floor(Math.random() * Math.PI)] };
      const obs = new PollingObserver<MockData>(() => false);
      obs.observe(
        async () => {
          return new Promise<MockData>(yay => setTimeout(() => yay(data), 1));
        },
        { interval: 1e3, timeout: 5e3 });

      obs.onfinish = (d) => {
        const { status, value } = d as OnfinishFulfilled<MockData>;

        expect(status).toStrictEqual('timeout');
        expect(value).toStrictEqual({ ...data });
        expect(obs.takeRecords().length).toBeGreaterThan(1);
        expect(obs.takeRecords()[0].toJSON()).toMatchObject({
          duration: expect.any(Number),
          entryType: expect.stringMatching('polling-measure'),
          name: expect.stringMatching(/^polling:\d+/gi),
          startTime: expect.any(Number),
        } as PollingMeasure);
        done();
      };
    }, 10e3);

    it(`clears records when observer disconnects`, (done) => {
      const data: MockData = { items: [Math.floor(Math.random() * Math.PI)] };
      const obs = new PollingObserver<MockData>(() => false);
      obs.observe(
        async () => {
          return new Promise<MockData>(yay => setTimeout(() => yay(data), 1));
        },
        { interval: 1e3, timeout: 5e3 });

      obs.onfinish = (d) => {
        const { status, value } = d as OnfinishFulfilled<MockData>;

        expect(status).toStrictEqual('timeout');
        expect(value).toStrictEqual({ ...data });
        expect(obs.takeRecords().length).toBeGreaterThan(1);

        obs.disconnect();

        expect(obs.takeRecords().length).toBeLessThan(1);
        done();
      };
    }, 10e3);

    it(`forces polling to stop by disconnecting the observer`, async (done) => {
      const data: MockData = { items: [Math.floor(Math.random() * Math.PI)] };
      const obs = new PollingObserver<MockData>(() => {
        /**
         * NOTE(motss): Disconnect observer after 1st polling.
         */
        obs.disconnect();
        return false;
      });

      obs.observe(
        async () => {
          return new Promise<MockData>(yay => setTimeout(() => yay(data), 1));
        },
        { interval: 2e3, timeout: 5e3 });

      obs.onfinish = (d) => {
        const { status, value } = d as OnfinishFulfilled<MockData>;

        expect(status).toStrictEqual('finish');
        expect(value).toStrictEqual({ ...data });
        expect(obs.takeRecords().length).toStrictEqual(1);
        done();
      };
    }, 10e3);

    it(`disconnects observer before first polling initiates`, async (done) => {
      const data: MockData = { items: [Math.floor(Math.random() * Math.PI)] };
      const obs = new PollingObserver<MockData>(() => false);

      obs.observe(
        async () => {
          return new Promise<MockData>(yay => setTimeout(() => yay(data), 1));
        },
        { interval: 2e3, timeout: 5e3 });

      obs.onfinish = (d) => {
        const { status, value } = d as OnfinishFulfilled<MockData>;

        expect(status).toStrictEqual('finish');
        expect(value).toStrictEqual(undefined!);
        expect(obs.takeRecords()).toStrictEqual([]);
        done();
      };

      obs.disconnect();
    }, 10e3);

    // TODO: To restart disconnected observer

  });

});
