import { hasWindow } from './has-window.js';

export async function globalPerformance() {
  return (hasWindow() ? window : await import('perf_hooks')).performance;
}
