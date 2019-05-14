import { hasWindow } from './has-window.js';

export async function globalPerformance() {
  return (hasWindow() ? window : global as any).performance;
}
