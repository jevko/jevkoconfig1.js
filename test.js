import {fromString} from './mod.js'

const ret = fromString(`
This is a comment

title [jevkoconfig1 Example]

[owner]
name [tester]
dob \`//2020-08-05T20:30:01+09:00[Asia/Tokyo][u-ca=japanese]//

[database]
enabled [true]
quoted ['true]
test [Infinity]
ports [[8000][8001][8002]]
data [ [[delta] [phi]] [3.14] ]
temp targets [ cpu [79.5] case [72.0] ]

[servers]
alpha [
  ip [10.0.0.1]
  role [frontend]
]
beta [
  ip [10.0.0.2]
  role [backend]
]
`)

console.log(JSON.stringify(ret, null, 2))
console.log(ret.database.test)

console.log(fromString(`array [
  Comment for the
  frist value of an array
  [1]
  Comment for the
  second value
  [2]
]`))