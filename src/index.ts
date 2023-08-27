// Copyright (c) 2023-present Vadim Glinka
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option.

import {
  StorageInterface,
  type Setup,
  defaultStorageName,
  Ok,
} from 'storage-facade';

export const defaultUseCache = false;
export const defaultAsyncMode = false;

// localStorage returns `null`, not `undefined` if no value is found.
// For this reason, it is necessary to wrap values in order
// to be able to store `null` values.
export type WrappedValue = Record<'value', unknown>;

export interface LocalStorageSetup {
  // If you are using cache, don't create more than one instance at the same time
  useCache?: boolean;
  [key: string]: unknown;
}

export class LocalStorageInterface extends StorageInterface {
  interfaceName = 'LocalStorageInterface';

  storageName = '';

  keysArrayName = '';

  useCache: boolean = defaultUseCache;

  asyncMode: boolean = defaultAsyncMode;

  keysArrayCache: string[] = [];

  keyValueCache = new Map<string, unknown>();

  getKeysArray(): string[] {
    const keysStr = window.localStorage.getItem(this.keysArrayName);
    if (keysStr === null) {
      const err = this.interfaceError(
        `'${this.keysArrayName}' not found.`
      );
      throw err;
    }
    const keys = JSON.parse(keysStr) as string[];
    if (this.useCache) this.keysArrayCache = keys;
    return keys;
  }

  defaultAsyncMode(): boolean {
    return this.asyncMode;
  }

  initSync<T extends StorageInterface>(setup: Setup<T>): Error | Ok {
    this.storageName = setup.name ?? defaultStorageName;
    this.useCache = (setup.useCache as boolean) ?? defaultUseCache;
    this.keysArrayName = `__${this.storageName}-keys-array`;
    try {
      const keysStr = window.localStorage.getItem(this.keysArrayName);
      const isKeysArrayInStorage = keysStr !== null;
      if (!isKeysArrayInStorage) {
        // Create keysArray in storage
        window.localStorage.setItem(
          this.keysArrayName,
          JSON.stringify([])
        );
      }
      if (isKeysArrayInStorage && this.useCache) {
        const keysArray = JSON.parse(keysStr) as string[];
        // Load keysArray to cache
        this.keysArrayCache = keysArray;
      }
      return new Ok();
    } catch (e) {
      return e as Error;
    }
  }

  keyName(key: string): string {
    return `${this.storageName}-${key}`;
  }

  getItemSync(key: string): unknown {
    if (this.useCache && this.keyValueCache.has(key)) {
      return structuredClone(this.keyValueCache.get(key));
    }
    const valueStr = window.localStorage.getItem(this.keyName(key));
    if (valueStr === null) return undefined;
    const { value } = JSON.parse(valueStr) as WrappedValue;
    // Update keyValue cache
    if (this.useCache)
      this.keyValueCache.set(key, structuredClone(value));
    return value;
  }

  setItemSync(key: string, value: unknown): void {
    if (key === this.keysArrayName) {
      const err = this.interfaceError(`key '${key}' cannot be used.`);
      throw err;
    }
    const keysArray = this.useCache
      ? this.keysArrayCache
      : this.getKeysArray();
    const wrappedValue: WrappedValue = { value };
    if (!keysArray.includes(key)) {
      keysArray.push(key);
      // Update keys array in storage
      window.localStorage.setItem(
        this.keysArrayName,
        JSON.stringify(keysArray)
      );
      // Update keysArray cache
      if (this.useCache) this.keysArrayCache = keysArray;
    }
    // Update storage
    window.localStorage.setItem(
      this.keyName(key),
      JSON.stringify(wrappedValue)
    );
    // Update keyValue cache
    if (this.useCache) {
      this.keyValueCache.set(key, structuredClone(value));
    }
  }

  removeItemSync(key: string): void {
    const keysArray = this.useCache
      ? this.keysArrayCache
      : this.getKeysArray();
    const updatedKeysArray = keysArray //
      .filter((savedKey) => savedKey !== key);
    // Update keys array in storage
    window.localStorage.setItem(
      this.keysArrayName,
      JSON.stringify(updatedKeysArray)
    );
    // Delete key from storage
    window.localStorage.removeItem(this.keyName(key));
    // Update cache
    if (this.useCache) {
      this.keyValueCache.delete(key);
      this.keysArrayCache = updatedKeysArray;
    }
  }

  clearSync(): void {
    const keysArray = this.useCache
      ? this.keysArrayCache
      : this.getKeysArray();
    // Update storage
    keysArray.forEach((key) => {
      window.localStorage.removeItem(this.keyName(key));
    });
    // Update keys array
    window.localStorage.setItem(
      this.keysArrayName,
      JSON.stringify([])
    );
    // Update cache
    if (this.useCache) {
      this.keyValueCache.clear();
      this.keysArrayCache = [];
    }
  }

  sizeSync(): number {
    const keysArray = this.useCache
      ? this.keysArrayCache
      : this.getKeysArray();
    return keysArray.length;
  }

  keySync(index: number): string {
    const keysArray = this.useCache
      ? this.keysArrayCache
      : this.getKeysArray();
    return keysArray[index];
  }
}
