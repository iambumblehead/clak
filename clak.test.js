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
  // const langs = clak(csv, [ 'en-US', 'ja-JP' ])
  // const access_denied = clak(csv, 'access_denied', 'no access')

  
  
  // return an object holding prefered language order
  // and position of each lang from a parsed row
  const c = clak(csv)
  const langs = c([ 'en-US', 'ja-JP' ])
  // const [ c, langs ] = clak(csv, [ 'en-US', 'ja-JP' ])

  // return the parsed row with default value populated
  const access_denied = c('access_denied', 'no access')
  // const langs = clak(csv, [ 'en-US', 'ja-JP' ])
  // const access_denied = clak(csv, 'access_denied', 'no access')
  
  // const cla = clak(csv, [ 'en-US', 'ja-JP' ])
  // const access_denied = cla('acces_denied', 'no access')
  

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
