'use strict'
const mysqlx = require('@mysql/xdevapi');

module.exports = async function (fastify, options) {
  fastify.get('/', async function (request, reply) {
    const session = await mysqlx.getSession(process.env.MYSQLX_HARDWARE_DATABASE_URL);
    const statement = "CALL Select_Hardware_Items()";
    const result = await session.sql(statement).execute();
    const hardware = await result.fetchAll();
    const data = hardware.map((item) => {
        return{
          id: item[0],
          name: item[1],
          tag: item[2],
          category: item[3],
          status:  item[4],
          time:  item[5],
          renter_id:  item[6]
        }
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
    const statement = "CALL Select_Single_Hardware_Items(@id)";
    const result = await session.sql(statement).execute();
    const hardware = await result.fetchOne();
    const scheme = {
      id: hardware[0],
      name: hardware[1],
      tag: hardware[2],
      category: hardware[3],
      status:  hardware[4],
      time:  hardware[5],
      renter_id:  hardware[6]
    }

    await session.close();

    return scheme;
  });


}
