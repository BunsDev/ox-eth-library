import { secp256k1 } from '@noble/curves/secp256k1'

import { hexToBytes } from '../bytes/toBytes.js'
import type { GlobalErrorType } from '../errors/error.js'
import type { Bytes, Hex } from '../types/data.js'
import type {
  CompactSignature,
  LegacySignature,
  Signature,
} from '../types/signature.js'
import type { OneOf } from '../types/utils.js'
import { signatureToCompactSignature } from './signatureToCompactSignature.js'
import { vToYParity } from './vToYParity.js'

type To = 'bytes' | 'hex'

/**
 * Serializes a {@link Signature} (or an [EIP-2098](https://eips.ethereum.org/EIPS/eip-2098) {@link CompactSignature}) to {@link Hex} or {@link Bytes}.
 *
 * @example
 * ```ts
 * import { Signature } from 'ox'
 *
 * const signature = Signature.serialize({
 *   r: 49782753348462494199823712700004552394425719014458918871452329774910450607807n,
 *   s: 33726695977844476214676913201140481102225469284307016937915595756355928419768n,
 *   yParity: 1
 * })
 * // '0x6e100a352ec6ad1b70802290e18aeed190704973570f3b8ed42cb9808e2ea6bf4a90a229a244495b41890987806fcbd2d5d23fc0dbe5f5256c2613c039d76db81c'
 * ```
 *
 * @example
 * ```ts
 * import { Signature } from 'ox'
 *
 * const signature = Signature.serialize({
 *   r: 47323457007453657207889730243826965761922296599680473886588287015755652701072n,
 *   yParityAndS:
 *     57228803202727131502949358313456071280488184270258293674242124340113824882788n,
 * })
 * // '0x68a020a209d3d56c46f38cc50a33f704f4a9a10a59377f8dd762ac66910e9b907e865ad05c4035ab5792787d4a0297a43617ae897930a6fe4d822b8faea52064'
 * ```
 *
 */
export function serializeSignature<to extends To = 'hex'>(
  signature_: OneOf<Signature | LegacySignature | CompactSignature>,
  options: serializeSignature.Options<to> = {},
): serializeSignature.ReturnType<to> {
  const { compact = false, to = 'hex' } = options

  const isCompact = compact || typeof signature_.yParityAndS === 'bigint'
  const r = signature_.r
  const s = (() => {
    if (compact)
      return signatureToCompactSignature(signature_ as Signature).yParityAndS
    if (isCompact) return signature_.yParityAndS
    return signature_.s
  })()
  let signature = `0x${new secp256k1.Signature(r, s!).toCompactHex()}` as const

  // If the signature is not compact, add the recovery byte to the signature.
  if (!isCompact) {
    const yParity = signature_.yParity ?? vToYParity(signature_.v!)
    signature = `${signature}${yParity === 0 ? '00' : '01'}`
  }

  if (to === 'hex') return signature as serializeSignature.ReturnType<to>
  return hexToBytes(signature) as serializeSignature.ReturnType<to>
}

export declare namespace serializeSignature {
  type Options<to extends To = 'hex'> = {
    compact?: boolean | undefined
    to?: to | To | undefined
  }

  type ReturnType<to extends To = 'hex'> =
    | (to extends 'hex' ? Hex : never)
    | (to extends 'bytes' ? Bytes : never)

  type ErrorType =
    | hexToBytes.ErrorType
    | signatureToCompactSignature.ErrorType
    | vToYParity.ErrorType
    | GlobalErrorType
}

serializeSignature.parseError = (error: unknown) =>
  error as serializeSignature.ErrorType