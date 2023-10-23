'use strict'

module.exports = async function (fastify, options) {
  fastify.get('/', async function (request, reply) {
    return { key: 'value' };
  });
}
