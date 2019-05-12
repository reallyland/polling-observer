describe('has-window', () => {
  const globalThat = global as any;

  afterEach(() => {
    /** NOTE(motss): Remove fake 'window' object */
    globalThat.window = void 0;
  });

  it(`has 'window' object`, async () => {
    /** NOTE(motss): Fake 'window' object */
    globalThat.window = {};

    const { hasWindow } = await import('../has-window.js');

    expect(hasWindow()).toStrictEqual(true);
  });

  it(`has no 'window' object`, async () => {
    const { hasWindow } = await import('../has-window.js');

    expect(hasWindow()).toStrictEqual(false);
  });

});
