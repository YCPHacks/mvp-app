'use strict'
const mysqlx = require('@mysql/xdevapi');

module.exports = async function (fastify, options) {
    fastify.get('/', async function (request, reply) {
        const session = await mysqlx.getSession(process.env.MYSQLX_HARDWARE_DATABASE_URL);

        // If request.query.categories is not an array, make it an array
        if(request.query.categories && !Array.isArray(request.query.categories)){
            request.query.categories = [request.query.categories];
        }
        
        let categoryString = '[';
        if(request.query.categories){
            categoryString += request.query.categories.map(category => {
                return `"${category}"`;
            }).join(',');
        }
        categoryString += ']';


        const search = request.query.search || '';
        //console.log(search);
        const categories = categoryString || '[]';
        //console.log(categories);
        const pageSize = request.query.pageSize || 20;
        //console.log(pageSize);
        const pageNumber = request.query.pageNumber || 1;
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
