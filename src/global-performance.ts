import { hasWindow } from './has-window.js';

export async function globalPerformance() {
  return hasWindow() ? window.performance : (await import('perf_hooks')).performance;
}
