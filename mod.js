import {parseJevkoWithHeredocs} from "https://cdn.jsdelivr.net/gh/jevko/parsejevko.js@v0.1.7/mod.js"

export const fromString = (str) => convert(parseJevkoWithHeredocs(str))

export const convert = (jevko) => nodes(prep(jevko))

const prep = jevko => {
  const {subjevkos, suffix} = jevko

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
  return {subjevkos: subs, suffix}
}

const string = (jevko) => {
  const {subjevkos, suffix} = jevko
  if (subjevkos.length === 0) return suffix
  throw Error('Text node or attribute value cannot have children.')
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
      currentSectionKey = string(jevko)
      if (currentSectionKey in topMap === false) {
        topMap[currentSectionKey] = Object.create(null)
      }
      currentSection = topMap[currentSectionKey]
    } else {
      // note: allows overwriting
      currentSection[prefix] = inner(jevko)
    }
  }


  return topMap
}

const inner = (jevko) => {
  const {subjevkos, suffix} = jevko

  if (subjevkos.length === 0) {
    if (suffix.startsWith("'")) return suffix.slice(1)

    const trimmed = suffix.trim()

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