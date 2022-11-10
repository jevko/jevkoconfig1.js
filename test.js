import {parseJevkoWithHeredocs} from "https://cdn.jsdelivr.net/gh/jevko/parsejevko.js@v0.1.7/mod.js"

import {convert} from './mod.js'

const ret = convert(parseJevkoWithHeredocs(`
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
temp_targets [ cpu [79.5] case [72.0] ]

[servers]
alpha [
  ip [10.0.0.1]
  role [frontend]
]
beta [
  ip [10.0.0.2]
  role [backend]
]
`))

console.log(JSON.stringify(ret, null, 2))
console.log(ret.database.test)