'use strict'
// **Github:** https://github.com/toajs/toa-token
//
// **License:** MIT

const jsonwebtoken = require('jsonwebtoken')
const JWT_OPTIONS = ['algorithm', 'expiresIn', 'notBefore', 'audience', 'issuer',
  'jwtid', 'subject', 'noTimestamp', 'header']

module.exports = toaToken
toaToken.jwt = jsonwebtoken
toaToken.JWT = JWT

function toaToken (app, secretOrPrivateKeys, options) {
  options = options || {}

  const jwt = new JWT(secretOrPrivateKeys)
  const useProperty = options.useProperty || 'token'
  const authScheme = options.authScheme || 'Bearer'
  const getToken = typeof options.getToken === 'function' ? options.getToken : null
  const authReg = new RegExp('^' + authScheme.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))

  if (options.expiresInMinutes && !options.expiresIn) {
    options.expiresIn = options.expiresInMinutes * 60
  }
  const jwtOptions = {}
  JWT_OPTIONS.forEach(function (key) {
    if (options[key] != null) jwtOptions[key] = options[key]
  })

  app.verifyToken = app.context.verifyToken = function (payload, opts) {
    return jwt.verifyToken(payload, opts || jwtOptions)
  }

  app.signToken = app.context.signToken = function (payload, opts) {
    return jwt.signToken(payload, opts || jwtOptions)
  }

  app.decodeToken = app.context.decodeToken = function (token, opts) {
    return jwt.decodeToken(token, opts || jwtOptions)
  }

  app.context._toaJsonWebToken = undefined
  Object.defineProperty(app.context, useProperty, {
    enumerable: true,
    configurable: false,
    get: function () {
      if (this._toaJsonWebToken) return this._toaJsonWebToken

      let token
      const authorization = this.get('authorization')

      if (getToken) token = getToken.call(this)
      if (!token && authorization) {
        if (authReg.test(authorization)) token = authorization.replace(authReg, '').trim()
        if (!token) this.throw(401, 'Invalid authorization')
      }
      if (!token) this.throw(401, 'No authorization token was found')

      try {
        this._toaJsonWebToken = jwt.verifyToken(token, jwtOptions)
      } catch (err) {
        this.throw(401, String(err))
      }

      return this._toaJsonWebToken
    }
  })
}

function JWT (secretOrPrivateKeys) {
  if (!secretOrPrivateKeys || !secretOrPrivateKeys.length) throw new Error('secretOrPrivateKey should be set')
  if (!Array.isArray(secretOrPrivateKeys)) secretOrPrivateKeys = [secretOrPrivateKeys]
  this.secretOrPrivateKeys = secretOrPrivateKeys
}

JWT.prototype.signToken = function (payload, options) {
  return jsonwebtoken.sign(payload, this.secretOrPrivateKeys[0], options)
}

JWT.prototype.decodeToken = function (token, options) {
  return jsonwebtoken.decode(token, options)
}

JWT.prototype.verifyToken = function (token, options) {
  let error = null
  const secretOrPrivateKeys = this.secretOrPrivateKeys

  for (let i = 0, len = secretOrPrivateKeys.length - 1; i <= len; i++) {
    try {
      return jsonwebtoken.verify(token, secretOrPrivateKeys[i], options)
    } catch (err) {
      error = err
    }
  }
  throw error
}
