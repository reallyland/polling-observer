import { performance } from 'perf_hooks';

(global as any).performance = performance;

import './delay-until.spec.js';
import './global-performance.spec.js';
import './polling-measure.spec.js';
import './polling-observer.spec.js';
