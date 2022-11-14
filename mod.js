import {parseJevkoWithHeredocs} from "https://cdn.jsdelivr.net/gh/jevko/parsejevko.js@v0.1.8/mod.js"

export const fromString = (str) => convert(parseJevkoWithHeredocs(str))

export const convert = (jevko) => nodes(prep(jevko))

const prep = jevko => {
  const {subjevkos, ...rest} = jevko

  const subs = []
  for (const {prefix, jevko} of subjevkos) {
    // todo: configurable linebreak
    const lines = prefix.split('\n')

    // discard all lines but last:
    const trimmed = lines.at(-1).trim()
    // discard all pairs that have name starting with -
    if (trimmed.startsWith('-')) continue
    subs.push({prefix: trimmed, jevko: prep(jevko)})
  }
  return {subjevkos: subs, ...rest}
}

const toKey = (jevko) => {
  const {subjevkos, suffix} = jevko
  if (subjevkos.length === 0) {
    const trimmed = suffix.trim()
    if (trimmed === '') throw Error('empty key not allowed')
    return trimmed
  }
  console.error(jevko)
  throw Error('not a valid key')
}

// todo: rename
const nodes = (jevko) => {
  const topMap = Object.create(null)
  // or initial section is topMap
  let currentSection = topMap
  let currentSectionKey = ''
  // topMap[currentSectionKey] = currentSection
  
  // new Map([
  //   [currentSectionKey, currentSection],
  // ])
  const {subjevkos, suffix} = jevko

  if (suffix.trim() !== '') throw Error('1')

  for (const {prefix, jevko} of subjevkos) {
    if (prefix === '') {
      const {path, isRelative} = toPath(jevko)

      if (isRelative === false) currentSection = topMap
      for (const p of path) {
        currentSectionKey = p
        if (currentSectionKey in currentSection === false) {
          currentSection[currentSectionKey] = Object.create(null)
        }
        currentSection = currentSection[currentSectionKey]
      }
    } else {
      // note: allows overwriting
      currentSection[prefix] = inner(jevko)
    }
  }


  return topMap
}

const toPath = jevko => {
  const {subjevkos, suffix} = jevko
  if (subjevkos.length === 0) return {path: [toKey(jevko)], isRelative: false}
  if (suffix.trim() !== '') throw Error('oops')

  const {prefix, jevko: jevko0} = subjevkos[0]
  const ret = []

  let isRelative = false
  if (prefix === './') {
    isRelative = true
  } else if (prefix !== '') throw Error('oops')
  
  ret.push(toKey(jevko0))

  for (const {prefix, jevko} of subjevkos.slice(1)) {
    if (prefix !== '') throw Error('oops')
    ret.push(toKey(jevko))
  }
  return {path: ret, isRelative}
}

const inner = (jevko) => {
  const {subjevkos, suffix} = jevko

  if (subjevkos.length === 0) {
    const {tag} = jevko

    if (tag === 'json') return JSON.parse(suffix)

    const trimmed = suffix.trim()

    if (trimmed.startsWith("'")) {
      // note: allow unclosed string literals
      if (trimmed.at(-1) === "'") return trimmed.slice(1, -1)
      return trimmed.slice(1)
    }

    if (trimmed === 'true') return true
    if (trimmed === 'false') return false
    if (trimmed === 'null') return null
    if (trimmed === 'map') return Object.create(null)
    if (trimmed === 'list') return []
  
    if (trimmed === 'NaN') return NaN
  
    const num = Number(trimmed)
  
    if (Number.isNaN(num) === false) return num

    // todo: recognize different primitive types:
    // numbers, 'strings, bools, null, regular strings, =list, =map
    return suffix
  }
  if (suffix.trim() !== '') throw Error('oops')

  const sub0 = subjevkos[0]

  if (sub0.prefix === '') return list(subjevkos)
  return map(subjevkos)
}

const list = subjevkos => {
  const ret = []
  for (const {prefix, jevko} of subjevkos) {
    if (prefix !== '') throw Error('oops')
    ret.push(inner(jevko))
  }
  return ret
}

const map = subjevkos => {
  const ret = Object.create(null)
  for (const {prefix, jevko} of subjevkos) {
    if (prefix === '') throw Error('oops')
    if (prefix in ret) throw Error('dupe')
    ret[prefix] = inner(jevko)
  }
  return ret
}