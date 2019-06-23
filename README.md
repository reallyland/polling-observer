🚨 No longer maintained. Moved to [@reallyland/node_mod](https://github.com/reallyland/node_mod). 🚨

<div align="center" style="text-align: center;">
  <h1 style="border-bottom: none;">@reallyland/polling-observer</h1>

  <p>A new way of running polling function with observer pattern</p>
</div>

<hr />

<a href="https://www.buymeacoffee.com/RLmMhgXFb" target="_blank" rel="noopener noreferrer"><img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee" style="height: 20px !important;width: auto !important;" ></a>
[![tippin.me][tippin-me-badge]][tippin-me-url]
[![Follow me][follow-me-badge]][follow-me-url]

[![Version][version-badge]][version-url]
[![Node version][node-version-badge]][node-version-url]
[![MIT License][mit-license-badge]][mit-license-url]

[![Downloads][downloads-badge]][downloads-url]
[![Total downloads][total-downloads-badge]][downloads-url]
[![Packagephobia][packagephobia-badge]][packagephobia-url]
[![Bundlephobia][bundlephobia-badge]][bundlephobia-url]

[![CircleCI][circleci-badge]][circleci-url]
[![Dependency Status][daviddm-badge]][daviddm-url]
[![codecov][codecov-badge]][codecov-url]
[![Coverage Status][coveralls-badge]][coveralls-url]

[![codebeat badge][codebeat-badge]][codebeat-url]
[![Codacy Badge][codacy-badge]][codacy-url]
[![Code of Conduct][coc-badge]][coc-url]

> Like PerformanceObserver or any other observer APIs you could find in a browser, but this is for polling. Not only does it run polling with defined parameters but also collect polling metrics for each run until timeout or a defined condition fulfills.

## Table of contents <!-- omit in toc -->

- [Pre-requisites](#pre-requisites)
  - [Node.js](#nodejs)
  - [Browser](#browser)
- [Setup](#setup)
  - [Install](#install)
  - [Usage](#usage)
    - [TypeScript or native ES Modules](#typescript-or-native-es-modules)
    - [Node.js](#nodejs-1)
  - [Browser](#browser-1)
    - [ES Modules](#es-modules)
    - [UMD](#umd)
- [Demo](#demo)
- [API Reference](#api-reference)
  - [OnfinishFulfilled&lt;T&gt;](#onfinishfulfilledlttgt)
  - [OnfinishRejected](#onfinishrejected)
  - [PollingMeasure](#pollingmeasure)
    - [Methods](#methods)
      - [PollingMeasure.toJSON()](#pollingmeasuretojson)
  - [PollingObserver&lt;T&gt;](#pollingobserverlttgt)
    - [Methods](#methods-1)
      - [PollingObserver.observe(callback[, options])](#pollingobserverobservecallback-options)
      - [PollingObserver.disconnect()](#pollingobserverdisconnect)
      - [PollingObserver.takeRecords()](#pollingobservertakerecords)
    - [Event handler](#event-handler)
      - [PollingObserver.onfinish](#pollingobserveronfinish)
- [deno](#deno)
- [License](#license)

## Pre-requisites

### Node.js

- [Node.js][nodejs-url] >= 8.16.0
- [NPM][npm-url] >= 6.4.1 ([NPM][npm-url] comes with [Node.js][nodejs-url] so there is no need to install separately.)
- [perf_hooks] (Added in `node@8.5.0` behind experimental flag)

### Browser

- [window.Performance]

## Setup

### Install

```sh
# Install via NPM
$ npm install --save @reallyland/polling-observer
```

### Usage

[Performance] API is strictly required before running any polling. To ensure `performance.now` is available globally on Node.js, you can do:

```js
/** Node.js */
import { performance } from 'perf_hooks';

global.performance = performance; // or globalThis.performance = performance;
```

#### TypeScript or native ES Modules

```ts
interface DataType {
  status: 'complete' | 'in-progress';
  items: Record<string, any>[];
}

import { PollingObserver } from '@reallyland/polling-observer';

const obs = new PollingObserver((data/** list, observer */) => {
  const { status, items } = data || {};
  const itemsLen = (items && items.length) || 0;

  /** Stop polling when any of the conditions fulfills */
  return 'complete' === status || itemsLen > 99;
});

obs.observe(
  async () => {
    /** Polling callback - fetch resources */
    const r = await fetch('https://example.com/api?key=123');
    const d = await r.json();

    return d;
  },
  /** Run polling (at least) every 2 seconds and timeout if it exceeds 30 seconds */
  {
    interval: 2e3,
    timeout: 30e3,
  }
);

/**
 * When polling finishes, it will either fulfill or reject depending on the status:
 * 
 * | Status  | Returns   |
 * | ------- | --------- |
 * | finish  | <value>   |
 * | timeout | <value>   |
 * | error   | <reason>  |
 * 
 */
obs.onfinish = (data, records/**, observer */) => {
  const { status, value, reason } = data || {};

  switch (status) {
    case 'error': {
      console.error(`Polling fails due to: `, reason);
      break;
    }
    case 'timeout': {
      console.log(`Polling timeouts after 30 seconds: `, value);
      break;
    }
    case 'finish':
    default: {
      console.log(`Polling finishes: `, value);
    }
  }

  console.log(`Formatted polling records: `, records.map(n => n.toJSON()));
  /**
   * [
   *   {
   *     duration: 100,
   *     entryType: 'polling-measure',
   *     name: 'polling:0',
   *     startTime: 100,
   *   },
   *   ...
   * ]
   */

  obs.disconnect(); /** Disconnect to clean up */
};
```

#### Node.js

```js
const { PollingObserver } = require('@reallyland/polling-observer');

const obs = new PollingObserver((data/** entries, observer */) => {
  const { status, items } = data || {};
  const itemsLen = (items && items.length) || 0;

  /** Stop polling when any of the conditions fulfills */
  return 'complete' === status || itemsLen > 99;
});

obs.observe(
  async () => {
    /** Polling callback - fetch resources */
    const r = await fetch('https://example.com/api?key=123');
    const d = await r.json();

    return d;
  },
  /** Run polling (at least) every 2 seconds and timeout if it exceeds 30 seconds */
  {
    interval: 2e3,
    timeout: 30e3,
  }
);

/**
 * When polling finishes, it will either fulfill or reject depending on the status:
 * 
 * | Status  | Returns   |
 * | ------- | --------- |
 * | finish  | <value>   |
 * | timeout | <value>   |
 * | error   | <reason>  |
 * 
 */
obs.onfinish = (data, entries/**, observer */) => {
  const { status, value, reason } = data || {};

  switch (status) {
    case 'error': {
      console.error(`Polling fails due to: `, reason);
      break;
    }
    case 'timeout': {
      console.log(`Polling timeouts after 30 seconds: `, value);
      break;
    }
    case 'finish':
    default: {
      console.log(`Polling finishes: `, value);
    }
  }

  console.log(`Formatted polling entries: `, entries.map(n => n.toJSON()));
  /**
   * [
   *   {
   *     duration: 100,
   *     entryType: 'polling-measure',
   *     name: 'polling:0',
   *     startTime: 100,
   *   },
   *   ...
   * ]
   */

  obs.disconnect(); /** Disconnect to clean up */
};
```

### Browser

#### ES Modules

```html
<!doctype html>
<html>
  <head>
    <script type="module">
      import { PollingObserver } from 'https://unpkg.com/@reallyland/polling-observer@latest/dist/polling-observer.min.js';

      // --snip
    </script>
  </head>
</html>
```

#### UMD

```html
<!doctype html>
<html>
  <head>
    <script src="https://unpkg.com/@reallyland/polling-observer@latest/dist/polling-observer.umd.min.js"></script>
    <script>
      var { PollingObserver } = window.PollingObserver;

      // --snip
    </script>
  </head>
</html>
```

## Demo

[![Edit PollingObserver](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/pollingobserver-b269s?fontsize=14)

## API Reference

### OnfinishFulfilled&lt;T&gt;

```ts
interface OnfinishFulfilled<T> {
  status: 'finish' | 'timeout';
  value: T;
}
```

### OnfinishRejected

```ts
interface OnfinishRejected {
  status: 'error';
  reason: Error;
}
```

### PollingMeasure

```ts
interface PollingMeasure {
  duration: number;
  entryType: 'polling-measure';
  name: string;
  startTime: number;
}
```

- `duration` <[number][number-mdn-url]> Duration of the polling takes in milliseconds.
- `entryType` <[string][string-mdn-url]> Entry type, defaults to `polling-measure`.
- `name` <[string][string-mdn-url]> Polling name in the format of `polling:<index>` where `<index>` starts from `0` and increments on each polling.
- `startTime` <[string][string-mdn-url]> Relative timestamp (in milliseconds ) indicates when the polling starts at.

#### Methods

##### PollingMeasure.toJSON()

- <[Function][function-mdn-url]> Returns a JSON representation of the polling object's properties.

---

### PollingObserver&lt;T&gt;

- `conditionCallback` <[Function][function-mdn-url]> Condition callback to be executed in each polling and return the condition result in the type of boolean, e.g. return `true` to stop next poll.
  - `data` <`T`> Polling data returned by `callback` in the type of `T` which defined in the [PollingObserver.observe()] method.
  - `entries` <[Array][array-mdn-url]&lt;[PollingMeasure]&gt;> A list of [PollingMeasure] objects.
  - `observer` <[PollingObserver]&lt;`T`&gt;> Created [PollingObserver] object.
  - returns: <[boolean][boolean-mdn-url]> If `true`, the polling stops. Returning `false` will result in an infinite polling as the condition will never meet.
- returns: <[PollingObserver]&lt;`T`&gt;> [PollingObserver] object.

#### Methods

##### PollingObserver.observe(callback[, options])

The method is used to initiate polling with a polling callback and optional configuration.

- `callback` <[Function][function-mdn-url]> Callback to be executed in each polling and return the result so that it will be passed as the first argument in `conditionCallback`.
  - returns: <`T` | [Promise][promise-mdn-url]&lt;`T`&gt;> Return polling result in the type of `T` or `Promise<T>` in each polling.
- `options` <[Object][object-mdn-url]> Optional configuration to run the polling.
  - `interval` <[number][number-mdn-url]> Optional interval in milliseconds. This is the minimum delay before starting the next polling.
  - `timeout` <[number][number-mdn-url]> Optional timeout in milliseconds. Polling ends when it reaches the defined timeout even though the condition has not been met yet. _As long as `timeout` is not a number or it has a value that is less than 1, it indicates an infinite polling. The polling needs to be stopped manually by calling [PollingObserver.disconnect()] method._

##### PollingObserver.disconnect()

Once a `PollingObserver` disconnects, the polling stops and all polling metrics will be cleared. Calling [PollingObserver.takeRecords()] after the disconnection will always return an empty record.

A `onfinish` event handler can be used to retrieve polling records after a disconnection but it has to be attached before disconnecting the observer.

##### PollingObserver.takeRecords()

The method returns a list of [PollingMeasure] object containing the metrics of each polling.

- returns: <[Array][array-mdn-url]&lt;[PollingMeasure]&gt;> A list of [PollingMeasure] objects.

#### Event handler

##### PollingObserver.onfinish

_Note that no `finish` event fires when the polling finishes. So `observer.addEventListener('finish', ...)` will not work._

Event handler for when a polling finishes. When a polling finishes, it can either be fulfilled with a `value` or rejected with a `reason`. Any one of which contains a `status` field to tell the state of the finished polling.

When a polling fulfills, it returns an [OnfinishFulfilled&lt;T&gt;] object with `status` set to `finish` or `timeout` and a `value` in the type of `T`.

When a polling rejects, it returns an [OnfinishRejected] object with `status` set to `error` and a `reason` in the type of [Error][error-mdn-url].

| Status    | Returns        |
| --------- | -------------- |
| `finish`  | &lt;value&gt;  |
| `timeout` | &lt;value&gt;  |
| `error`   | &lt;reason&gt; |

## deno

_Coming soon._

## License

[MIT License](https://motss.mit-license.org/) © Rong Sen Ng (motss)

<!-- References -->
[typescript-url]: https://github.com/Microsoft/TypeScript
[nodejs-url]: https://nodejs.org
[npm-url]: https://www.npmjs.com
[node-releases-url]: https://nodejs.org/en/download/releases
[perf_hooks]: https://nodejs.org/api/perf_hooks.html
[Performance]: https://developer.mozilla.org/en-US/docs/Web/API/Performance
[window.performance]: https://developer.mozilla.org/en-US/docs/Web/API/Performance/now

[PollingObserver]: #pollingobservert
[PollingObserver.observe()]: #pollingobserverobservecallback-options
[PollingObserver.disconnect()]: #pollingobserverdisconnect
[PollingObserver.takeRecords()]: #pollingobservertakerecords
[PollingMeasure]: #pollingmeasure
[PollingMeasure.toJSON()]: #pollingmeasuretojson
[OnfinishFulfilled&lt;T&gt;]: #onfinishfulfilledt
[OnfinishRejected]: #onfinishrejected

<!-- MDN -->
[array-mdn-url]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
[boolean-mdn-url]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean
[function-mdn-url]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function
[map-mdn-url]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
[number-mdn-url]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number
[object-mdn-url]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object
[promise-mdn-url]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
[regexp-mdn-url]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp
[set-mdn-url]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
[string-mdn-url]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String
[void-mdn-url]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/void
[error-mdn-url]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error

<!-- Badges -->
[tippin-me-badge]: https://badgen.net/badge/%E2%9A%A1%EF%B8%8Ftippin.me/@igarshmyb/F0918E
[follow-me-badge]: https://flat.badgen.net/twitter/follow/igarshmyb?icon=twitter

[version-badge]: https://flat.badgen.net/npm/v/@reallyland/polling-observer?icon=npm
[node-version-badge]: https://flat.badgen.net/npm/node/@reallyland/polling-observer
[mit-license-badge]: https://flat.badgen.net/npm/license/@reallyland/polling-observer

[downloads-badge]: https://flat.badgen.net/npm/dm/@reallyland/polling-observer
[total-downloads-badge]: https://flat.badgen.net/npm/dt/@reallyland/polling-observer?label=total%20downloads
[packagephobia-badge]: https://flat.badgen.net/packagephobia/install/@reallyland/polling-observer
[bundlephobia-badge]: https://flat.badgen.net/bundlephobia/minzip/@reallyland/polling-observer

[circleci-badge]: https://flat.badgen.net/circleci/github/reallyland/polling-observer?icon=circleci
[daviddm-badge]: https://flat.badgen.net/david/dep/reallyland/polling-observer
[codecov-badge]: https://flat.badgen.net/codecov/c/github/reallyland/polling-observer?label=codecov&icon=codecov
[coveralls-badge]: https://flat.badgen.net/coveralls/c/github/reallyland/polling-observer?label=coveralls

[codebeat-badge]: https://codebeat.co/badges/8400d381-c10e-4d5a-a00b-9478b50eb129
[codacy-badge]: https://api.codacy.com/project/badge/Grade/e9ea6e2433c5449b8151a4606fd60148
[coc-badge]: https://flat.badgen.net/badge/code%20of/conduct/pink

<!-- Links -->
[tippin-me-url]: https://tippin.me/@igarshmyb
[follow-me-url]: https://twitter.com/igarshmyb?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=reallyland/polling-observer

[version-url]: https://www.npmjs.com/package/@reallyland/polling-observer
[node-version-url]: https://nodejs.org/en/download
[mit-license-url]: https://github.com/reallyland/polling-observer/blob/master/LICENSE

[downloads-url]: https://www.npmtrends.com/@reallyland/polling-observer
[packagephobia-url]: https://packagephobia.now.sh/result?p=%40reallyland%2Fpolling-observer
[bundlephobia-url]: https://bundlephobia.com/result?p=@reallyland/polling-observer

[circleci-url]: https://circleci.com/gh/reallyland/polling-observer/tree/master
[daviddm-url]: https://david-dm.org/reallyland/polling-observer
[codecov-url]: https://codecov.io/gh/reallyland/polling-observer
[coveralls-url]: https://coveralls.io/github/reallyland/polling-observer?branch=master

[codebeat-url]: https://codebeat.co/projects/github-com-reallyland-polling-observer-master
[codacy-url]: https://www.codacy.com/app/motss/polling-observer?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=reallyland/polling-observer&amp;utm_campaign=Badge_Grade
[coc-url]: https://github.com/reallyland/polling-observer/blob/master/CODE-OF-CONDUCT.md
