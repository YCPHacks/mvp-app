const fp = require('fastify-plugin')
const mysql = require('@fastify/mysql')
module.exports = fp(async function (fastify, opts) {
  fastify.register(mysql, {
    promise: true,
    connectionString: fastify.secrets.MYSQL_HARDWARE_DATABASE_URL
  })
}, {
  dependencies: ['application-config']
})