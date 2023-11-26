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
        preValidation: fastify.authenticate,
        handler: listHardware
    })

    async function createHardware(request, reply){
        //get the label for the body of the HTTP request
        const label = request.body.label;
        //name of stored procedure to be called
        const statement = 'CALL create_hardware_inventory_item(?);';
        //establish connection to database
        const connection = await fastify.mysql.getConnection()
        //execute prepared statement using label requested from HTTP request body
        connection.execute(statement, [label]);
        //release connection from database
        connection.release()

        reply.code(201)
    }

    fastify.route({
        method: 'POST',
        url: '/',
        handler: createHardware
    })

    async function readHardware(request, reply) {
        //get the id for the HTTP request
        const id = request.params.id
        //name of stored procedure to be called
        const statement = 'CALL read_hardware_inventory_item(?);'
        //establish connection to database
        const connection = await fastify.mysql.getConnection()
        //execute prepared statement using id requested from HTTP request
        const [rows] = await connection.execute(statement, [id])
        const data = rows[0]
        //release connection from database
        connection.release()

        return {data}
    }

    fastify.route({
        method: 'GET',
        url: '/:id',
        handler: readHardware
    })

    fastify.route({
        method: 'PUT',
        url: '/:id',
        handler: async function updateHardware(request, reply) {
            reply.code(204)
        }
    })

    async function deleteHardware(request, reply) {
        //get the id for the HTTP request
        const id = request.params.id
        const time_of_deletion = new Date()
        //name of stored procedure to be called
        const statement = 'CALL delete_hardware_inventory_item(?, ?);'
        //establish connection to database
        const connection = await fastify.mysql.getConnection()
        //execute prepared statement using id requested from HTTP request
        connection.execute(statement, [id, time_of_deletion])
        //release connection from database
        connection.release()

        reply.code(204)
    }

    fastify.route({
        method: 'DELETE',
        url: '/:id',
        handler: async function deleteHardware(request, reply) {
            reply.code(204)
        }
    })
}