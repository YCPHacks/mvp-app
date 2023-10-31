'use strict'
const mysqlx = require('@mysql/xdevapi');

module.exports = async function (fastify, options) {
    fastify.post('/', async function (request, reply) {
        const hardware_id = request.body.hardware_id;
        const attendee_name = request.body.attendee_name;
        const status = request.body.status;
    });
}