`clak` parses csv values to return internationalized messages in a "lazy" manner, mostly for server applications sending language-specific responses,
 * operates on csv values,
 * enforces in-code default language values à la [nanostores/i18n,][3]
 * anticipates predictable, [unity-style csv file format,][1]
 * provides a flat key-value interface using no namespaces,
 * less than 100 lines of code and no dependencies,
 * returns lazy values easily used with 'accept-language' request headers


[1]: https://docs.unity3d.com/Packages/com.unity.localization@1.2/manual/CSV.html
[2]: https://github.com/nanostores/nanostores
[3]: https://github.com/nanostores/i18n


To start, use a csv value to create a language object and message tuples. Next, return final language values from each tuple, specifying a list of preferred-language values from which the return value should correspond.
```javascript
const csv = `
"id","key","en-US","ja-JP"
1,"forbidden","you are forbidden","あなたが駄目です"
2,"upstream_error","upstream error","それが駄目です"
3,"access_denied","access denied","あなたが入れない駄目です"
`.slice(1, -1)

// memoize csv to a function returning lang store and tuples
const c = clak(csv)

// lang store defines lang priority and col position each lang
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


To anyone who may possibly use this package, feel free to open issues and support requests.
