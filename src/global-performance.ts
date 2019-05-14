import { hasWindow } from './has-window';

export async function globalPerformance() {
  return (hasWindow() ? window : global as any).performance;
}
