// Copyright (c) 2023-present Vadim Glinka
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option.

import { createStorage } from 'storage-facade';
import { LocalStorageInterface as TestedInterface } from '../src';

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
  it(`Sync, ${setup.name}: need cleaning before each test (start)`, () => {
    const storage = createStorage({
      use: new TestedInterface(),
      useCache: setup.useCache,
      name: 'settings',
    });

    storage.value = 'data from the previous test';
    expect(storage.value).toEqual('data from the previous test');
  });

  it(`Sync, ${setup.name}: need cleaning before each test (end)`, () => {
    const storage = createStorage({
      use: new TestedInterface(),
      useCache: setup.useCache,
      name: 'settings',
    });

    expect(storage.value).toEqual(undefined);
  });

  it(`Sync, ${setup.name}: read/write`, () => {
    const storage = createStorage({
      use: new TestedInterface(),
      useCache: setup.useCache,
      name: 'settings',
    });

    storage.value = { c: [40, 42] };
    expect(storage.value).toEqual({ c: [40, 42] });
  });

  it(`Sync, ${setup.name}: different names`, () => {
    const storage = createStorage({
      use: new TestedInterface(),
      useCache: setup.useCache,
      name: 'settings',
    });

    storage.value = 10;

    expect(storage.value).toEqual(10);

    const storage2 = createStorage({
      use: new TestedInterface(),
      name: 'settings2',
    });

    expect(storage.value).toEqual(10);
    expect(storage2.value).toEqual(undefined);

    storage2.value = 20;

    expect(storage.value).toEqual(10);
    expect(storage2.value).toEqual(20);

    storage.clear();

    expect(storage.value).toEqual(undefined);
    expect(storage2.value).toEqual(20);
  });

  it(`Sync, ${setup.name}: case-sensitive`, () => {
    const storage = createStorage({
      use: new TestedInterface(),
      useCache: setup.useCache,
    });

    storage.value = 20;
    expect(storage.Value).toEqual(undefined);
    //             ^

    storage.Value = 30;
    //      ^
    expect(storage.value).toEqual(20);
  });

  it(`Sync, ${setup.name}: ref problem (need structuredClone)`, () => {
    const storage = createStorage({
      use: new TestedInterface(),
      useCache: setup.useCache,
    });

    // set value
    const a = { c: [40, 42] };
    storage.value = a;
    a.c = [30];
    expect(storage.value).toEqual({ c: [40, 42] });

    // get value
    const b = storage.value;
    (b as Record<string, unknown>).c = [40];
    expect(storage.value).toEqual({ c: [40, 42] });

    // Test new session, cache is empty
    const newStorage = createStorage({
      use: new TestedInterface(),
      useCache: setup.useCache,
    });

    // get value
    const t = newStorage.value;
    (t as Record<string, unknown>).c = [90];
    expect(newStorage.value).toEqual({ c: [40, 42] });
  });

  it(`Sync, ${setup.name}: delete storage`, () => {
    const storage = createStorage({
      use: new TestedInterface(),
      useCache: setup.useCache,
    });

    storage.value = 42;

    storage.deleteStorage();

    expect.assertions(1);
    try {
      // eslint-disable-next-line no-console
      console.log(storage.value);
    } catch (e) {
      expect((e as Error).message).toMatch(
        'This Storage was deleted!'
      );
    }
  });

  it(`Sync, ${setup.name}: null and undefined`, () => {
    const storage = createStorage({
      use: new TestedInterface(),
      useCache: setup.useCache,
    });

    storage.value = undefined;
    expect(storage.value).toEqual(undefined);

    storage.value = null;
    expect(storage.value).toEqual(null);
  });

  it(`Sync, ${setup.name}: addDefault`, () => {
    const storage = createStorage({
      use: new TestedInterface(),
      useCache: setup.useCache,
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
      use: new TestedInterface(),
      useCache: setup.useCache,
    });

    storage.addDefault({ value: 2, other: 7 });

    expect(storage.getDefault()).toEqual({ value: 2, other: 7 });
  });

  it(`Sync, ${setup.name}: setDefault`, () => {
    const storage = createStorage({
      use: new TestedInterface(),
      useCache: setup.useCache,
    });

    storage.addDefault({ value: 2, other: 7 });

    // Replace 'default'
    storage.setDefault({ value: 42 });

    expect(storage.value).toEqual(42);
    expect(storage.other).toEqual(undefined);
  });

  it(`Sync, ${setup.name}: clearDefault`, () => {
    const storage = createStorage({
      use: new TestedInterface(),
      useCache: setup.useCache,
    });

    storage.addDefault({ value: 2, other: 7 });

    storage.clearDefault();

    expect(storage.value).toEqual(undefined);
    expect(storage.other).toEqual(undefined);
  });

  it(`Sync, ${setup.name}: delete key`, () => {
    const storage = createStorage({
      use: new TestedInterface(),
      useCache: setup.useCache,
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
      use: new TestedInterface(),
      useCache: setup.useCache,
    });

    storage.addDefault({ value: 2 });
    storage.value = 4;

    storage.clear();
    storage.clearDefault();

    expect(storage.value).toEqual(undefined);
  });

  it(`Sync, ${setup.name}: size`, () => {
    const storage = createStorage({
      use: new TestedInterface(),
      useCache: setup.useCache,
    });

    storage.addDefault({ value: 2 });
    storage.value = 4;
    storage.other = 3;

    expect(storage.size()).toEqual(2);
  });

  it(`Sync, ${setup.name}: key`, () => {
    const storage = createStorage({
      use: new TestedInterface(),
      useCache: setup.useCache,
    });

    storage.addDefault({ value: 2 });
    storage.value = 4;

    expect(storage.key(0)).toEqual('value');
  });

  it(`Sync, ${setup.name}: iter`, () => {
    const storage = createStorage({
      use: new TestedInterface(),
      useCache: setup.useCache,
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

  it(`Sync, ${setup.name}: delete key + iteration`, () => {
    const storage = createStorage({
      use: new TestedInterface(),
      useCache: setup.useCache,
    });

    storage.value = 60;
    storage.value2 = 50;
    storage.value3 = 40;
    storage.value4 = 30;

    delete storage.value;
    delete storage.value3;

    expect(storage.value).toEqual(undefined);
    expect(storage.value2).toEqual(50);
    expect(storage.value3).toEqual(undefined);
    expect(storage.value4).toEqual(30);

    storage.value5 = 20;
    storage.value = 1;
    storage.value6 = 10;
    storage.value8 = 0;
    storage.value7 = 0;

    const array = storage.entries();

    expect(array).toEqual([
      ['value2', 50],
      ['value4', 30],
      ['value5', 20],
      ['value', 1],
      ['value6', 10],
      ['value8', 0],
      ['value7', 0],
    ]);
  });
});
