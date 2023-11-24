'use strict'
module.exports = async function hardwareRoutes(fastify, options) {
    async function listHardware(request, reply) {
        //name of stored procedure to be called
        const statement = "CALL list_all_hardware_items"
        //establish connection to database
        const connection = await fastify.mysql.getConnection()
        //query stored procedure to get all hardware items
        const [rows] = await connection.query(statement)
        const data = rows[0]
        //release connection from database
        connection.release()

        // const {skip, limit, name} = request.query
        // const filter = name ? { name: new RegExp(name, 'i') } : {}
        // const hardware = await rows[0].find(filter, { limit, skip}).toArray()
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