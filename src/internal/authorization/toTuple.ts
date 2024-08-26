import type { GlobalErrorType } from '../errors/error.js'
import { Hex_fromNumber } from '../hex/from.js'
import { Signature_extract } from '../signature/extract.js'
import { Signature_toTuple } from '../signature/toTuple.js'
import type { Signature } from '../signature/types.js'
import type { Compute } from '../types.js'
import type { Authorization, Authorization_Tuple } from './types.js'

/**
 * Converts an {@link Authorization#Authorization} to an {@link Authorization#Tuple}.
 *
 * @example
 * // TODO
 */
export function Authorization_toTuple<
  const authorization extends Authorization,
>(
  authorization: authorization,
): Authorization_toTuple.ReturnType<authorization> {
  const { contractAddress, chainId, nonce } = authorization
  const signature = Signature_extract(authorization)
  return [
    Hex_fromNumber(chainId),
    contractAddress,
    Hex_fromNumber(nonce),
    ...(signature ? Signature_toTuple(signature) : []),
  ] as never
}

export declare namespace Authorization_toTuple {
  type ReturnType<authorization extends Authorization = Authorization> =
    Compute<Authorization_Tuple<authorization extends Signature ? true : false>>

  type ErrorType = GlobalErrorType
}

Authorization_toTuple.parseError = (error: unknown) =>
  /* v8 ignore next */
  error as Authorization_toTuple.ErrorType