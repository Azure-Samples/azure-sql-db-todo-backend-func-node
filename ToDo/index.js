const { executeSQL } = require('../shared/utils');
const { url } = require('url');

todoREST = function (context, req) {
    const method = req.method.toLowerCase();
    var payload = null;

    enrichToDo = function (source)
    {
        var todoUrl = new URL(req.url);
        console.log(`Result: ${source}`);                
        var todo = JSON.parse(source);
        if (todo instanceof Array) {
            todo.forEach(e => {
                e.url = `${todoUrl.origin}/api/todo/${e.id}`
            });    
        } else {
            todo.url = `${todoUrl.origin}/api/todo/${todo.id}`
        }
        return todo;
    }

    setContext = function (body, status = 200) {
        context.res.status = status;
        context.res.body = body;
        context.done();
    };

    var prefix = method;
    switch (method) {
        case "get":
            payload = req.params.id ? { "id": req.params.id } : null;
            break;
        case "post":
            payload = req.body;
            break;
        case "put":
        case "patch":
            payload = {
                "id": req.params.id,
                "todo": req.body
            };
            prefix = "put";
            break;
        case "delete":
            payload = req.params.id ? { "id": req.params.id } : null;
            break;
    }

    executeSQL(context, prefix, payload).then(result => {
        todo = enrichToDo(result);
        setContext(todo);
    }, reject => {
        context.log.error(reject);
        setContext("Error while executing SQL statement", 500);
    });
}

module.exports = todoREST;

