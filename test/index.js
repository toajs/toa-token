'use strict'
// **Github:** https://github.com/toajs/toa-session
//
// **License:** MIT

const tman = require('tman')
const assert = require('assert')
const request = require('supertest')
const Toa = require('toa')
const toaToken = require('../')

function assertContains (src, dst) {
  const keys = Object.keys(dst)
  for (let i = 0; i < keys.length; i++) {
    assert.strictEqual(src[keys[i]], dst[keys[i]])
  }
}

tman.suite('toa-token', function () {
  tman.it('should verify token success', function () {
    const user = {_id: 123, name: 'toa'}

    const app = new Toa()
    app.use(function () {
      assertContains(this.token, user)
      this.body = token
    })
    toaToken(app, 'secretKeyxxx')
    const token = app.signToken(user)

    assertContains(app.decodeToken(token), user)

    return request(app.listen())
      .get('/')
      .set('Authorization', 'Bearer ' + token)
      .expect(token)
  })

  tman.it('should verify token success with options', function () {
    const user = {_id: 123, name: 'toa'}

    const app = new Toa()
    app.use(function () {
      assertContains(this.token, user)
      this.body = token
    })

    toaToken(app, 'secretKeyxxx', {
      expiresInMinutes: 60,
      subject: 'subject',
      audience: 'abc',
      issuer: 'efg'
    })

    const token = app.signToken(user)

    return request(app.listen())
      .get('/')
      .set('Authorization', 'Bearer ' + token)
      .expect(token)
  })

  tman.it('should verify token success with options.useProperty', function () {
    const user = {_id: 123, name: 'toa'}

    const app = new Toa()
    app.use(function () {
      assertContains(this.user, user)
      this.body = this.user
    })
    toaToken(app, 'secretKeyxxx', {
      useProperty: 'user'
    })
    const token = app.signToken(user)

    return request(app.listen())
      .get('/')
      .set('Authorization', 'Bearer ' + token)
      .expect(200)
  })

  tman.it('should verify token success with options.getToken', function () {
    const user = {_id: 123, name: 'toa'}

    const app = new Toa()
    app.use(function () {
      this._token = token
      assertContains(this.token, user)
      this.body = this.token
    })
    toaToken(app, 'secretKeyxxx', {
      getToken: function () {
        assert(this._token === token)
        return this._token
      }
    })
    const token = app.signToken(user)

    return request(app.listen())
      .get('/')
      .set('Authorization', 'Bearer ' + token)
      .expect(200)
  })

  tman.it('should verify token success with options.authScheme', function () {
    const user = {_id: 123, name: 'toa'}

    const app = new Toa()
    app.use(function () {
      assertContains(this.token, user)
      this.body = this.token
    })

    toaToken(app, 'secretKeyxxx', {
      authScheme: 'Basic'
    })
    const token = app.signToken(user)

    return request(app.listen())
      .get('/')
      .set('Authorization', 'Basic ' + token)
      .expect(200)
  })

  tman.it('should verify token success through a rotating credential system', function () {
    const user = {_id: 123, name: 'toa'}

    const app = new Toa()
    app.use(function () {
      assertContains(this.token, user)
      this.body = this.token
    })

    toaToken(app, ['secretKeyA', 'secretKeyB', 'secretKeyC'])
    const token = app.signToken(user)

    return request(app.listen())
      .get('/')
      .set('Authorization', 'Bearer ' + token)
      .expect(200)
  })

  tman.it('should verify old token success through a rotating credential system', function () {
    const user = {_id: 123, name: 'toa'}

    const app = new Toa()
    app.use(function () {
      assertContains(this.token, user)
      this.body = this.token
    })

    toaToken(app, ['secretKeyA', 'secretKeyB', 'secretKeyC'])
    const token = toaToken.jwt.sign(user, 'secretKeyC')

    return request(app.listen())
      .get('/')
      .set('Authorization', 'Bearer ' + token)
      .expect(200)
  })

  tman.it('should verify invalid token fail through a rotating credential system', function () {
    const user = {_id: 123, name: 'toa'}

    const app = new Toa()
    app.use(function () {
      this.body = this.token
    })

    toaToken(app, ['secretKeyA', 'secretKeyB', 'secretKeyC'])
    const token = toaToken.jwt.sign(user, 'secretKeyD')

    return request(app.listen())
      .get('/')
      .set('Authorization', 'Bearer ' + token)
      .expect(401)
  })

  tman.it('should throw error with 401', function () {
    const app = new Toa()
    app.use(function () {
      this.body = this.token
    })

    toaToken(app, 'secretKeyxxx')

    return request(app.listen())
      .get('/')
      .expect(401)
  })

  tman.it('should throw error with 403', function () {
    const user = {_id: 123, name: 'toa'}

    const app = new Toa()
    app.use(function () {
      assertContains(this.token, user)
      this.body = token
    })

    toaToken(app, 'secretKeyxxx')

    const token = app.signToken(user)

    return request(app.listen())
      .get('/')
      .set('Authorization', 'Bearer ' + token + 1)
      .expect(401)
  })
})
