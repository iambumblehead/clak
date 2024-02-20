
<h3 align="center"><img src="https://imgur.com/2nEIMc8.png" alt="logo" height="100px"></h3>
<p align="center"><code>clak</code> parsing csv sources to return international content</p>

<p align="center">
<a href="https://www.npmjs.com/package/clak"><img src="https://img.shields.io/npm/v/clak"></a>
<a href="https://github.com/iambumblehead/clak/workflows"><img src="https://github.com/iambumblehead/clak/workflows/test/badge.svg"></a>
<a href="./LICENSE.md"><img src="https://img.shields.io/badge/license-ISC-blue.svg"></a>
</p>

``` javascript
clak(access_denied, langs, ['ja-JP']) // 'あなたが入れない駄目です'
```

 * `clak` is small and does one thing: process csv sources,
 * `clak` uses [unity-style csv file formats,][1]
 * `clak` is functions with no Java-OOP ceremony,
 * `clak` is ~100 lines of code, no dependencies,
 * `clak` does not "load" csv files, allows your app to do that,
 * `clak` returns lazy functions that will parse values when needed only,
 * `clak` works in a browser or node environment,
 * `clak` can resolve values at the "last moment" from request header and browser navigator locales
 

[0]: https://github.com/iambumblehead/clak
[1]: https://docs.unity3d.com/Packages/com.unity.localization@1.2/manual/CSV.html
[2]: https://github.com/nanostores/nanostores
[3]: https://github.com/nanostores/i18n


In a nutshell, `clak` functions are used in this sort of sequence,
 1. analyze the csv file,
    * `c = clak(csv)`
 2. analyze and persist the precedence, order and positions of each locale in the csv file,
    * `langs = c(['en-US','ja-JP'])`
 3. define lazy-lookup functions with default values for each key,
    * `const access_denied = c('access_denied', 'no access')`
 4. resolve an i18n value, calling the lazy-lookup function with a locale
    * `clak(access_denied, langs, ['ja-JP']) // 'あなたが入れない駄目です'`

```javascript
// Supports both two and three letter language id ex, 'en' or 'eng'
const csv = `
"id","key","en-US","ja-JP"
1,"forbidden","you are forbidden","あなたが駄目です"
2,"upstream_error","upstream error","それが駄目です"
3,"access_denied","access denied","あなたが入れない駄目です"
`.slice(1, -1)

// memoize csv to a function returning lang store and tuples
const c = clak(csv, 'en-US') // optional second param, default lang

// lang store defines lang priority; number is lang col position
// ex, [['en-US','ja-JP'], {'en-US': 2, 'ja-JP': 3}]
const langs = c(['en-US','ja-JP'])

// row tuple, if default key has no value from csv, uses scripted default
// ex, ['access_denied','access denied','あなたが入れない駄目です']
const access_denied = c('access_denied', 'no access')

// from each tuple to return the final language-specific value needed.
clak(access_denied, langs, ['ja-JP']) // 'あなたが入れない駄目です'
clak(access_denied, langs, ['en-US']) // 'access denied'
clak(access_denied, langs, ['es-ES']) // 'access denied'

// Where lists of languages are used, a priority order is given so if
// a value for the language at the front of the list is not found,
// a value for the next language in the list will be used and so on.
//
// Using one-item lists and no fallback is fine. Clak will fallback to
// the found or scripted value of the default language, usually "en-US"
```


`clak` optionally prints missing row details.
``` javascript
c('forbidden', 'no access') // [!!!] clak: missing row: forbidden
c.warn_disable() // disable warning messages
c('forbidden', 'no access')
```

`clak` only returns language strings, so minimal examples of related useful things are demonstrated below..

<details>
  <summary>minimal template solution</summary>

``` javascript
const tpl = 'Missing fields: {fields}'
const obj = {
  // node and browser native international list-formatting
  fields: new Intl.ListFormat('en', {
    style: 'short',
    type: 'disjunction'
  }).format(['username', 'password'])
}
const msg = Object.keys(obj)
  .reduce((prev, key) => prev.replace(`{${k}}`, obj[k]), tpl)
// 'Missing fields: username and password'
```
</details>

<details>
  <summary>minimal koa and express 'accept-language' headers</summary>

```javascript
// https://www.w3.org/International/questions/qa-accept-lang-locales
//
// an accept-langauge header might look like this and could be parsed many ways,
//  'en-GB,en-US;q=0.9,fr-CA;q=0.7,en;q=0.8'
const acceptLangStr = ctx.get('accept-language')
// https://www.npmjs.com/package/accept-language-parser
const parsed = acceptLanguageParser.parse(acceptLangStr)
const parsedISOSpec = parsed.find(p = p.code && p.region)

const lang = parsedISOSpec &&
  [parsedISOSpec.code, parsedISOSpec.region].join('-')
// 'en-US'
```

</details>


To anyone who may possibly use this package, feel free to open issues and support requests.
