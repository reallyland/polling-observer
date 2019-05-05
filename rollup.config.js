// @ts-check

import { terser } from 'rollup-plugin-terser';
import filesize from 'rollup-plugin-filesize';
import tslint from 'rollup-plugin-tslint';
import typescript from 'rollup-plugin-typescript2';

const isProd = !process.env.ROLLUP_WATCH;
const input = ['src/polling-observer.ts'];
const pluginFn = (iife) => [
  isProd && tslint({
    throwError: true,
    configuration: `tslint${isProd ? '.prod' : ''}.json`,
  }),
  typescript({
    tsconfig: './tsconfig.json',
    exclude: isProd ? ['src/(demo|test)/**/*'] : [],
    ...(iife ? { tsconfigOverride: { compilerOptions: { target: 'es5' } } } : {}),
  }),
  isProd && terser(),
  isProd && filesize({ showBrotliSize: true }),
];

const multiBuild = [
  {
    file: 'dist/polling-observer.mjs',
    format: 'esm',
    sourcemap: true,
    exports: 'named',
  },
  {
    file: 'dist/polling-observer.js',
    format: 'cjs',
    sourcemap: true,
    exports: 'named',
  },
  {
    file: 'dist/polling-observer.iife.js',
    format: 'iife',
    name: 'PollingObserver',
    sourcemap: true,
    exports: 'named',
  },
  {
    file: 'dist/polling-observer.js',
    format: 'esm',
    sourcemap: true,
  },
].map(n => ({ input, output: n, plugins: pluginFn('iife' === n.format) }));

export default multiBuild;
