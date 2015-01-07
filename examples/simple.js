'use strict';
// **Github:** https://github.com/toajs/toa-token
//
// **License:** MIT
var Toa = require('toa');
var toaToken = require('toa-token');
var Router = require('toa-router');
var bodyParser = require('toa-body')();

var router = new Router();

router
  .get('/auth', function*(Thunk) {
    var user = yield bodyParser(this.request, Thunk);
    // verify with user.name and user.passwd, get user._id
    var token = this.signToken({
      name: user.name,
      _id: user._id
    });
    this.body = token;
  })
  .get('/', function(Thunk) {
    // should have this.token when client request with authorization header.
    var token = this.token; // {_id: 'user id', name: 'user name'}
    // ....
  });

var app = Toa(function(Thunk) {
  return router.route(this, Thunk);
});

toaToken(app, 'secretKeyxxx', {
  expiresInMinutes: 60
});

app.listen(3000);
