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
  const keycol = Math.max(rowtop.indexOf('key'), 0)
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
  const keycol = Math.max(rowtop.search(clakKeyRe), 0)
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

  const langpos = langs[langspref[0]]
  if (tuple[langpos]) {
    return tuple[langpos]
  } else {
    return clakvaluefindfirstlang(tuple, langs, langspref.slice(1))
  }
}

const clakvalue = (tuple, langs, langprefs) => {
  console.log(tuple, langs, langprefs)
  // until there is a value keep searching
  langprefs = [...new Set(langprefs.slice().concat(langs.priority))]


  const lang = clakvaluefindfirstlang(tuple, langs, langprefs)
  console.log('LANGA', langs)
  return lang
}

const clak = (csv, key, def) => {
  // clak(csv, [ 'en-US', 'ja-JP' ])
  if (typeof csv === 'string' && Array.isArray(key))
    return clakparselangs(csv, key)
  
  // clak(csv, 'acces_denied', 'no access')
  if (typeof csv === 'string' && typeof key === 'string')
    return clakparserow(csv, key, def)

  // clak(csvtuple, langs, ['en-US', 'ja-JP'])
  if (Array.isArray(csv) && typeof key === 'object')
    return clakvalue(csv, key, def)

  return null
}

export default clak
