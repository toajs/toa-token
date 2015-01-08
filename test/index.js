'use strict';
// **Github:** https://github.com/toajs/toa-session
//
// **License:** MIT

/*global describe, it, before, after, beforeEach, afterEach*/

var assert = require('assert');
var request = require('supertest');
var Toa = require('toa');
var toaToken = require('../');

describe('toa-token', function() {
  it('should verify token success', function(done) {
    var user = {_id: 123, name: 'toa'};

    var app = Toa(function(Thunk) {
      assert.deepEqual(this.token, user);
      this.body = token;
    });
    toaToken(app, 'secretKeyxxx');
    var token = app.signToken(user);

    assert.deepEqual(app.decodeToken(token), user);

    request(app.listen())
      .get('/')
      .set('Authorization', 'Bearer ' + token)
      .expect(token)
      .end(done);
  });

  it('should verify token success with options', function(done) {
    var user = {_id: 123, name: 'toa'};

    var app = Toa(function(Thunk) {
      assert.deepEqual(this.token, user);
      this.body = token;
    });

    toaToken(app, 'secretKeyxxx', {
      expiresInMinutes: 60,
      subject: 'subject',
      audience: 'abc',
      issuer: 'efg'
    });

    var token = app.signToken(user);

    request(app.listen())
      .get('/')
      .set('Authorization', 'Bearer ' + token)
      .expect(token)
      .end(done);
  });

  it('should verify token success with options.useProperty', function(done) {
    var user = {_id: 123, name: 'toa'};

    var app = Toa(function(Thunk) {
      assert.deepEqual(this.user, user);
      this.body = this.user;
    });
    toaToken(app, 'secretKeyxxx', {
      useProperty: 'user'
    });
    var token = app.signToken(user);

    request(app.listen())
      .get('/')
      .set('Authorization', 'Bearer ' + token)
      .expect(200)
      .end(done);
  });

  it('should verify token success with options.getToken', function(done) {
    var user = {_id: 123, name: 'toa'};

    var app = Toa(function(Thunk) {
      this._token = token;
      assert.deepEqual(this.token, user);
      this.body = this.token;
    });
    toaToken(app, 'secretKeyxxx', {
      getToken: function() {
        assert(this._token === token);
        return this._token;
      }
    });
    var token = app.signToken(user);

    request(app.listen())
      .get('/')
      .set('Authorization', 'Bearer ' + token)
      .expect(200)
      .end(done);
  });

  it('should throw error with 401', function(done) {
    var user = {_id: 123, name: 'toa'};

    var app = Toa(function(Thunk) {
      this.body = this.token;
    });

    toaToken(app, 'secretKeyxxx');

    var token = app.signToken(user);

    request(app.listen())
      .get('/')
      .expect(401)
      .end(done);
  });

  it('should throw error with 403', function(done) {
    var user = {_id: 123, name: 'toa'};

    var app = Toa(function(Thunk) {
      assert.deepEqual(this.token, user);
      this.body = token;
    });

    toaToken(app, 'secretKeyxxx');

    var token = app.signToken(user);

    request(app.listen())
      .get('/')
      .set('Authorization', 'Bearer ' + token + 1)
      .expect(403)
      .end(done);
  });
});
