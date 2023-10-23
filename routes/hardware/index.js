'use strict'

module.exports = async function (fastify, options) {
  fastify.get('/', async function (request, reply) {
    reply.code(200);

    return { key: 'value' };
  });
}
