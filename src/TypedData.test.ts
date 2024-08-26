import { expect, test } from 'vitest'

import * as exports from './TypedData.js'

test('exports', () => {
  expect(Object.keys(exports)).toMatchInlineSnapshot(`
    [
      "InvalidPrimaryTypeError",
      "domainSeparator",
      "encodeType",
      "extractEip712DomainTypes",
      "hash",
      "hashDomain",
      "hashStruct",
      "serialize",
      "validate",
    ]
  `)
})
