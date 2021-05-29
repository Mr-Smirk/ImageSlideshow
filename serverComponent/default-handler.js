function sendDefaultNotFound(req, res) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain');
    res.write(`the requested resource '${req.url}' could not be found. ${res.statusCode}`);
    res.end();
}

function sendDefaultBadRequest(req, res) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'text/plain');
    res.write(`the request for resource ${req.url} is not correct. ${res.statusCode}`);
    res.end();
}

function sendDefaultInternalServerError(req, res) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain');
    res.write(`An unexpected error has occured. ${res.statusCode} Internal Server Error`);
    res.end();
}

function sendStaticContent(req, res, staticContent, contentType) {
    res.statusCode = 200;
    res.setHeader('Content-Type', contentType);
    res.write(staticContent);
    res.end();
}

module.exports = { sendDefaultNotFound, sendDefaultBadRequest, sendDefaultInternalServerError, sendStaticContent };