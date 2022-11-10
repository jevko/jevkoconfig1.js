NOTE: this is a sketch

# jevkoconfig1.js

Codename Jevko Config 1.

A Jevko format for configuration that decodes this:

```
This is a comment

title [jevkoconfig1 Example]

[owner]
name [tester]
dob `//2020-08-05T20:30:01+09:00[Asia/Tokyo][u-ca=japanese]//

[database]
enabled [true]
quoted ['true]
ports [
  [8000]
  [8001]
  [8002]
]
data [ [[delta] [phi]] [3.14] ]
temp targets [ cpu [79.5] case [72.0] ]

[servers]
alpha [
  ip [10.0.0.1]
  role [frontend]
]
beta [ ip [10.0.0.2] role [backend] ]
```

into this:

```json
{
  "title": "jevkoconfig1 Example",
  "owner": {
    "name": "tester",
    "dob": "2020-08-05T20:30:01+09:00[Asia/Tokyo][u-ca=japanese]"
  },
  "database": {
    "enabled": true,
    "quoted": "true",
    "ports": [
      8000,
      8001,
      8002
    ],
    "data": [
      [
        "delta",
        "phi"
      ],
      3.14
    ],
    "temp targets": {
      "cpu": 79.5,
      "case": 72
    }
  },
  "servers": {
    "alpha": {
      "ip": "10.0.0.1",
      "role": "frontend"
    },
    "beta": {
      "ip": "10.0.0.2",
      "role": "backend"
    }
  }
}
```

The example is based on the one from [TOML homepage](https://toml.io/en/).

Jevko Config 1 is similar to INI or TOML, but simpler and more flexible than both.

It recognizes the following primitive values:

* `true` and `false` (booleans)
* numbers, e.g. `999.99` -- parsed as according to Ecma262 grammar -- `Infinity` and `NaN` are supported
* `null`
* `map` means an empty map `{}`
* `list` means an empty list `[]`
* `'<anything>` means that `<anything>` is meant to be a string, e.g. `'true` is `"true"`
* anything unrecognized is interpreted as a string

# Heredocs

Heredoc strings are supported like this:

```
<key> `/<tag>/............./<tag>/
```

`<tag>` is any user-defined delimiting identifier, can be empty.

Example:

```
dob `//2020-08-05T20:30:01+09:00[Asia/Tokyo][u-ca=japanese]//
```

parses to:

```json
{
  "dob": "2020-08-05T20:30:01+09:00[Asia/Tokyo][u-ca=japanese]"
}
```

All strings may be multiline.

# Comments

```
This is a multiline
comment that precedes
a key [with a value]
```

parses to:

```json
{
  "a key": "with a value"
}
```

Also:

```
array [
  Comment for the
  frist value of an array
  [1]
  Comment for the
  second value
  [2]
]
```

parses to:

```
{
  "array": [1, 2]
}
```

i.e. all lines that do not include brackets are ignored.

Keys cannot be multiline, but may contain embedded spaces.

# Concatenation

Multiple Jevko Config 1 files concatenated together will be shallow-merged: two occurences of section [A] will be treated as one occurence, entries with same keys that come last will overwrite entries that come before.

```
[A]
key [value]
key2 [value2]

[A]
key [value3]
key3 [value4]
```

parses to:

```js
{ 
  A: { 
    key: "value3", 
    key2: "value2", 
    key3: "value4" 
  } 
}
```

However duplicate keys in maps outside of top-level are forbidden.

Note:

```
top [1]

[section]
key [2]
```

concatenated with:

```
top2 [10]

[section2]
key2 [20]
```

produces:

```
top [1]

[section]
key [2]
top2 [10]

[section2]
key2 [20]
```

i.e. `top2` from the second file goes under `[section]`.

This is most likely not desirable, so it's best not to use keys without a section.

TODO: perhaps forbid global keys.