import { maxUint256 } from '../constants/number.js'
import type { GlobalErrorType } from '../errors/error.js'
import {
  InvalidSignatureRError,
  InvalidSignatureSError,
  InvalidSignatureYParityError,
  MissingSignaturePropertiesError,
} from '../errors/signature.js'
import type { Signature } from '../types/signature.js'
import type { ExactPartial } from '../types/utils.js'

/**
 * Asserts that the signature is valid.
 *
 * @example
 * ```ts
 * import { Signature } from 'ox'
 *
 * Signature.assert({
 *   r: -49782753348462494199823712700004552394425719014458918871452329774910450607807n,
 *   s: 33726695977844476214676913201140481102225469284307016937915595756355928419768n,
 *   yParity: 1,
 * })
 * // InvalidSignatureRError: Value `-549...n` is an invalid r value. r must be a positive integer less than 2^256.
 * ```
 *
 * @alias ox!Signature.assertSignature:function(1)
 */
export function assertSignature(
  signature: ExactPartial<Signature>,
): asserts signature is Signature {
  if (typeof signature.r === 'undefined')
    throw new MissingSignaturePropertiesError({ signature })
  if (typeof signature.s === 'undefined')
    throw new MissingSignaturePropertiesError({ signature })
  if (typeof signature.yParity === 'undefined')
    throw new MissingSignaturePropertiesError({ signature })
  if (signature.r < 0n || signature.r > maxUint256)
    throw new InvalidSignatureRError({ value: signature.r })
  if (signature.s < 0n || signature.s > maxUint256)
    throw new InvalidSignatureSError({ value: signature.s })
  if (signature.yParity !== 0 && signature.yParity !== 1)
    throw new InvalidSignatureYParityError({ value: signature.yParity })
}

export declare namespace assertSignature {
  type ErrorType =
    | MissingSignaturePropertiesError
    | InvalidSignatureRError
    | InvalidSignatureSError
    | InvalidSignatureYParityError
    | GlobalErrorType
}
