import { serializeAccessList } from '../accessList/serializeAccessList.js'
import { concatHex } from '../data/concat.js'
import { trimLeft } from '../data/trim.js'
import { InvalidSignatureVError } from '../errors/signature.js'
import { TransactionTypeNotImplementedError } from '../errors/transactionEnvelope.js'
import { toHex } from '../hex/toHex.js'
import { encodeRlp } from '../rlp/encode.js'
import { assertSignature } from '../signature/assertSignature.js'
import type { Signature } from '../types/signature.js'
import type {
  TransactionEnvelope,
  TransactionEnvelopeEip1559,
  TransactionEnvelopeEip2930,
  TransactionEnvelopeLegacy,
  TransactionEnvelopeSerialized,
  TransactionEnvelopeSerializedEip1559,
  TransactionEnvelopeSerializedEip2930,
  TransactionEnvelopeSerializedLegacy,
} from '../types/transactionEnvelope.js'
import type { ExactPartial, PartialBy } from '../types/utils.js'
import {
  assertTransactionEnvelopeEip1559,
  assertTransactionEnvelopeEip2930,
  assertTransactionEnvelopeLegacy,
} from './assertTransactionEnvelope.js'

export function serializeTransactionEnvelope<
  envelope extends TransactionEnvelope,
>(
  envelope: envelope,
  options: { signature?: Signature | undefined } = {},
): TransactionEnvelopeSerialized<envelope['type']> {
  if (envelope.type === 'legacy')
    return serializeTransactionEnvelopeLegacy(envelope, options) as never
  if (envelope.type === 'eip2930')
    return serializeTransactionEnvelopeEip2930(envelope, options) as never
  if (envelope.type === 'eip1559')
    return serializeTransactionEnvelopeEip1559(envelope, options) as never

  // TODO: EIP-4844, EIP-7702

  throw new TransactionTypeNotImplementedError({ type: envelope.type })
}

export function serializeTransactionEnvelopeLegacy(
  envelope: PartialBy<TransactionEnvelopeLegacy, 'type'>,
  options: { signature?: Signature | undefined } = {},
): TransactionEnvelopeSerializedLegacy {
  const { chainId = 0, gas, data, input, nonce, to, value, gasPrice } = envelope

  assertTransactionEnvelopeLegacy(envelope)

  let serializedTransaction = [
    nonce ? toHex(nonce) : '0x',
    gasPrice ? toHex(gasPrice) : '0x',
    gas ? toHex(gas) : '0x',
    to ?? '0x',
    value ? toHex(value) : '0x',
    data ?? input ?? '0x',
  ]

  const signature = (() => {
    if (options.signature)
      return {
        r: options.signature.r,
        s: options.signature.s,
        v: options.signature.yParity === 0 ? 27 : 28,
      }

    if (typeof envelope.r === 'undefined' || typeof envelope.s === 'undefined')
      return undefined
    return {
      r: envelope.r,
      s: envelope.s,
      v: envelope.v!,
    }
  })()

  if (signature) {
    const v = (() => {
      // EIP-155 (inferred chainId)
      if (signature.v >= 35) {
        const inferredChainId = Math.floor((signature.v - 35) / 2)
        if (inferredChainId > 0) return signature.v
        return 27 + (signature.v === 35 ? 0 : 1)
      }

      // EIP-155 (explicit chainId)
      if (chainId > 0) return chainId * 2 + 35 + signature.v - 27

      // Pre-EIP-155 (no chainId)
      const v = 27 + (signature.v === 27 ? 0 : 1)
      if (signature.v !== v)
        throw new InvalidSignatureVError({ value: signature.v })
      return v
    })()

    serializedTransaction = [
      ...serializedTransaction,
      toHex(v),
      signature.r === 0n ? '0x' : trimLeft(toHex(signature.r)),
      signature.s === 0n ? '0x' : trimLeft(toHex(signature.s)),
    ]
  } else if (chainId > 0)
    serializedTransaction = [
      ...serializedTransaction,
      toHex(chainId),
      '0x',
      '0x',
    ]

  return encodeRlp(serializedTransaction) as TransactionEnvelopeSerializedLegacy
}

export function serializeTransactionEnvelopeEip2930(
  envelope: PartialBy<TransactionEnvelopeEip2930, 'type'>,
  options: { signature?: Signature | undefined } = {},
): TransactionEnvelopeSerializedEip2930 {
  const { chainId, gas, data, input, nonce, to, value, accessList, gasPrice } =
    envelope
  const { signature } = options

  assertTransactionEnvelopeEip2930(envelope)

  const serializedAccessList = serializeAccessList(accessList)

  const serializedTransaction = [
    toHex(chainId),
    nonce ? toHex(nonce) : '0x',
    gasPrice ? toHex(gasPrice) : '0x',
    gas ? toHex(gas) : '0x',
    to ?? '0x',
    value ? toHex(value) : '0x',
    data ?? input ?? '0x',
    serializedAccessList,
    ...toSignatureTuple(signature || envelope),
  ] as const

  return concatHex(
    '0x01',
    encodeRlp(serializedTransaction),
  ) as TransactionEnvelopeSerializedEip2930
}

export function serializeTransactionEnvelopeEip1559(
  envelope: PartialBy<TransactionEnvelopeEip1559, 'type'>,
  options: { signature?: Signature | undefined } = {},
): TransactionEnvelopeSerializedEip1559 {
  const {
    chainId,
    gas,
    nonce,
    to,
    value,
    maxFeePerGas,
    maxPriorityFeePerGas,
    accessList,
    data,
    input,
  } = envelope
  const { signature } = options

  assertTransactionEnvelopeEip1559(envelope)

  const serializedAccessList = serializeAccessList(accessList)

  const serializedTransaction = [
    toHex(chainId),
    nonce ? toHex(nonce) : '0x',
    maxPriorityFeePerGas ? toHex(maxPriorityFeePerGas) : '0x',
    maxFeePerGas ? toHex(maxFeePerGas) : '0x',
    gas ? toHex(gas) : '0x',
    to ?? '0x',
    value ? toHex(value) : '0x',
    data ?? input ?? '0x',
    serializedAccessList,
    ...toSignatureTuple(signature || envelope),
  ]

  return concatHex(
    '0x02',
    encodeRlp(serializedTransaction),
  ) as TransactionEnvelopeSerializedEip1559
}

function toSignatureTuple(signature: ExactPartial<Signature>) {
  const { r, s, yParity } = signature

  try {
    assertSignature(signature)
  } catch {
    return []
  }

  return [
    yParity ? '0x01' : '0x',
    r === 0n ? '0x' : trimLeft(toHex(r!)),
    s === 0n ? '0x' : trimLeft(toHex(s!)),
  ] as const
}