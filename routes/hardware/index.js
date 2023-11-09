'use strict'
const mysqlx = require('@mysql/xdevapi');

module.exports = async function (fastify, options) {
  fastify.get('/', async function (request, reply) {
    const session = await mysqlx.getSession(process.env.MYSQLX_HARDWARE_DATABASE_URL);
    const statement = "CALL list_all_hardware_items()";
    const result = await session.sql(statement).execute();
    const columns = await result.getColumns();
    const hardware = await result.fetchAll();
    const data = hardware.map(row => {
      return row.reduce((res, value, i) => {
        return Object.assign({}, res, { [columns[i].getColumnLabel()]: value })
      }, {});
    });

    await session.close();

    const scheme = {
        "length": hardware.length,
        "data": data
    }

    return scheme;
  });

  fastify.get('/:id', async function (request, reply) {
    const session = await mysqlx.getSession(process.env.MYSQLX_HARDWARE_DATABASE_URL);
    await session.sql('SET @id = ?;')
                    .bind(request.params.id)
                    .execute();
    const statement = "CALL list_single_hardware_item(@id)";
    const result = await session.sql(statement).execute();
    const columns = await result.getColumns();
    const hardware = await result.fetchOne();
    const scheme = hardware.reduce((res, value, i) => {
        return Object.assign({}, res, { [columns[i].getColumnLabel()]: value })
      }, {});

    await session.close();

    return scheme;
  });


}
