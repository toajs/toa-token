# toa-token

Json web token (JWT) module for toa.

It sign and verify token through a rotating credential system, in which new server keys can be added and old ones removed regularly, without invalidating client credentials.

[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Downloads][downloads-image]][downloads-url]

## [toa](https://github.com/toajs/toa)

## [JSON Web Tokens](http://self-issued.info/docs/draft-ietf-oauth-json-web-token.html)

This module lets you authenticate HTTP requests using JWT tokens in toa
 applications.  JWTs are typically used protect API endpoints, and are
often issued using OpenID Connect.

## Demo

```js
const Toa = require('toa')
const toaToken = require('toa-token')
const Router = require('toa-router')
const toaBody = require('toa-body')

const router = new Router()

router
  .get('/auth', function * () {
    let user = yield this.parseBody()
    // verify with user.name and user.passwd, get user._id
    let token = this.signToken({
      name: user.name,
      _id: user._id
    })
    this.body = token
  })
  .get('/', function (Thunk) {
    // should have this.token when client request with authorization header.
    // var token = this.token // {_id: 'user id', name: 'user name'}
    // ....
  })

const app = Toa(function * () {
  yield router.route(this)
})

toaBody(app)
toaToken(app, 'secretKeyxxx', {
  expiresIn: 60
})

app.listen(3000)
```

## Installation

```bash
npm install toa-token
```

## API

```js
const toaToken = require('toa-token')
```

### toaToken(app, secretOrPrivateKeys, [options]))

- `secretOrPrivateKeys`: `secretOrPrivateKeys` is a array of string or buffer containing either the secret for HMAC algorithms, or the PEM encoded private key for RSA and ECDSA.

- `options.authScheme`: `String`, Authorization scheme name, default to `Bearer`. In HTTP header fields: `Authorization: Bearer QWxhZGRpbjpvcGVuIHNld2FtZQ==`.
- `options.useProperty`: `String`, token name add to `context`, default to `token`.
- `options.getToken`: `Function`, A custom function for extracting the token, This is useful if you need to pass the token through a query parameter or a cookie.
- `options.algorithm` (default: `HS256`)
- `options.expiresIn`: expressed in seconds or a string describing a time span [rauchg/ms](https://github.com/rauchg/ms.js). Eg: `60`, `"2 days"`, `"10h"`, `"7d"`
- `options.notBefore`: expressed in seconds or a string describing a time span [rauchg/ms](https://github.com/rauchg/ms.js). Eg: `60`, `"2 days"`, `"10h"`, `"7d"`
- `options.audience`
- `options.issuer`
- `options.jwtid`
- `options.subject`
- `options.noTimestamp`
- `options.header`

**More options is same as [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)**

### context.token

This is a getter that auto verify the token. if authorization is invalid, context will throw error. `token` maybe custom by `options.useProperty`.

```js
console.log(this.token)
```

### app.signToken(payload) / context.signToken(payload)

Generate a token string. `payload` could be an literal, buffer or string, If `payload` is not a buffer or a string, it will be coerced into a string
using `JSON.stringify`.

### app.decodeToken(token, options) / context.decodeToken(token, options)

Returns the decoded payload without verifying if the signature is valid.

- `token`: `String`, the JsonWebToken string.
- `options.json`: `Boolean`, force JSON.parse on the payload even if the header doesn't contain `"typ":"JWT"`.

### app.verifyToken(token, options) / context.verifyToken(token, options)

Returns the decoded payload with verifying if the signature is valid.

- `token`: `String`, the JsonWebToken string.

### toaToken.jwt

It is a reference of `jsonwebtoken` module.

### toaToken.JWT(secretOrPrivateKeys)

It is a wrap of `jsonwebtoken` module.

```js
const jwt = new toaToken.JWT(secretOrPrivateKeys)
```

#### jwt.signToken(payload, options)

#### jwt.decodeToken(token, options)

#### jwt.verifyToken(token, options)

## Licences

(The MIT License)

[npm-url]: https://npmjs.org/package/toa-token
[npm-image]: http://img.shields.io/npm/v/toa-token.svg

[travis-url]: https://travis-ci.org/toajs/toa-token
[travis-image]: http://img.shields.io/travis/toajs/toa-token.svg

[downloads-url]: https://npmjs.org/package/toa-token
[downloads-image]: http://img.shields.io/npm/dm/toa-token.svg?style=flat-square
