import {convert} from './mod.js'

export const jevkocfg = jevko => {
  return JSON.stringify(convert(jevko))
}