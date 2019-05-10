import PollingObserver from '../polling-observer.js';

describe('polling-observer', () => {
  describe('error', () => {
    it(`throws when 'conditionCallback' is undefined`, () => {
      expect(() => new PollingObserver(undefined!))
        .toThrowError(new TypeError(`'conditionCallback' is not defined`));
    });

  });

  // describe('ok', () => {

  // });

});
