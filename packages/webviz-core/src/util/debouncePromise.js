// @flow
//
//  Copyright (c) 2019-present, Cruise LLC
//
//  This source code is licensed under the Apache License, Version 2.0,
//  found in the LICENSE file in the root directory of this source tree.
//  You may not use this file except in compliance with the License.

type DebouncedFn = ((...args: any) => void) & { currentPromise: ?Promise<void> };

export default function debouncePromise(fn: (...args: any) => Promise<void>): DebouncedFn {
  // Whether we are currently waiting for a promise returned by `fn` to resolve.
  let calling = false;
  // Whether another call to the debounced function was made while a call was in progress.
  let callPending: ?(any[]);

  function debouncedFn(...args) {
    if (calling) {
      callPending = args;
    } else {
      start(args);
    }
  }

  function start(args: any[]) {
    calling = true;
    callPending = undefined;

    debouncedFn.currentPromise = fn(...args).finally(() => {
      calling = false;
      debouncedFn.currentPromise = undefined;
      if (callPending) {
        start(callPending);
      }
    });
  }

  return debouncedFn;
}
