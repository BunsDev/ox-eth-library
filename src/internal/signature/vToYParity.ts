import type { GlobalErrorType } from '../errors/error.js'
import { InvalidSignatureVError } from '../errors/signature.js'
import type { Signature } from '../types/signature.js'

/** @internal */
export function vToYParity(v: number): Signature['yParity'] {
  if (v === 0 || v === 27) return 0
  if (v === 1 || v === 28) return 1
  if (v >= 35) return v % 2 === 0 ? 1 : 0
  throw new InvalidSignatureVError({ value: v })
}

export declare namespace vToYParity {
  type ErrorType = InvalidSignatureVError | GlobalErrorType
}