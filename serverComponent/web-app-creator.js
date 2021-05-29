const http = require('http');
const fs = require('fs');
const contentTypes = require('./contentTypes.json');

const { sendDefaultNotFound, sendDefaultBadRequest, sendDefaultInternalServerError, sendStaticContent } = require('./default-handler.js');
const { Route, createRoutingTable } = require('./routing.js');

const webAppCreator = {
    create: function () {
        const server = http.createServer(onRequest);
        const routingTable = createRoutingTable();
        let staticPath;

        function onRequest(req, res) {
            try {
                // server-component:
                // fix 400 error on server side, if ressource is not found!

                console.log(`request received for: ${req.method} ${req.url}`);
                let route = routingTable.select({ 'url': req.url, 'method': req.method });

                if (route) {
                    route.handler(req, res);
                    return;
                }

                if (req.method.toUpperCase() === 'GET') {
                    let filePath = getFilePath(req.url);
                    let fileExtension = getFileExtension(filePath);
                    let contentType = getContentType(fileExtension);

                    if (contentType == null) {
                        sendDefaultNotFound(req, res);
                        return;
                    }

                    if (!contentType) {
                        sendDefaultBadRequest(req, res);
                        return;
                    }

                    let staticContent = getStaticContent(filePath);
                    if (staticContent) {
                        sendStaticContent(req, res, staticContent, contentType);
                        return;
                    }
                }

                sendDefaultNotFound(req, res);
            } catch (err) {
                console.log(err);
                sendDefaultInternalServerError(req, res);
            }
        }

        function get(relativeUrl, reqHandler) {
            routingTable.register(new Route('GET', relativeUrl, reqHandler));
        }

        function post(relativeUrl, reqHandler) {
            routingTable.register(new Route('POST', relativeUrl, reqHandler));
        }

        function static(path) {
            if (!fs.existsSync(path))
                throw `The following path does not exist: ${path}`;

            staticPath = path;
        }

        function getFilePath(url) {
            return staticPath + url;
        }

        function getFileExtension(filePath) {
            if (!filePath.includes('.')) {
                return;
            }

            var parts = filePath.split('.');
            return parts[parts.length - 1];

        }

        function getContentType(fileExtension) {
            if (!fileExtension) return null;
            return contentTypes[fileExtension] === undefined ? null : contentTypes[fileExtension];
        }

        function start(hostname, port) {
            server.listen(port, hostname, () => {
                console.log(`Server running at http://${hostname}:${port}/`);
            });
        }

        function getStaticContent(filePath) {
            if (!fs.existsSync(filePath))
                return null;

            return fs.readFileSync(filePath);
        }

        let app = {};
        app.get = get;
        app.post = post;
        app.start = start;
        app.static = static;

        console.log('web app created');
        return app;
    }
};

module.exports = webAppCreator;