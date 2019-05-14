import { PollingObserver } from '../polling-observer.js';

async function delay(timeout: number = 1) {
  return new Promise(yay => setTimeout(yay, timeout));
}

async function main() {
  const fn = async () => {
    const rng = Math.random() * 1e3;

    await delay(rng);
    return rng;
  };
  // const opts = { interval: 1e3, timeout: -59e3 };
  const opts = { interval: 1e3, timeout: 10e3 };
  const d = new PollingObserver<number>(() => false);
  d.onfinish = (...args) => console.log('onfinish', args);

  console.log('pollingobserver', d);

  console.info('Polling scheduled to start in 1 second.');
  const msg = await new Promise(yay => setTimeout(() => {
    d.observe(fn, opts);
    yay('Polling started! Observing polling...');
  }, 1e3));
  console.info(msg);
}

main().then(console.log).catch(console.error);
