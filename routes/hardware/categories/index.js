'use strict'
const mysqlx = require('@mysql/xdevapi');

module.exports = async function (fastify, options) {
    fastify.get('/', async function (request, reply) {
        const session = await mysqlx.getSession(process.env.MYSQLX_HARDWARE_DATABASE_URL);
        const statement = "CALL list_all_categories";
        const result = await session.sql(statement).execute();
        const columns = await result.getColumns();
        const categories = await result.fetchAll();
        const data = categories.map(row => {
            return row.reduce((res, value, i) => {
                return Object.assign({}, res, { [columns[i].getColumnLabel()]: value })
            }, {});
        });

        await session.close();

        return data;
    });
}