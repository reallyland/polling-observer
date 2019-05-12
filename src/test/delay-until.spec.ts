import { delayUntil } from '../delay-until';

describe('delay-until', () => {
  const globalThat = global as any;

  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    /** NOTE(motss): Remove fake 'window' object */
    globalThat.window = void 0;
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it(`delays`, async () => {
    const delayTask = delayUntil(3e3);

    /** NOTE(motss): `setImmediate` is used on Node.js */
    jest.runAllImmediates();
    expect(delayTask).resolves.toBe(undefined);
  }, 10e3);

  it(`resolves with optional 'delay'`, async () => {
    const delayTask = delayUntil();

    expect(delayTask).resolves.toBe(undefined);
  }, 10e3);

  it(`fallbacks not-a-number 'delay' to '0' and resolves`, async () => {
    const delayTask = delayUntil(null!);

    expect(delayTask).resolves.toBe(undefined);
  }, 10e3);

  it(`delays with 'setTimeout' on browser`, async () => {
    /** NOTE(motss): Fake a browser runtime environment */
    globalThat.window = {};

    const delayTask = delayUntil(3e3);

    expect(delayTask).resolves.toBe(undefined);
  });

});
