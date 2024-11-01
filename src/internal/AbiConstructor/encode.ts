import type { AbiParametersToPrimitiveTypes } from 'abitype'
import * as AbiParameters from '../../AbiParameters.js'
import type * as Errors from '../../Errors.js'
import * as Hex from '../../Hex.js'
import type { IsNarrowable } from '../types.js'
import type { AbiConstructor } from './types.js'

/**
 * ABI-encodes the provided constructor input (`inputs`).
 *
 * @example
 * ```ts twoslash
 * import { AbiConstructor } from 'ox'
 *
 * const constructor = AbiConstructor.from('constructor(address, uint256)')
 *
 * const data = AbiConstructor.encode(constructor, {
 *   bytecode: '0x...',
 *   args: ['0xd8da6bf26964af9d7eed9e03e53415d37aa96045', 123n],
 * })
 * ```
 *
 * @example
 * ### End-to-end
 *
 * Below is an end-to-end example of using `AbiConstructor.encode` to encode the constructor of a contract and deploy it.
 *
 * ```ts twoslash
 * import 'ox/window'
 * import { AbiConstructor, Hex } from 'ox'
 *
 * // 1. Instantiate the ABI Constructor.
 * const constructor = AbiConstructor.from(
 *   'constructor(address owner, uint256 amount)',
 * )
 *
 * // 2. Encode the ABI Constructor.
 * const data = AbiConstructor.encode(constructor, {
 *   bytecode: '0x...',
 *   args: ['0xd8da6bf26964af9d7eed9e03e53415d37aa96045', 123n],
 * })
 *
 * // 3. Deploy the contract.
 * const hash = await window.ethereum!.request({
 *   method: 'eth_sendTransaction',
 *   params: [{ data }],
 * })
 * ```
 *
 * :::note
 *
 * For simplicity, the above example uses `window.ethereum.request`, but you can use any
 * type of JSON-RPC interface.
 *
 * :::
 *
 * @param abiConstructor - The ABI Constructor to encode.
 * @param options - Encoding options.
 * @returns The encoded constructor.
 */
export function AbiConstructor_encode<
  const abiConstructor extends AbiConstructor,
>(
  abiConstructor: abiConstructor | AbiConstructor,
  options: AbiConstructor_encode.Options<abiConstructor>,
): Hex.Hex {
  const { bytecode, args } = options
  return Hex.concat(
    bytecode,
    abiConstructor.inputs?.length && args?.length
      ? AbiParameters.encode(abiConstructor.inputs, args as readonly unknown[])
      : '0x',
  )
}

export declare namespace AbiConstructor_encode {
  type Options<abiConstructor extends AbiConstructor = AbiConstructor> = {
    bytecode: Hex.Hex
  } & (IsNarrowable<abiConstructor, AbiConstructor> extends true
    ? AbiParametersToPrimitiveTypes<
        abiConstructor['inputs']
      > extends readonly []
      ? { args?: undefined }
      : { args: AbiParametersToPrimitiveTypes<abiConstructor['inputs']> }
    : { args?: readonly unknown[] | undefined })

  type ErrorType = Errors.GlobalErrorType
}

AbiConstructor_encode.parseError = (error: unknown) =>
  /* v8 ignore next */
  error as AbiConstructor_encode.ErrorType
