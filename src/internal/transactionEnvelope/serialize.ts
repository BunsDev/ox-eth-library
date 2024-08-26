import type { BlobSidecars } from '../blobs/types.js'
import type { GlobalErrorType } from '../errors/error.js'
import type { Hex } from '../hex/types.js'
import type { Signature } from '../signature/types.js'
import { TransactionEnvelopeEip1559_serialize } from './eip1559/serialize.js'
import { TransactionEnvelopeEip2930_serialize } from './eip2930/serialize.js'
import { TransactionEnvelopeEip4844_serialize } from './eip4844/serialize.js'
import { TransactionTypeNotImplementedError } from './errors.js'
import { TransactionEnvelopeLegacy_serialize } from './legacy/serialize.js'
import type {
  TransactionEnvelope,
  TransactionEnvelope_Serialized,
} from './types.js'

/**
 * Serializes a {@link TransactionEnvelope#TransactionEnvelope}.
 *
 * @example
 * ```ts
 * import { TransactionEnvelope } from 'ox'
 *
 * const envelope = TransactionEnvelope.from({
 *   chainId: 1,
 *   maxFeePerGas: Value.fromGwei('10'),
 *   maxPriorityFeePerGas: Value.fromGwei('1'),
 *   to: '0x0000000000000000000000000000000000000000',
 *   value: Value.fromEther('1'),
 * })
 *
 * const serialized = TransactionEnvelope.serialize(envelope)
 * // '0x...'
 * ```
 */
export function TransactionEnvelope_serialize<
  envelope extends TransactionEnvelope,
>(
  envelope: envelope,
  options: TransactionEnvelope_serialize.Options = {},
): TransactionEnvelope_serialize.ReturnType<envelope> {
  if (envelope.type === 'legacy')
    return TransactionEnvelopeLegacy_serialize(envelope, options) as never
  if (envelope.type === 'eip2930')
    return TransactionEnvelopeEip2930_serialize(envelope, options) as never
  if (envelope.type === 'eip1559')
    return TransactionEnvelopeEip1559_serialize(envelope, options) as never
  if (envelope.type === 'eip4844')
    return TransactionEnvelopeEip4844_serialize(envelope, options) as never

  // TODO: EIP-7702

  throw new TransactionTypeNotImplementedError({ type: envelope.type })
}

export declare namespace TransactionEnvelope_serialize {
  type Options = {
    /** Signature to append to the serialized Transaction Envelope. */
    signature?: Signature | undefined
    /** (EIP-4844 only) Sidecars to append to the serialized Transaction Envelope. */
    sidecars?: BlobSidecars<Hex> | undefined
  }

  type ReturnType<envelope extends TransactionEnvelope = TransactionEnvelope> =
    TransactionEnvelope_Serialized<envelope['type']>

  type ErrorType =
    | TransactionEnvelopeLegacy_serialize.ErrorType
    | TransactionEnvelopeEip2930_serialize.ErrorType
    | TransactionEnvelopeEip1559_serialize.ErrorType
    | TransactionEnvelopeEip4844_serialize.ErrorType
    | TransactionTypeNotImplementedError
    | GlobalErrorType
}

TransactionEnvelope_serialize.parseError = (error: unknown) =>
  /* v8 ignore next */
  error as TransactionEnvelope_serialize.ErrorType
