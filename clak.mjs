const clakKeyRe = /^[Kk]ey$/
const clackrmfirstcolre = /^([^,]*,)/gmi

const clakparserowtop = csv => csv
  .split('\n', 1)[0].slice(1, -1).split('","')

const getkeycolIndex = rows => rows
  .reduce((p, v, i) => clakKeyRe.test(v) ? i : p, 0)

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
  const keycol = getkeycolIndex(rowtop)
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
  const keycol = getkeycolIndex(rowtop)

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

const clakProbeFind = (tuple, langs, langspref) => langspref.length === 0
  ? tuple[1] // the 'default'
  : tuple[langs[langspref[0]]]
      || clakProbeFind(tuple, langs, langspref.slice(1))

const clakProbe = (tuple, langs, langprefs) => clakProbeFind(
  tuple, langs, [...new Set(langprefs.slice().concat(langs.priority))])

const clakSetup = csv => (key, def) => {
  // ```
  // c(['en-US', 'ja-JP'])
  // => { priority: [ 'en-US', 'ja-JP' ], 'en-US': 2, 'ja-JP': 3 }
  // ```
  if (Array.isArray(key) && typeof def === 'undefined')
    return clakparselangs(csv, key)

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
