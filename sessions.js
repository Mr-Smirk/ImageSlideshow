
const createDao = require('./data/data-access.js');
const dao = createDao.createDao();

function getSession(req, res) {
    let cookies = parseCookies(req);

    if(cookies.session) {
        return dao.getSession(cookies.session);
    }
    return undefined;
}

function parseCookies (request) {
    var list = {},
        rc = request.headers.cookie;

    rc && rc.split(';').forEach(function( cookie ) {
        var parts = cookie.split('=');
        list[parts.shift().trim()] = decodeURI(parts.join('='));
    });

    return list;
}

module.exports = { getSession, parseCookies };