<div align="center" style="text-align: center;">
  <h1 style="border-bottom: none;">polling-observer</h1>

  <p>A new way of running polling function with observer pattern</p>
</div>

<hr />

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

> Better greeting message

## Table of contents <!-- omit in toc -->

- [Pre-requisites](#pre-requisites)
  - [Node.js](#nodejs)
  - [Browser](#browser)
- [Setup](#setup)
  - [Install](#install)
  - [Usage](#usage)
    - [TypeScript or native ES Modules](#typescript-or-native-es-modules)
    - [Node.js](#nodejs-1)
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
- `startTime` <[string][string-mdn-url]> Relative timestamp indicates when the polling starts at in milliseconds.

#### Methods

##### PollingMeasure.toJSON()

- <[Function][function-mdn-url]> Returns a JSON representation of the polling object's properties.

---

### PollingObserver&lt;T&gt;

- `conditionCallback` <[Function][function-mdn-url]> Condition callback to be executed in each polling and return the condition result in the type of boolean, e.g. return `true` to stop next poll.
  - `data` <`T`> Polling data returned by `callback` in the type of `T` which defined in the `.observer()` method.
  - `entries` <[PollingMeasure]> [PollingMeasure] object encapsulates a single polling metric of each polling.
  - `observer` <[PolingObserver]> Created `PollingObserver` object.
  - returns: <[boolean][boolean-mdn-url]> If `true`, the polling stops.
- returns: <[PollingObserver]> `PollingObserver` object.

#### Methods

##### PollingObserver.observe(callback[, options])

The method is used to initiate the polling with a polling callback and optional configuration.

- `callback` <[Function][function-mdn-url]> Callback to be executed in each polling and return the result so that it will be passed as the first argument in `conditionCallback`.
  - returns: <`T` | [Promise][promise-mdn-url]&lt;T&gt;> Return data in the type of `T` or `Promise<T>` in each polling.
- `options` <[Object][object-mdn-url]> Optional configuration to run the polling.
  - `interval` <[number][number-mdn-url]> Optional interval in milliseconds. This determines how long each polling should run for.
  - `timeout` <[number][number-mdn-url]> Optional timeout in milliseconds. Polling will end when it reaches the defined timeout even though the condition has not been met yet. _As long as `timeout` is not a number or it has a value that is less than 1, it indicates an infinite polling. The polling needs to be stopped manually by calling [PollingObserver.disconnect()] method._

##### PollingObserver.disconnect()

Once a `PollingObserver` disconnects, the polling stops. It can also be used to force stop an infinite polling. Once a `PollingObserver` disconnects, all polling metrics will be cleared so calling `PollingObserver.takeRecords` will always return an empty list. `onfinish` event handler is needed to retrieve all polling metrics after disconnection.

##### PollingObserver.takeRecords()

The method returns a list of polling metrics in the form of [PollingMeasure]. Calling [PollingMeasure.toJSON()] on each entry item to return a list of JSON representation of polling entries.

- returns: <[Array][array-mdn-url]&lt;[PollingMeasure]&gt;> A list of [PollingMeasure] objects.

#### Event handler

##### PollingObserver.onfinish

_Note that no `finish` event fires when the polling finishes. So `observer.addEventListener('finish', ...)` will not work._

Event handler for when a polling finishes. It can either fulfills with a value or rejects with a reason. Both kind of results contains a `status` field to tell the state of the finished polling.

When a polling fulfills, it returns a [OnfinishFulfilled&lt;T&gt;] object with `status` set to `finish` or `timeout` and a `value` in the type of `T`.

When a polling rejects, it returns a [OnfinishRejected] object with `status` set to `error` and a `reason` in the type of [Error][error-mdn-url].

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
[window.performance]: https://developer.mozilla.org/en-US/docs/Web/API/Performance/now

[PollingObserver]: #pollingobservert
[PollingMeasure]: #pollingmeasure
[PollingMeasure.toJSON()]: #pollingmeasuretojson
[PollingObserver.disconnect()]: #pollingobserverdisconnect
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
[follow-me-badge]: https://flat.badgen.net/twitter/follow/igarshmyb?icon=twitter

[version-badge]: https://flat.badgen.net/npm/v/polling-observer?icon=npm
[node-version-badge]: https://flat.badgen.net/npm/node/polling-observer
[mit-license-badge]: https://flat.badgen.net/npm/license/polling-observer

[downloads-badge]: https://flat.badgen.net/npm/dm/polling-observer
[total-downloads-badge]: https://flat.badgen.net/npm/dt/polling-observer?label=total%20downloads
[packagephobia-badge]: https://flat.badgen.net/packagephobia/install/polling-observer
[bundlephobia-badge]: https://flat.badgen.net/bundlephobia/minzip/polling-observer

[circleci-badge]: https://flat.badgen.net/circleci/github/reallyland/polling-observer?icon=circleci
[daviddm-badge]: https://flat.badgen.net/david/dep/reallyland/polling-observer
[codecov-badge]: https://flat.badgen.net/codecov/c/github/reallyland/polling-observer?label=codecov&icon=codecov
[coveralls-badge]: https://flat.badgen.net/coveralls/c/github/reallyland/polling-observer?label=coveralls

[codebeat-badge]: https://codebeat.co/badges/8400d381-c10e-4d5a-a00b-9478b50eb129
[codacy-badge]: https://api.codacy.com/project/badge/Grade/e9ea6e2433c5449b8151a4606fd60148
[coc-badge]: https://flat.badgen.net/badge/code%20of/conduct/pink

<!-- Links -->
[follow-me-url]: https://twitter.com/igarshmyb?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=reallyland/polling-observer

[version-url]: https://www.npmjs.com/package/polling-observer
[node-version-url]: https://nodejs.org/en/download
[mit-license-url]: https://github.com/reallyland/polling-observer/blob/master/LICENSE

[downloads-url]: https://www.npmtrends.com/polling-observer
[packagephobia-url]: https://packagephobia.now.sh/result?p=polling-observer
[bundlephobia-url]: https://bundlephobia.com/result?p=polling-observer

[circleci-url]: https://circleci.com/gh/reallyland/polling-observer/tree/master
[daviddm-url]: https://david-dm.org/reallyland/polling-observer
[codecov-url]: https://codecov.io/gh/reallyland/polling-observer
[coveralls-url]: https://coveralls.io/github/reallyland/polling-observer?branch=master

[codebeat-url]: https://codebeat.co/projects/github-com-reallyland-polling-observer-master
[codacy-url]: https://www.codacy.com/app/motss/polling-observer?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=reallyland/polling-observer&amp;utm_campaign=Badge_Grade
[coc-url]: https://github.com/reallyland/polling-observer/blob/master/CODE-OF-CONDUCT.md
