'use strict'
module.exports = async function hardwareRoutes(fastify, options) {
    async function listHardware(request, reply) {
        //name of stored procedure to be called
        const statement = "CALL list_hardware_inventory_items"
        //establish connection to database
        const connection = await fastify.mysql.getConnection()
        //query stored procedure to get all hardware items
        const [rows] = await connection.query(statement)
        const data = rows[0]
        //release connection from database
        connection.release()

        const length = data.length

        return {length, data}
    }

    fastify.route({
        method: 'GET',
        url: '/',
        // schema: {
        //     querystring: fastify.getSchema('schema:hardware:list:query'),
        //     response: {
        //         200: fastify.getSchema('schema:hardware:item:response')
        //     }
        // },
        preValidation: fastify.authenticate,
        handler: listHardware
    })

    fastify.route({
        method: 'POST',
        url: '/',
        handler: async function createHardware(request, reply) {
            return { id: '123' }
        }
    })

    fastify.route({
        method: 'GET',
        url: '/:id',
        handler: async function readHardware(request, reply) {
            return {}
        }
    })

    fastify.route({
        method: 'PUT',
        url: '/:id',
        handler: async function updateHardware(request, reply) {
            reply.code(204)
        }
    })

    fastify.route({
        method: 'DELETE',
        url: '/:id',
        handler: async function deleteHardware(request, reply) {
            reply.code(204)
        }
    })
}