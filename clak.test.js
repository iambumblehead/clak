import test from 'node:test'
import assert from 'node:assert/strict'
import clak from './clak.mjs'

const csv = `
"id","key","en-US","ja-JP"
1,"forbidden","you are forbidden","あなたが駄目です"
2,"upstream_error","upstream error","それが駄目です"
3,"access_denied","access denied","あなたが入れない駄目です"
`.slice(1, -1)

test('should pass the test', () => {
  // memoize csv to a function returning lang store and tuples
  const c = clak(csv)

  // lang store defines lang priority and col position each lang
  const langs = c([ 'en-US', 'ja-JP' ])

  // tuple parsed row, uses scripted default when csv default missing
  const access_denied = c('access_denied', 'no access')
  assert.deepEqual(
    access_denied,
    ['access_denied','access denied','あなたが入れない駄目です'])

  assert.deepEqual(
    clak(access_denied, langs, ['ja-JP']),
    'あなたが入れない駄目です')

  assert.deepEqual(
    clak(access_denied, langs, ['en-US']),
    'access denied')

  assert.deepEqual(
    clak(access_denied, langs, ['es-ES']),
    'access denied')
})
