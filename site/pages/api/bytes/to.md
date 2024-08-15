---
description: Decodes Bytes into a string, number, bigint, boolean, or hex value.
---

# Bytes.to 

**Alias:** `fromBytes`

Decodes [Bytes](/api/bytes) into a string, number, bigint, boolean, or hex value.

## Imports

```ts twoslash
// @noErrors
// Namespace 
import { Bytes } from 'ox'

// Module
import * as Bytes from 'ox/Bytes'

// Function
import { fromBytes } from 'ox/Bytes'
```

## Usage

```ts twoslash
// @noErrors
import { Bytes } from 'ox';

const value = Bytes.to(Bytes.from([1, 164]), 'number')
// 420

const value = Bytes.to(Bytes.from([119, 97, 103, 109, 105]), 'string')
// 'wagmi'
```

## Parameters

### bytes

- **Type:** `Uint8Array`

Bytes to decode.

```ts twoslash
import { Bytes } from 'ox';

const value = Bytes.to(
  Bytes.from([1, 164]), // [!code focus]
  'number'
)
```

### to

- **Type:** `'string' | 'hex' | 'bigint' | 'number' | 'boolean'`

Decode Bytes into the specified type.

```ts twoslash
import { Bytes } from 'ox';

const value = Bytes.to(
  Bytes.from([1, 164]), 
  'number' // [!code focus]
)
```

### options

#### options.size

- **Type:** `number`

Maximum size of the input Bytes. Sizes exceeding this value will throw an error.

```ts twoslash
import { Bytes } from 'ox';

const value = Bytes.to(
  Bytes.from([1, 164]), 
  'number',
  { size: 2 } // [!code focus]
)
```