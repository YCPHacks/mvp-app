'use strict'
const mysqlx = require('@mysql/xdevapi');

module.exports = async function (fastify, options) {
    fastify.get('/:id', async function (request, reply) {
        const session = await mysqlx.getSession(process.env.MYSQLX_HARDWARE_DATABASE_URL);
        await session.sql('SET @id = ?;')
                        .bind(request.params.id)
                        .execute();
        const statement = "CALL list_rental_history_by_id(@id)";
        const result = await session.sql(statement).execute();
        const columns = await result.getColumns();
        const history = await result.fetchAll();
        const data = history.map(row => {
            return row.reduce((res, value, i) => {
                return Object.assign({}, res, { [columns[i].getColumnLabel()]: value })
            }, {});
        });

        await session.close();
        return data;
    });
}