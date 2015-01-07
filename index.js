'use strict';
// **Github:** https://github.com/toajs/toa-token
//
// **License:** MIT

var jwt = require('jsonwebtoken');

module.exports = function toaToken(app, secretKey, options) {
  if (!secretKey) throw new Error('secretKey should be set');
  options = options || {};

  var useProperty = options.useProperty || 'token';
  var getToken = typeof options.getToken === 'function' ? options.getToken : null;

  app.signToken = app.context.signToken = function(payload) {
    return jwt.sign(payload, secretKey, options);
  };

  Object.defineProperty(app.context, options.useProperty || 'token', {
    enumerable: true,
    configurable: false,
    get: function () {
      if (this._toaJsonWebToken) return this._toaJsonWebToken;

      var token;
      var authorization = this.get('authorization');

      if (getToken) token = getToken.call(this);
      else if (authorization) {
        var parts = authorization.split(' ');
        if (parts.length === 2 && /^Bearer$/i.test(parts[0])) token = parts[1];
        else this.throw(403, 'Invalid authorization, format is "Authorization: Bearer [token]"');
      }

      if (!token) this.throw(401, 'No authorization token was found');
      try {
        this._toaJsonWebToken = jwt.verify(token, secretKey, options);
      } catch (err) {
        this.throw(403, err.toString());
      }
      return this._toaJsonWebToken;
    }
  });
};

module.exports.jwt = jwt;
