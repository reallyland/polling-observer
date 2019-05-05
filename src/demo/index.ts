import { PollingObserver } from '../polling-observer.js';

async function delay(timeout: number = 1) {
  return new Promise(yay => setTimeout(yay, timeout));
}

async function main() {
  const fn = async () => {
    const rng = Math.random() * 10e3;

    await delay(rng);
    return rng;
  };
  // const opts = { interval: 1e3, timeout: 30e3 };
  // const opts = { interval: 1e3, timeout: -59e3 };
  const opts = { interval: 1e3 };
  const d = new PollingObserver<number>((n, records, obj) => {
    console.log('polling...', n, records, obj);

    // return 'number' === typeof(n) && n >= 9990;
    // return 'number' === typeof(n) && n >= 100;
    return false;
  });

  console.log('pollingobserver', d);

  console.info('Polling scheduled to start in 1 second.');
  const msg = await new Promise(yay => setTimeout(() => {
    d.observe(fn, opts);
    yay('Polling started!');
  }, 1e3));
  console.info(msg);

  // while (true) {
  //   const rs = d.takeRecords();

  //   console.info(rs, r, rs && rs[0] && rs[0].toJSON());

  //   await delay(2e3);
  // }
}

main().then(console.log).catch(console.error);
