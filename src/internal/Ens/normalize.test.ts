import { Ens } from 'ox'
import { expect, test } from 'vitest'

test.each([
  { name: 'awkweb.eth', expected: 'awkweb.eth' },
  { name: 'Awkweb.eth', expected: 'awkweb.eth' },
  { name: '🖖.eth', expected: '🖖.eth' },
  { name: 'awkw𝝣b.eth', expected: 'awkwξb.eth' },
  { name: '\u{0061}wkweb.eth', expected: 'awkweb.eth' },
  { name: '\u{0061}wkw\u{0065}b.eth', expected: 'awkweb.eth' },
  { name: 'awkweb.eth', expected: 'awkweb.eth' },
  //       ^ latin small "a"
  { name: 'awkweb.eth', expected: 'awkweb.eth' },
  //           ^ latin small "e"
])("normalize('$name') -> '$expected'", ({ name, expected }) => {
  expect(Ens.normalize(name)).toBe(expected)
})

test('invalid label extension', () => {
  expect(() => Ens.normalize('34--A.eth')).toThrowErrorMatchingInlineSnapshot(
    `[Error: Invalid label "34--A"‎: invalid label extension: "34--"]`,
  )
})

test('illegal placement: leading combining mark', () => {
  expect(() => Ens.normalize('\u{303}.eth')).toThrowErrorMatchingInlineSnapshot(
    `[Error: Invalid label "◌̃"‎: illegal placement: leading combining mark]`,
  )
})

test('underscore allowed only at start', () => {
  expect(() => Ens.normalize('a_b_c.eth')).toThrowErrorMatchingInlineSnapshot(
    `[Error: Invalid label "a_b_c"‎: underscore allowed only at start]`,
  )
})
