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

  fastify.post('/', async function (request, reply) {
    const session = await mysqlx.getSession(process.env.MYSQLX_HARDWARE_DATABASE_URL);
    await session.sql('SET @name = ?;')
                    .bind(request.body.name)
                    .execute();
    await session.sql('SET @tag = ?;')
                    .bind(request.body.tag)
                    .execute();
    await session.sql('SET @category = ?;')
                    .bind(request.body.category)
                    .execute();
    const statement = "CALL create_hardware_item(@name, @tag, @category)";
    const result = await session.sql(statement).execute();
    const hardware = await result.fetchOne();
    console.log(hardware);

    await session.close();

    return hardware;
  });

  fastify.patch('/:id', async function (request, reply) {
    const session = await mysqlx.getSession(process.env.MYSQLX_HARDWARE_DATABASE_URL);
    await session.sql('SET @id = ?;')
                    .bind(request.params.id)
                    .execute();
    await session.sql('SET @name = ?;')
                    .bind(request.body.name ?? null)
                    .execute();
    await session.sql('SET @tag = ?;')
                    .bind(request.body.tag ?? null)
                    .execute();
    await session.sql('SET @category = ?;')
                    .bind(request.body.category ?? null)
                    .execute();
    const statement = "CALL update_hardware_item(@id, @name, @tag, @category)";
    const result = await session.sql(statement).execute();
    const hardware = await result.fetchOne();

    await session.close();

    return hardware;
  });

  fastify.delete('/:id', async function (request, reply) {
    const session = await mysqlx.getSession(process.env.MYSQLX_HARDWARE_DATABASE_URL);
    await session.sql('SET @id = ?;')
                    .bind(request.params.id)
                    .execute();
    const statement = "CALL delete_hardware_item(@id)";
    const result = await session.sql(statement).execute();
    const hardware = await result.fetchOne();
    await session.close();

    return hardware;
  });


}
