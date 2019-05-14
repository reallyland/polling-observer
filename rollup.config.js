// @ts-check

import { terser } from 'rollup-plugin-terser';
import filesize from 'rollup-plugin-filesize';
import tslint from 'rollup-plugin-tslint';
import typescript from 'rollup-plugin-typescript2';

const isProd = !process.env.ROLLUP_WATCH;
const input = ['src/polling-observer.ts'];
const pluginFn = (iife, minify) => [
  isProd && tslint({
    throwError: true,
    configuration: `tslint${isProd ? '.prod' : ''}.json`,
  }),
  typescript({
    tsconfig: './tsconfig.json',
    exclude: isProd ? ['src/(demo|test)/**/*'] : [],
    ...(iife ? { tsconfigOverride: { compilerOptions: { target: 'es5' } } } : {}),
  }),
  isProd && minify && terser(),
  isProd && filesize({ showBrotliSize: true }),
];

const multiBuild = [
  {
    file: 'dist/index.mjs',
    format: 'esm',
    sourcemap: true,
    exports: 'named',
  },
  {
    file: 'dist/index.js',
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
].reduce((p, n) => {
  const opts = [true, false].map(o => ({
    input,
    output: o ? { ...n, file: n.file.replace(/(.+)(\.m?js)$/, '$1.min$2') } : n,
    plugins: pluginFn('iife' === n.format, o),
  }));

  return (p.push(...opts), p);
}, []);

export default multiBuild;
