'use strict'
// **Github:** https://github.com/toajs/toa-token
//
// **License:** MIT
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
  .get('/', function () {
    // should have this.token when client request with authorization header.
    // var token = this.token // {_id: 'user id', name: 'user name'}
    // ....
  })

const app = new Toa()
app.use(router)

toaBody(app)
toaToken(app, 'secretKeyxxx', {
  expiresIn: 60
})

app.listen(3000)
