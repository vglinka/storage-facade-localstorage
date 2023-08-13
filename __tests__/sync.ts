// Copyright (c) 2023-present Vadim Glinka
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option.

import { createStorage } from 'storage-facade';
import { LocalStorageInterface } from '../src';

beforeEach(() => {
  localStorage.clear();
});

const testsSetup = [
  {
    name: 'cache-on',
    useCache: true,
  },
  {
    name: 'cache-off',
    useCache: false,
  },
];

testsSetup.forEach((setup) => {
  it(`Sync, ${setup.name}: read/write`, () => {
    const storage = createStorage({
      use: new LocalStorageInterface({
        useCache: setup.useCache,
      }),
      asyncMode: false,
    });

    storage.value = { c: [40, 42] };
    expect(storage.value).toEqual({ c: [40, 42] });
  });

  it(`Sync, ${setup.name}: addDefault`, () => {
    const storage = createStorage({
      use: new LocalStorageInterface({
        useCache: true,
      }),
      asyncMode: false,
    });

    storage.addDefault({ value: 9 });
    storage.addDefault({ value: 1, value2: 2 });
    expect(storage.value).toEqual(1);
    expect(storage.value2).toEqual(2);

    storage.value = 42;
    expect(storage.value).toEqual(42);

    storage.value = undefined;
    expect(storage.value).toEqual(1);

    storage.value = null;
    expect(storage.value).toEqual(null);
  });

  it(`Sync, ${setup.name}: getDefault`, () => {
    const storage = createStorage({
      use: new LocalStorageInterface({
        useCache: true,
      }),
      asyncMode: false,
    });

    storage.addDefault({ value: 2, other: 7 });

    expect(storage.getDefault()).toEqual({ value: 2, other: 7 });
  });

  it(`Sync, ${setup.name}: setDefault`, () => {
    const storage = createStorage({
      use: new LocalStorageInterface({
        useCache: true,
      }),
      asyncMode: false,
    });

    storage.addDefault({ value: 2, other: 7 });

    // Replace 'default'
    storage.setDefault({ value: 42 });

    expect(storage.value).toEqual(42);
    expect(storage.other).toEqual(undefined);
  });

  it(`Sync, ${setup.name}: clearDefault`, () => {
    const storage = createStorage({
      use: new LocalStorageInterface({
        useCache: true,
      }),
      asyncMode: false,
    });

    storage.addDefault({ value: 2, other: 7 });

    storage.clearDefault();

    expect(storage.value).toEqual(undefined);
    expect(storage.other).toEqual(undefined);
  });

  it(`Sync, ${setup.name}: delete key`, () => {
    const storage = createStorage({
      use: new LocalStorageInterface({
        useCache: true,
      }),
      asyncMode: false,
    });

    storage.addDefault({ value: 2 });
    storage.value = 4;
    delete storage.value;

    expect(storage.value).toEqual(2);

    storage.newKey = 3;
    delete storage.newKey;
    delete storage.newKey;

    expect(storage.newKey).toEqual(undefined);
  });

  it(`Sync, ${setup.name}: clear storage`, () => {
    const storage = createStorage({
      use: new LocalStorageInterface({
        useCache: true,
      }),
      asyncMode: false,
    });

    storage.addDefault({ value: 2 });
    storage.value = 4;

    storage.clear();
    storage.clearDefault();

    expect(storage.value).toEqual(undefined);
  });

  it(`Sync, ${setup.name}: size`, () => {
    const storage = createStorage({
      use: new LocalStorageInterface({
        useCache: true,
      }),
      asyncMode: false,
    });

    storage.addDefault({ value: 2 });
    storage.value = 4;
    storage.other = 3;

    expect(storage.size()).toEqual(2);
  });

  it(`Sync, ${setup.name}: key`, () => {
    const storage = createStorage({
      use: new LocalStorageInterface({
        useCache: true,
      }),
      asyncMode: false,
    });

    storage.addDefault({ value: 2 });
    storage.value = 4;

    expect(storage.key(0)).toEqual('value');
  });

  it(`Sync, ${setup.name}: iter`, () => {
    const storage = createStorage({
      use: new LocalStorageInterface({
        useCache: true,
      }),
      asyncMode: false,
    });

    storage.addDefault({ value: 2 });
    storage.value = 4;
    storage.other = 5;

    const array = storage //
      .entries()
      .map(([key, value]) => {
        return [key, value];
      });

    expect(array).toEqual([
      ['value', 4],
      ['other', 5],
    ]);
  });
});
