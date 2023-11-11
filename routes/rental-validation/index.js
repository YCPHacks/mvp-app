'use strict'
const mysqlx = require('@mysql/xdevapi');
const { DateTime } = require('luxon');

module.exports = async function (fastify, options) {
    fastify.post('/', async function (request, reply) {
        const hardware_id = request.body.hardware_id;
        const desiredStatus = request.body.status;
        const userId = request.body.user_id;
        const time = DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss');

        const session = await mysqlx.getSession(process.env.MYSQLX_HARDWARE_DATABASE_URL);

        await session.sql('SET @hardware_id = ?;')
            .bind(hardware_id)
            .execute();

        await session.sql('SET @user_id = ?;')
            .bind(userId)
            .execute();

        const statement = "CALL list_current_rental_by_hardware_id(@hardware_id)";
        const result = await session.sql(statement).execute();
        const rent_current = await result.fetchOne();
        const columns = await result.getColumns();

        const data = rent_current.reduce((res, value, i) => {
            return Object.assign({}, res, { [columns[i].getColumnLabel()]: value })
        }, {});

        console.log(data);

        const rentalLastUpdated = data.last_updated;
        const rentalLatestStatus = data.status;
        let valid = false;

        //Dealing with check outs
        if(desiredStatus == 'checked-out'){
            if (rentalLatestStatus == null && (time > rentalLastUpdated || rentalLastUpdated == null)) {
                valid = true;
            } 
            else{
                valid = false;
            }
        }
        
        //Dealing with check ins
        else if(desiredStatus == 'checked-in'){
            if(rentalLatestStatus == "checked-out" && (time > rentalLastUpdated || rentalLastUpdated == null)){
                valid = true;
            }
            else{
                valid = false;
            }
        }
        
        //if anything else 
        else{
            valid = false;
        }
        
        //console.log(valid);

        if(valid == true){
            if(desiredStatus == 'checked-in'){
                const statement = "CALL check_in_hardware(@hardware_id,@user_id)";
                await session.sql(statement).execute();
                //console.log("checked-in");
            }
            else if(desiredStatus == 'checked-out'){
                const statement = "CALL checkout_hardware(@hardware_id,@user_id)";
                await session.sql(statement).execute();
                //console.log("checked-out");
            }
            else{
            //console.log("error");
            }
        };
    });
}