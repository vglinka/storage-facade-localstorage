# 🔥 Storage facade localStorage

An simple way to store data in localStorage.
Supports caching, iteration and default values.
Written in TypeScript.
Uses the [storage-facade](https://www.npmjs.com/package/storage-facade)
library which is provides a single storage API that abstracts over
the actual storage implementation. 

## Installation

```sh
npm install storage-facade storage-facade-localstorage
```

# Usage

## Storage methods

- `.clear()` - removes all key-value pairs from the storage
- `.entries()` - returns an array of key-value pairs
- `.size()` - returns the number of key-value pairs
- `.key(index: number)` - returns the name of the key by its index

The `key` and `size` methods can be used to create custom iterators.

## '...Default' methods

The default values are used if the value in the storage is `undefined`.
Default values are not stored in the storage, but in the instance.

- `.addDefault(obj: Record<string, unknown>)` - adds keys and values
  from the passed object to the list of default values
- `.setDefault(obj: Record<string, unknown>)` - replaces the list
  of default values with the given object
- `.getDefault()` - returns an object containing default values
- `.clearDefault()` - replaces a list of default values with an empty object

## Examples

### Read/Write/Delete
  
```TypeScript
import { createStorage } from 'storage-facade';
import { LocalStorageInterface } from 'storage-facade-localstorage';

const storage = createStorage({
  use: new LocalStorageInterface({
    // If you are using cache,
    // don't create more than one instance at the same time
    useCache: true,  
  }),
  asyncMode: false, // localStorage is synchronous storage 
  name: 'settings'; // Storage name, optional
});

// If an initialization error occurs,
// it will be thrown on the first attempt to read/write
try {
  storage.value = { c: [40, 42] };
  console.log(storage.value); // { c: [40, 42] }
  
  delete storage.value;
  console.log(storage.value); // undefined
  
  storage.value = 30;
  console.log(storage.value); // 30
  
  storage.clear();
  console.log(storage.value); // undefined
} catch (e) {
  console.error((e as Error).message);
}
```

### Iteration `.entries()`

```TypeScript
import { createStorage } from 'storage-facade';
import { LocalStorageInterface } from 'storage-facade-localstorage';

const storage = createStorage({
  use: new LocalStorageInterface({
    useCache: true,
  }),
  asyncMode: false,
});

try {
  storage.value = 4;
  storage.other = 5;

  const array = storage
    .entries()
    .map(([key, value]) => {
      // ... add code here ...
      return [key, value];
    });

  console.log(array)
  /*
    [
      ['value', 4],
      ['other', 5],
    ]
  */
} catch (e) {
  console.error((e as Error).message);
}
```

### '...Default' methods

```TypeScript
import { createStorage } from 'storage-facade';
import { LocalStorageInterface } from 'storage-facade-localstorage';

const storage = createStorage({
  use: new LocalStorageInterface({
    useCache: true,
  }),
  asyncMode: false,
});

try {
  console.log(storage.value) // undefined

  storage.addDefault({ value: 9, other: 3 });
  storage.addDefault({ value: 1, value2: 2 });
  
  // Since `storage.value = undefined` the default value is used
  console.log(storage.value);  // 1
  
  console.log(storage.value2); // 2
  console.log(storage.other);  // 3

  storage.value = 42;
  // When we set a value other than `undefined`,
  // the default value is no longer used
  console.log(storage.value); // 42

  storage.value = undefined;
  console.log(storage.value); // 1

  storage.value = null;
  console.log(storage.value); // null
  
  delete storage.value;
  console.log(storage.value); // 1
  
  // getDefault
  console.log(storage.getDefault()); // { value: 1, value2: 2 }
  
  // Replace 'default'
  storage.setDefault({ value: 30 });

  console.log(storage.value); // 30
  console.log(storage.value2); // undefined
  
  // clearDefault
  storage.clearDefault();
  
  console.log(storage.value); // undefined
  console.log(storage.value2); // undefined
} catch (e) {
  console.error((e as Error).message);
}
```

# Limitations

## Use only first level keys

Only first-level keys (like `storage.a =`, but not `storage.a[0] =`
or `storage.a.b =`) are in sync with the storage.

Assigning keys of the second or more levels will not give any effect.

Instead, use the following approach:

```TypeScript
  // Get object
  const updatedValue = storage.value;
  // Modify the inner content of an object
  updatedValue.user.data = 42;
  // Update storage
  storage.value = updatedValue;
```

## If you are using caching

1. Don't create more than one instance at the same time.
2. Values should be of any [structured-cloneable type](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm#supported_types).

## Don't use banned key names

There is a list of key names that cannot be used because they are the same
as built-in method names: [`open`, `clear`, `size`, `key`, `getEntries`,
`entries`, `addDefault`, `setDefault`, `getDefault`, `clearDefault`].

Use the `keyIsNotBanned` function to check the key if needed.

```TypeScript
import { createStorage, keyIsNotBanned } from 'storage-facade';
import { LocalStorageInterface } from 'storage-facade-localstorage';

const storage = createStorage({
  use: new LocalStorageInterface({
    useCache: true,
  }),
  asyncMode: false,
});

try {
  const myNewKey = 'newKey';
  if (keyIsNotBanned(myNewKey)) {
    storage[myNewKey] = 42;
  }
} catch (e) {
  console.error((e as Error).message);
}
```

## Keys are `string`

Only values of type `string` can be used as keys.

## Values for `...Default` methods should be of any structured-cloneable type

This can be any [structured-cloneable type (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm#supported_types). 






