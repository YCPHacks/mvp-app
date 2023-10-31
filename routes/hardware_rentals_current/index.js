'use strict'
const mysqlx = require('@mysql/xdevapi');

module.exports = async function (fastify, options) {
    fastify.get('/', async function (request, reply) {
        const session = await mysqlx.getSession(process.env.MYSQLX_HARDWARE_DATABASE_URL);
        const statement = "CALL select_hardware_items_and_current_record";
        const result = await session.sql(statement).execute();
        const rent_current = await result.fetchAll();
        const data = rent_current.map((item) => {
            return{
                id: item[0],
                name: item[1],
                tag: item[2],
                category: item[3],
                status: item[4] ?? 'checked-in',
                attendee_name: item[5],
                date: item[6],
            }
        });

        await session.close();

        const scheme = {
            "length": rent_current.length,
            "data": data
        }

        return scheme;
    });
}
