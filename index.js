'use strict';
// **Github:** https://github.com/toajs/toa-token
//
// **License:** MIT

var jwt = require('jsonwebtoken');

module.exports = function toaToken(app, secretOrPrivateKeys, options) {
  if (!secretOrPrivateKeys || !secretOrPrivateKeys.length) throw new Error('secretOrPrivateKey should be set');
  if (!Array.isArray(secretOrPrivateKeys)) secretOrPrivateKeys = [secretOrPrivateKeys];
  options = options || {};

  var useProperty = options.useProperty || 'token';
  var authScheme = options.authScheme || 'Bearer';
  var getToken = typeof options.getToken === 'function' ? options.getToken : null;
  var authReg = new RegExp('^' + authScheme.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

  app.verifyToken = app.context.verifyToken = verifyToken;

  app.signToken = app.context.signToken = function(payload) {
    return jwt.sign(payload, secretOrPrivateKeys[0], options);
  };

  app.decodeToken = app.context.decodeToken = function(token, options) {
    return jwt.decode(token, options);
  };
  Object.defineProperty(app.context, options.useProperty || 'token', {
    enumerable: true,
    configurable: false,
    get: function () {
      if (this._toaJsonWebToken) return this._toaJsonWebToken;

      var token;
      var authorization = this.get('authorization');

      if (getToken) token = getToken.call(this);
      if (!token && authorization) {
        if (authReg.test(authorization)) token = authorization.replace(authReg, '').trim();
        if (!token) this.throw(401, 'Invalid authorization');
      }
      if (!token) this.throw(401, 'No authorization token was found');

      try {
        this._toaJsonWebToken = verifyToken(token, options);
      } catch (err) {
        this.throw(401, err.toString());
      }

      return this._toaJsonWebToken;
    }
  });

  function verifyToken(token, options) {
    var tokenObj = null, error = null;
    for (var i = 0, len = secretOrPrivateKeys.length - 1; i <= len ; i++) {
      try {
        tokenObj = jwt.verify(token, secretOrPrivateKeys[i], options);
        break;
      } catch (err) {
        error = err;
      }
    }
    if (tokenObj) return tokenObj;
    throw error;
  }
};

module.exports.jwt = jwt;
