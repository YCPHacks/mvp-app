'use strict'
const mysqlx = require('@mysql/xdevapi');

module.exports = async function (fastify, options) {
  fastify.get('/', async function (request, reply) {
    //reply.code(200);

    //return { key: 'value' };

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


}
