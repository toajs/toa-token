toa-token
====
Json web token (JWT) module for toa.

It sign and verify token through a rotating credential system, in which new server keys can be added and old ones removed regularly, without invalidating client credentials.

[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]

## [toa](https://github.com/toajs/toa)

## [JSON Web Tokens](http://self-issued.info/docs/draft-ietf-oauth-json-web-token.html)

This module lets you authenticate HTTP requests using JWT tokens in toa
 applications.  JWTs are typically used protect API endpoints, and are
often issued using OpenID Connect.

## Demo

```js
var Toa = require('toa')
var toaToken = require('toa-token')
var Router = require('toa-router')
var toaBody = require('toa-body')

var router = new Router()

router
  .get('/auth', function * () {
    var user = yield this.parseBody()
    // verify with user.name and user.passwd, get user._id
    var token = this.signToken({
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

var app = Toa(function * () {
  yield router.route(this)
})

toaBody(app)
toaToken(app, 'secretKeyxxx', {
  expiresInMinutes: 60
})

app.listen(3000)
```

## Installation

```bash
npm install toa-token
```

## API

```js
var toaToken = require('toa-token')
```
### toaToken(app, secretOrPrivateKeys, [options]))

- `secretOrPrivateKeys`: `secretOrPrivateKeys` is a array of string or buffer containing either the secret for HMAC algorithms, or the PEM encoded private key for RSA and ECDSA.

- `options.authScheme`: `String`, Authorization scheme name, default to `Bearer`. In HTTP header fields: `Authorization: Bearer QWxhZGRpbjpvcGVuIHNld2FtZQ==`.
- `options.useProperty`: `String`, token name add to `context`, default to `token`.
- `options.getToken`: `Function`, A custom function for extracting the token, This is useful if you need to pass the token through a query parameter or a cookie.
- `options.algorithm`
- `options.expiresInMinutes`
- `options.audience`
- `options.subject`
- `options.issuer`
- `options.noTimestamp`

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

## Licences
(The MIT License)

[npm-url]: https://npmjs.org/package/toa-token
[npm-image]: http://img.shields.io/npm/v/toa-token.svg

[travis-url]: https://travis-ci.org/toajs/toa-token
[travis-image]: http://img.shields.io/travis/toajs/toa-token.svg
