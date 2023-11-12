'use strict'
const mysqlx = require('@mysql/xdevapi');

module.exports = async function (fastify, options) {
    fastify.get('/', async function (request, reply) {
        const session = await mysqlx.getSession(process.env.MYSQLX_HARDWARE_DATABASE_URL);
        const search = request.query.search ?? '';
        //console.log(search);
        const categories = request.query.categories ?? '[]';
        //console.log(categories);
        const pageSize = request.query.pageSize ?? 20;
        //console.log(pageSize);
        const pageNumber = request.query.pageNumber ?? 1;
        //console.log(pageNumber);
        await session.sql('SET @search = ?;')
                        .bind(search)
                        .execute();
        await session.sql('SET @categories = ?;')
                        .bind(categories)
                        .execute();
        await session.sql('SET @pageSize = ?;')
                        .bind(pageSize)
                        .execute();
        await session.sql('SET @pageNumber = ?;')
                        .bind(pageNumber)
                        .execute();
        const statement = "CALL list_all_hardware_items_and_current_record(@search, @categories, @pageSize, @pageNumber)";
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

    fastify.get('/:id', async function (request, reply) {
        const session = await mysqlx.getSession(process.env.MYSQLX_HARDWARE_DATABASE_URL);
        await session.sql('SET @id = ?;')
                        .bind(request.params.id)
                        .execute();
        const statement = "CALL list_current_rental_by_hardware_id(@id)";
        const result = await session.sql(statement).execute();
        const columns = await result.getColumns();
        const current = await result.fetchOne();
        const scheme = current.reduce((res, value, i) => {
            return Object.assign({}, res, { [columns[i].getColumnLabel()]: value })
          }, {});

        await session.close();

        return scheme;
    });
}
