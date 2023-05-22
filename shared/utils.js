var Connection = require('tedious').Connection;
var Request = require('tedious').Request
var TYPES = require('tedious').TYPES;

const executeSQL = (context, verb, payload) => new Promise((resolve, reject) => {
    var result = "";    
    const paramPayload = (payload != null) ? JSON.stringify(payload) : '';
    //context.log(`Payload: ${JSON.stringify(payload)}`);

    const connection = new Connection({
        server: process.env["db_server"],
        authentication: {
            type: 'default',
            options: {
                userName: process.env["db_user"],
                password: process.env["db_password"],
            }
        },
        options: {
            database: process.env["db_database"],
            encrypt: true
        }
    });
    
    // Use this logic to coonect to Azure SQL backend pools using managed indentity of an Azure VM
    
    /*    const connection = new Connection({
        server: process.env["db_server"],
        authentication: {
            type: 'azure-active-directory-msi-vm',
        },
        options: {
            database: process.env["db_database"],
            encrypt: true,
            port: 1433
        }
    });

    // Use this logic to coonect to Azure SQL backend pools using managed indentity of an Azure App Service/Function Apps 
    
    const connection = new Connection({
        server: process.env["db_server"],
        authentication: {
            type: 'azure-active-directory-msi-app-service',
        },
        options: {
            database: process.env["db_database"],
            encrypt: true,
            port: 1433
        }
    });

*/

    const request = new Request(`web.${verb}_todo`, (err) => {
        if (err) {
            reject(err);
        } else {
            if ((result == "" || result == null || result == "null")) result = "[]";  
            resolve(result);
        }       
    });    
    request.addParameter('payload', TYPES.NVarChar, paramPayload, Infinity);

    request.on('row', columns => {
        columns.forEach(column => {
            result += column.value;                
        });
    });

    connection.on('connect', err => {
        if (err) {
            reject(err);
        }
        else {
            connection.callProcedure(request);
        }
    });   

    connection.connect();    
});

exports.executeSQL = executeSQL;
