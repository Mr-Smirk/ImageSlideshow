const { ESRCH } = require('constants');
const fs = require('fs');
const { connect } = require('http2');
const createDao = require('./data/data-access.js');
const dao = createDao.createDao();
const getSession = require('./sessions.js').getSession;
var connection;

function setup() {
    //dao.registerUser('user', 'password');
}

function rate(req, res) {
    receiveData(req, res, (data) => {

    });
}

function getRating(req, res) {
    let obj = {};
    let data = getDataFromUrl(req.url);
    obj.likes = dao.getLikes(data.id);
    obj.dislikes = dao.getDislikes(data.id);
    let userID = getSession(req, res);
    userID = userID.user.id;
    obj.userRate = dao.getRate(data.id, userID);
    res.setHeader('Content-Type', 'application/json');
    res.write(JSON.stringify(obj));
    res.statusCode = 200;
    res.end();
}


function getNext(req, res) {
    let data = getDataFromUrl(req.url);
    if (data != undefined && data.id != undefined) {
        try {
            let obj = dao.getNext(data.id);
            res.setHeader('Content-Type', 'application/json');
            res.write(JSON.stringify(obj));
            res.statusCode = 200;
            res.end();
        } catch (error) {
            console.log(error);
        }
        res.statusCode = 404;
        res.end();
    }
    res.statusCode = 400;
    res.end()
}

function getPrevious(req, res) {
    let data = getDataFromUrl(req.url);
    if (data != undefined && data.id != undefined) {
        try {
            let obj = dao.getPrevious(data.id);
            res.setHeader('Content-Type', 'application/json');
            res.write(JSON.stringify(obj));
            res.statusCode = 200;
            res.end();
        } catch (error) {
            console.log(error);
        }
        res.statusCode = 404;
        res.end();
    }
    res.statusCode = 400;
    res.end()
}

function getFirst(req, res) {
    let obj = dao.getFirst();
    res.setHeader('Content-Type', 'application/json');
    res.write(JSON.stringify(obj));
    res.statusCode = 200;
    res.end();
}

function getNextId(id) {
    return id + 1;
}

function getImg(req, res) {
    let data = getDataFromUrl(req.url);
    if (data != undefined && data.id != undefined) {
        try {
            let obj = dao.getWithId(data.id);
            res.setHeader('Content-Type', 'application/json');
            res.write(JSON.stringify(obj));
            res.statusCode = 200;
            res.end();
        } catch (error) {
            console.log(error);
        }
        res.statusCode = 404;
        res.end();
    }
    res.statusCode = 400;
    res.end()
}

function rateImage(req, res) {
    receiveData(req, res, (data) => {
        data = JSON.parse(data);
        if(data.img !== undefined && data.type !== undefined) {
            if(data.type == -1 || data.type == 0 || data.type == 1) {
                let session = getSession(req, res);
                dao.rate(data.img, session.user.id, data.type);
                res.statusCode = 200;
                res.end();
            }
        } else {
            res.statusCode = 400;
            res.end();
        }
    });
}

async function getImageDataset(id) {
    let query = 'SELECT "ID","FILENAME","OWNER",(SELECT COUNT(TYPE) FROM imageRating WHERE TYPE = 1 AND IMAGE = "IMAGE"."ID") "LIKES",(SELECT COUNT(TYPE) FROM imageRating WHERE TYPE = -1 AND IMAGE = "IMAGE"."ID") "DISLIKES" FROM IMAGE WHERE ID = '
    query += id;

    let result = await connection.execute(
        `SELECT COUNT(*) FROM IMG`,

        function(err, result) {
            if(err) {
                console.error(err);
                return;
            }
            console.log(result);
        }
    );

    console.log(result);

    img = {};
    img.id = id;
    img.img = getImgName(id);
    img.likes = "";
}

function getImgName(id) {
    return "test.png";
}

function getImg2(req, res) {
    let url = req.url;
    let file = getDataFromUrl(url).file;
    let type = file.substring(file.length - 5, file.length);
    if (file === undefined || file === '' || type != ".json") {
        res.statusCode = 400;
        res.end();
    } else {
        try {
            let fsmLoaded = fsm.load(file);
            let generator = puml.generate(file, fsmLoaded);
            res.setHeader('Content-Type', 'image/png');

            generator.out.pipe(new Base64Encode()).pipe(res);

            generator.out.on('end', () => {
                res.statusCode = 201;
                res.end();
            });

            generator.out.on('error', (err) => {
                console.error(err);
                res.statusCode = 500;
                res.write('an unexpected error occured.');
                res.end();
            });
        } catch (ex) {
            res.statusCode = 400;
            res.write(ex.message ? ex.message : ex.toString());
        }
    }
}

function receiveData(req, res, end) {
    let data = '';
    req.on('data', (chunk) => {
        data += chunk;
    });
    req.on('end', () => {
        end(data);
    });
}

function getDataFromUrl(body) {
    let obj = {};
    let data = body.split('?'); // GET /api/test?file=Hello?date=Hi
    if (data.length >= 2) {
        data = data[1];
        data = data.split('&'); // GET /api/test?file=HelloWorld&name=Hi
        data.forEach(d => {
            let kvPair = d.split('=');
            try {
                obj[kvPair[0]] = parseInt(kvPair[1]);
            } catch (err) {
                obj[kvPair[0]] = kvPair[1];
            }
        });
    }
    return obj;
}

function openSlideshow(req, res) {
    if(getSession(req, res)) {
        data = getDataFromUrl(req.url);
        if (data != undefined && data.id != undefined) {
            try {
                let carousel = fs.readFileSync('./slideshow.html');
                res.setHeader('Content-Type', 'text/html');
                res.write(carousel);
                res.statusCode = 200;
                res.end();
            } catch (err) {
                console.error(err);
                res.statusCode = 500;
                res.end();
            }
        } else {
            res.statusCode = 400;
            res.end();
        }
    } else {
        res.setHeader('Location', '/login.html');
        res.statusCode = 302;
        res.end();
    }
}

function sendPreviewPage (req, res) {
    let session = getSession(req, res);
    if(session) {
        let carousel = fs.readFileSync('./preview.html');
        res.setHeader('Content-Type', 'text/html');
        res.write(carousel);
        res.statusCode = 200;
        res.end();
    } else {
        res.setHeader('Location', '/login.html');
        res.statusCode = 302;
        res.end();
    }
}

function auth(req, res) {
    receiveData(req, res, (data) => {
        data = JSON.parse(data);
        try {
            let session = dao.authenticate(data.username, data.password);
            if(session) {
                res.setHeader('Content-Type', 'text/plain');
                res.setHeader('Set-Cookie', 'session=' + session);
                res.statusCode = 200;
                res.end();
            } else {
                res.statusCode = 401;
                res.end();
            }
        } catch(err) {
            res.statusCode = 400;
            res.end();
        }
    });
}


function session(req, res) {
    res.write(JSON.stringify(getSession(req, res)));
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end();
}

module.exports = { rateImage, session, sendPreviewPage, auth, getRating, getNext, getFirst, getPrevious, getImg, openSlideshow, setup }
