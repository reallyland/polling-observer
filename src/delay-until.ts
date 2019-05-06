import { hasWindow } from './has-window.js';

export async function delayUntil(delay?: number) {
  return new Promise((yay, nah) => {
    try {
      const delayNum = 'number' === typeof(delay) ? +delay : 0;

      if (delayNum > 0) yay();
      else hasWindow() ? setTimeout(yay) : setImmediate(yay);
    } catch (e) {
      nah(e);
    }
  });
}
