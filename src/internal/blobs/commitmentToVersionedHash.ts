import type { GlobalErrorType } from '../errors/error.js'
import { sha256 } from '../hash/sha256.js'
import { bytesToHex } from '../hex/toHex.js'
import type { Bytes, Hex } from '../types/data.js'

/**
 * Transform a commitment to it's versioned hash.
 *
 * @example
 * ```ts
 * import { Blobs } from 'ox'
 * import { kzg } from './kzg'
 *
 * const blobs = Blobs.from('0xdeadbeef')
 * const [commitment] = Blobs.toCommitments(blobs, { kzg })
 * const versionedHash = Blobs.commitmentToVersionedHash(commitment)
 * ```
 */
export function commitmentToVersionedHash<
  const commitment extends Hex | Bytes,
  as extends 'Hex' | 'Bytes' =
    | (commitment extends Hex ? 'Hex' : never)
    | (commitment extends Bytes ? 'Bytes' : never),
>(
  commitment: commitment | Hex | Bytes,
  options: commitmentToVersionedHash.Options<as> = {},
): commitmentToVersionedHash.ReturnType<as> {
  const { version = 1 } = options
  const as = options.as ?? (typeof commitment === 'string' ? 'Hex' : 'Bytes')

  const versionedHash = sha256(commitment, 'Bytes')
  versionedHash.set([version], 0)
  return (
    as === 'Bytes' ? versionedHash : bytesToHex(versionedHash)
  ) as commitmentToVersionedHash.ReturnType<as>
}

export declare namespace commitmentToVersionedHash {
  type Options<as extends 'Hex' | 'Bytes' | undefined = undefined> = {
    /** Return type. */
    as?: as | 'Hex' | 'Bytes' | undefined
    /** Version to tag onto the hash. */
    version?: number | undefined
  }

  type ReturnType<as extends 'Hex' | 'Bytes' = 'Hex' | 'Bytes'> =
    | (as extends 'Bytes' ? Bytes : never)
    | (as extends 'Hex' ? Hex : never)

  type ErrorType = GlobalErrorType
}

commitmentToVersionedHash.parseError = (error: unknown) =>
  /* v8 ignore next */
  error as commitmentToVersionedHash.ErrorType
