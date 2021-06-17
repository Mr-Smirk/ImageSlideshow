function Route(method, url, handler) {
    if (!method || typeof (method) != 'string' || !['GET', 'POST', 'DELETE'].includes(method.toLocaleUpperCase()))
        throw `can not create route. value of method parameter not acceptable: ${method}`;

    if (!url || typeof (url) != 'string' || !url.startsWith('/'))
        throw `can not create route. value of url parameter not acceptable (must start with /): ${url}`;

    if (!handler || typeof (handler) != 'function')
        throw `can not create route. value of handler parameter not acceptable: ${handler}`;

    this.method = method;
    this.url = url;
    this.handler = handler;
}

function createRoutingTable() {
    let rTable = [];

    rTable.register = function (r) {
        let duplicate = this.select(r);

        if (duplicate)
            throw `route already registered: ${JSON.stringify(duplicate)}`;

        this.push(r);
    };

    rTable.select = function (routeToSelect) {
        let route = this.find(r => {
            let url = routeToSelect.url.split('?')[0].toLowerCase();
            return r.method.toUpperCase() == routeToSelect.method.toUpperCase() &&
                url == r.url.toLowerCase();
        });
        return route;
    };

    return rTable;
}

module.exports = { Route, createRoutingTable };