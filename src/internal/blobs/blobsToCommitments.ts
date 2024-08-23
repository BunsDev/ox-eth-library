import { hexToBytes } from '../bytes/toBytes.js'
import type { GlobalErrorType } from '../errors/error.js'
import { bytesToHex } from '../hex/toHex.js'
import type { Blobs } from '../types/blob.js'
import type { Bytes, Hex } from '../types/data.js'
import type { Kzg } from '../types/kzg.js'
import type { Compute } from '../types/utils.js'

/**
 * Compute commitments from a list of blobs.
 *
 * @example
 * ```ts
 * import { Blobs } from 'ox'
 * import { kzg } from './kzg'
 *
 * const blobs = Blobs.from('0xdeadbeef')
 * const commitments = Blobs.toCommitments(blobs, { kzg })
 * ```
 *
 * @alias ox!Blobs.blobsToCommitments:function(1)
 */
export function blobsToCommitments<
  const blobs extends Blobs<Bytes> | Blobs<Hex>,
  as extends 'Hex' | 'Bytes' =
    | (blobs extends Blobs<Hex> ? 'Hex' : never)
    | (blobs extends Blobs<Bytes> ? 'Bytes' : never),
>(
  blobs_: blobs | Blobs<Bytes> | Blobs<Hex>,
  options: blobsToCommitments.Options<as>,
): blobsToCommitments.ReturnType<as> {
  const { kzg } = options

  const as = options.as ?? (typeof blobs_[0] === 'string' ? 'Hex' : 'Bytes')
  const blobs = (
    typeof blobs_[0] === 'string'
      ? blobs_.map((x) => hexToBytes(x as any))
      : blobs_
  ) as Bytes[]

  const commitments: Bytes[] = []
  for (const blob of blobs)
    commitments.push(Uint8Array.from(kzg.blobToKzgCommitment(blob)))

  return (
    as === 'Bytes' ? commitments : commitments.map((x) => bytesToHex(x))
  ) as never
}

export declare namespace blobsToCommitments {
  type Options<as extends 'Hex' | 'Bytes' = 'Hex'> = {
    /** KZG implementation. */
    kzg: Pick<Kzg, 'blobToKzgCommitment'>
    /** Return type. */
    as?: as | 'Hex' | 'Bytes' | undefined
  }

  type ReturnType<as extends 'Hex' | 'Bytes' = 'Hex' | 'Bytes'> = Compute<
    | (as extends 'Bytes' ? readonly Bytes[] : never)
    | (as extends 'Hex' ? readonly Hex[] : never)
  >

  type ErrorType = hexToBytes.ErrorType | bytesToHex.ErrorType | GlobalErrorType
}

blobsToCommitments.parseError = (error: unknown) =>
  /* v8 ignore next */
  error as blobsToCommitments.ErrorType
