'use strict'
const mysqlx = require('@mysql/xdevapi');

module.exports = async function (fastify, options) {
    fastify.get('/', async function (request, reply) {
        const session = await mysqlx.getSession(process.env.MYSQLX_HARDWARE_DATABASE_URL);
        const statement = "CALL list_all_hardware_items_and_current_record";
        const result = await session.sql(statement).execute();

        const columns = await result.getColumns();
        const rent_current = await result.fetchAll();

        const data = rent_current.map(row => {
            return row.reduce((res, value, i) => {
                return Object.assign({}, res, { [columns[i].getColumnLabel()]: value })
            }, {});
        });

        data.forEach((item) => {
            if(item.status === null){
              item.status = 'checked-in';
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
