const clakparserowtop = csv => csv
  .split('\n', 1)[0].slice(1, -1).split('","')

const clakKeyRe = /^[Kk]ey$/
const clackrmfirstcolre = /^([^,]*,)/gmi

// * return an error if any keys are mis-matched not found
// * store a mapping of keys to row positions
const rowget = (keyfirstcsv, key, i = -1) => (
  i = keyfirstcsv.indexOf(`"${key}"`, i),
  i === -1 ? null : (
    keyfirstcsv[i - 1] === '\n'
      ? keyfirstcsv.slice(i).split('\n')[0]
      : rowget(keyfirstcsv, key, i + 1)))

const clakparserow = (csv, key, def) => {
  const rowtop = clakparserowtop(csv)
  const keycol = rowtop.reduce((p, v, i) => clakKeyRe.test(v) ? i : p, 0)
  const enUScol = rowtop.indexOf('en-US')
  const row = rowget(
    keycol === 1 ? csv.replace(clackrmfirstcolre, '') : csv, key)

  // '"forbidden","you are forbidden","あなたが駄目です"'
  // -> ['forbidden','you are forbidden','あなたが駄目です']
  const colsfinal = row.slice(1, -1).split('","')

  // add default 'en-US' value, if not defined
  if (!colsfinal[enUScol - keycol])
    colsfinal[enUScol - keycol] = def

  return colsfinal
}

const clakparselangs = (csv, keys) => {
  const rowtop = clakparserowtop(csv)
  const keycol = rowtop.reduce((p, v, i) => clakKeyRe.test(v) ? i : p, 0)

  if (rowtop.indexOf('en-US') === -1)
    throw new Error(`required default en-US column not found"`)

  // { priority: ['en-US'], en-US: 1, ja-JP: 2 }
  return keys.reduce((prev, key) => {
    prev[key] = rowtop.indexOf(key) - keycol
    if (prev[key] === -1)
      throw new Error(`key not found: ${key}`)

    return prev
  }, { priority: keys })
}

const clakvaluefindfirstlang = (tuple, langs, langspref) => {
  if (langspref.length === 0)
    return tuple[1] // the 'default'

  return tuple[langs[langspref[0]]]
    || clakvaluefindfirstlang(tuple, langs, langspref.slice(1))
}

const clakProbe = (tuple, langs, langprefs) => {
  // until there is a value keep searching
  langprefs = [...new Set(langprefs.slice().concat(langs.priority))]

  return clakvaluefindfirstlang(tuple, langs, langprefs)
}

const clakSetup = csv => (key, def) => {
  // langs store ex,
  // ```
  // c(['en-US', 'ja-JP'])
  // => { priority: [ 'en-US', 'ja-JP' ], 'en-US': 2, 'ja-JP': 3 }
  // ```
  if (Array.isArray(key) && typeof def === 'undefined')
    return clakparselangs(csv, key)

  // messages tuple,
  // ```
  // c('acces_denied', 'no access')
  // => [ 'access_denied', 'access denied', 'あなたが入れない駄目です' ]
  // ```
  if (typeof key === 'string')
    return clakparserow(csv, key, def)

  return null
}

export default (...args) => typeof args[0] === 'string'
  ? clakSetup(args[0])
  : clakProbe(...args)
