'use strict'
const fp = require('fastify-plugin')

module.exports = fp(async function (fastify, opts) {
  fastify.register(require('fastify-auth0-verify'), {
    domain: fastify.secrets.AUTH0_DOMAIN,
    //audience: fastify.secrets.AUTH0_AUDIENCE,
    secret: fastify.secrets.AUTH0_CLIENT_SECRET
  })
}, {
  dependencies: ['application-config']
})