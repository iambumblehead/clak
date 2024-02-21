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

test('should return full in-order list, when priority list smaller', () => {
  // memoize csv to a function returning lang store and tuples
  const c = clak(csv)

  assert.deepEqual(
    c([ 'en-US' ]),
    [[ 'en-US', 'ja-JP' ], { 'en-US': 1, 'ja-JP': 2 } ])

  assert.deepEqual(
    c([ 'ja-JP', 'en-US' ]),
    [[ 'ja-JP', 'en-US' ], { 'ja-JP': 2, 'en-US': 1 } ])

  assert.deepEqual(
    c([ 'ja-JP' ]),
    [[ 'ja-JP', 'en-US' ], { 'ja-JP': 2, 'en-US': 1 } ])  
})

const csv639_2 = `
"id","key","eng-US","jap-JP"
1,"forbidden","you are forbidden","あなたが駄目です"
2,"upstream_error","upstream error","それが駄目です"
3,"access_denied","access denied","あなたが入れない駄目です"
`.slice(1, -1)

test('should pass the test, three-letter language format', () => {
  // memoize csv to a function returning lang store and tuples
  const c = clak(csv639_2)

  // lang store defines lang priority and col position each lang
  const langs = c([ 'eng-US', 'jap-JP' ])

  // tuple parsed row, uses scripted default when csv default missing
  const access_denied = c('access_denied', 'no access')

  assert.deepEqual(
    access_denied,
    ['access_denied','access denied','あなたが入れない駄目です'])

  assert.deepEqual(
    clak(access_denied, langs, ['jap-JP']),
    'あなたが入れない駄目です')

  assert.deepEqual(
    clak(access_denied, langs, ['eng-US']),
    'access denied')

  assert.deepEqual(
    clak(access_denied, langs, ['esp-ES']),
    'access denied')
})

const csvbigger = `
"id","key","en-US"
1,"forbidden","Forbidden ヾ(・ω・)ノ. Insufficient Authorization."
2,"oauth_access_denied","Access denied."
3,"oauth_authorization_pending","Authorization pending."
4,"oauth_invalid_client","Client authentication failed."
5,"oauth_invalid_grant","Requested grant type is undefined or invalid."
6,"oauth_invalid_grant_bad_credentials","Requested grant type includes invalid credentials."
7,"oauth_invalid_request","Invalid request details."
8,"oauth_invalid_request_code_challenge","Invalid request code challenge."
9,"oauth_invalid_request_missing_fields","Missing fields: {fields}"
10,"oauth_invalid_request_tenant","Invalid tenant."
11,"oauth_invalid_scope","Requested scope is undefined or invalid."
12,"oauth_server_error","Un-expected server error."
13,"oauth_slowdown","Slow down, wait longer between requests."
14,"oauth_unauthorized_client","Client is unauthorized for the grant type."
15,"oauth_unsupported_grant_type","Un-supported grant type."
16,"oauth_unsupported_response_type","Un-supported response type."
17,"upstream","Upstream error (☆_@). Something is wrong. {statusCode} {statusMessage}"
18,"validation_input_display_name_already_used","Validation failed, display name is already used ""{display_name}""."
19,"validation_input_display_name_must_be_string_length","Validation failed, display name must contain at least {len} characters."
20,"validation_input_email_already_used","Validation failed, email is already used ""{email}""."
21,"validation_input_email_invalid","Validation failed, email is invalid ""{email}""."
22,"validation_input_email_or_token_invalid","Validation failed, Your email or activation token are invalid or expired."
23,"validation_input_missing_params","Validation failed, missing parameters: {fields}"
24,"validation_input_password_must_be_string_length","Validation failed, password must contain at least {len} characters."
25,"validation_token_invalid","Validation failed, token is invalid."
`.slice(1, -1)

test('should handle nested double quote', () => {
  const c = clak(csvbigger)
  c.warn_disable()
  
  // tuple parsed row, uses scripted default when csv default missing
  const access_denied = c('access_denied', 'no access')

  // missing key
  assert.deepEqual(
    access_denied,
    ['access_denied','no access'])

  const validation_input_display_name_already_used = c(
    'validation_input_display_name_already_used',
    'name already used')

  assert.deepEqual(
    validation_input_display_name_already_used, [
      'validation_input_display_name_already_used',
      'Validation failed, display name is already used ""{display_name}"".'
    ])
})

const csvNoEnglish = `
"id","key","es-CL","ja-JP"
1,"forbidden","you are forbidden","あなたが駄目です"
2,"upstream_error","upstream error","それが駄目です"
3,"access_denied","access denied","あなたが入れない駄目です"
`.slice(1, -1)

test('should allow configurable default language', () => {
  // memoize csv to a function returning lang store and tuples
  const c = clak(csvNoEnglish, 'ja-JP')

  // lang store defines lang priority and col position each lang
  const langs = c([ 'ja-JP', 'es-CL' ])

  // tuple parsed row, uses scripted default when csv default missing
  const access_denied = c('access_denied', 'no accesso')

  assert.deepEqual(
    clak(access_denied, langs, ['es-ES']),
    'あなたが入れない駄目です')
})

