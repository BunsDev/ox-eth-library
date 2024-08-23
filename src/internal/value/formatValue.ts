import type { GlobalErrorType } from '../errors/error.js'

/**
 * Formats a `bigint` Value to its string representation (divided by the given exponent).
 *
 * @example
 * ```ts
 * import { Value } from 'ox'
 *
 * Value.format(420_000_000_000n, 9)
 * // '420'
 * ```
 *
 * @param value - The `bigint` Value to format.
 * @param decimals - The exponent to divide the `bigint` Value by.
 *
 * @alias ox!Value.formatValue:function(1)
 */
export function formatValue(value: bigint, decimals = 0) {
  let display = value.toString()

  const negative = display.startsWith('-')
  if (negative) display = display.slice(1)

  display = display.padStart(decimals, '0')

  let [integer, fraction] = [
    display.slice(0, display.length - decimals),
    display.slice(display.length - decimals),
  ]
  fraction = fraction.replace(/(0+)$/, '')
  return `${negative ? '-' : ''}${integer || '0'}${
    fraction ? `.${fraction}` : ''
  }`
}

export declare namespace formatValue {
  type ErrorType = GlobalErrorType
}

/* v8 ignore next */
formatValue.parseError = (error: unknown) => error as formatValue.ErrorType
