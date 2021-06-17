const fs = require('fs');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const fm = createFileManager();

function createDao() {
    let dao = {};
    let lastCleanup = 0;
    const img = 'data/img.json';
    const rating = 'data/rating.json';
    const user = 'data/user.json';
    const session = 'data/session.json';

    dao.generateImage = (userID, type) => {
        let obj = {};
        obj.owner = userID;
        let id = getId(img);
        obj.filename = 'img' + id + '.' + type;
        obj.id = id;
        fm.load(img).push(obj);
        fm.save(img);
        return obj;
    }

    dao.tryDeleteImg = (imgId, userID) => {
        let owner = -1;
        fm.load(img).forEach((i) => {
            if (i.id == imgId) {
                if (i.owner == userID) {
                    owner = i.owner;
                }
            }
        });
        if (owner == -1) {
            return false;
        }
        let arr = fm.load(img);
        let i;
        for (i = 0; i < arr.length; i++) {
            if (arr[i].id == imgId) {
                break;
            }
        }
        let obj = arr.splice(i, 1)[0];
        try {
            fs.unlinkSync('protected/img/' + obj.filename);
            fs.unlinkSync('protected/preview/' + obj.filename);
        } catch (err) {
            console.log(err);
        }
        fm.save(img);
        return true;
    }


    dao.checkDelete = (imgId, userID) => {
        let owner = -1;
        fm.load(img).forEach((i) => {
            if (i.id == imgId) {
                if (i.owner == userID) {
                    owner = i.owner;
                }
            }
        });
        if (owner == -1) {
            return false;
        }
        return true;
    }

    dao.getNext = (id) => {
        let next;
        let dataset = fm.load(img);
        dataset.forEach(data => {
            if (next == undefined && data.id > id) {
                next = data;
            } else if (next != undefined) {
                if (data.id < next.id && data.id > id) {
                    next = data;
                }
            }
        });
        if (!next) {
            next = {};
            next.id = -2147483648;
            fm.load(img).forEach(data => {
                if (data.id > next.id) {
                    next = data;
                }
            });
        }
        return next;
    }

    dao.getPrevious = (id) => {
        let previous;
        let dataset = fm.load(img);
        dataset.forEach(data => {
            if (previous == undefined && data.id < id) {
                previous = data;
            } else if (previous != undefined) {
                if (data.id > previous.id && data.id < id) {
                    previous = data;
                }
            }
        });
        if (!previous) {
            previous = {};
            previous.id = 2147483647;
            fm.load(img).forEach(data => {
                if (data.id < previous.id) {
                    previous = data;
                }
            });
        }
        return previous;
    }

    dao.getFirst = () => {
        return fm.load(img)[0];
    }

    dao.getWithId = (id) => {
        return fm.load(img).find(d => {
            if (d.id == id) {
                return true;
            }
            return false;
        });
    }

    dao.rate = (img, user, type) => {
        if (type === 1 || type === 0 || type === -1) {
            let data = fm.load(rating);
            let currentRating = getRating(getLikeId(img, user));

            if (currentRating !== undefined) {
                if (currentRating.type === type) {
                    type = 0;
                }
                deleteRating(currentRating.id);
            }
            let obj = {};
            obj.id = getId(rating);
            obj.img = img;
            obj.user = user;
            obj.type = type;
            data.push(obj);
            fm.save(rating);
        } else {
            throw 'Error: Invalid rating type';
        }
    }

    function getRating(id) {
        let found = undefined;
        fm.load(rating).forEach((element) => {
            if (element.id === id) {
                found = element;
            }
        });
        return found;
    }

    dao.registerUser = (username, password) => {
        if (!existUser(username)) {
            let hash = bcrypt.hashSync(password, 10);
            let u = {};
            u.id = getId(user);
            u.username = username;
            u.password = hash;
            let users = fm.load(user);
            users.push(u);
            fm.save(user);
        } else {
            return undefined;
        }
    }

    function existUser(username) {
        let users = fm.load(user);
        if (users !== undefined) {
            users.forEach(user => {
                if (user.username == username) {
                    return true;
                }
            });
        }
        return false;
    }

    dao.authenticate = (username, password) => {

        let data = fm.load(user);
        let successfull = false;
        for (let i = 0; i < data.length; i++) {
            if (data[i].username === username) {
                if (bcrypt.compareSync(password, data[i].password)) {
                    return createSession(data[i].id);
                }
            }
        }
        return undefined;
    }

    dao.getSession = (sessionID) => {
        let obj = {};
        let sessions = fm.load(session);
        sessions.forEach(s => {
            if (s.id === sessionID) {
                if (s.expire > Date.now()) {
                    obj = {};
                    obj.user = s.user;
                    obj.id = s.id;
                    obj.expire = s.expire;
                } else {
                    cleanup();
                }
            }
        });
        if (obj) {
            obj.user = dao.getWithId(obj.user);
        }
        return obj;
    }

    function createSession(userID) {
        cleanup();
        let s = {};
        s.id = getSessionKey();
        s.user = userID;
        s.expire = Date.now() + (30000 * 1000);
        fm.load(session).push(s);
        fm.save(session);
        return s.id;
    }

    function getSessionKey() {
        let sessions = fm.load(session);
        let success = false;
        let key = 1;
        do {
            success = true;
            key = generate_key();
            for (let i = 0; i < session.length; i++) {
                if (session.id === key) {
                    success = false;
                    break;
                }
            }
        } while (!success);
        return key;
    }

    async function cleanup() {
        if (lastCleanup + 3600000 < Date.now()) {
            let sessions = fm.load(session);

            for (let i = 0; i < sessions.length; i++) {
                if (sessions[i].expire < Date.now()) {
                    sessions.splice(i, 1);
                    i--;
                }
            }
            fm.save(session);

            lastCleanup = Date.now;
        }
    }

    function generate_key() {
        return crypto.randomBytes(16).toString('base64');
    };

    function getId(file) {
        let data = fm.load(file);
        if (data !== undefined && data.length >= 1) {
            return data[data.length - 1].id + 1;
        }
        return 0;
    }

    function deleteRating(id) {
        let data = fm.load(rating);

        let index = -1;

        for (let i = 0; i < data.length; i++) {
            if (data[i].id === id) {
                index = i;
            }
        }

        if (index >= 0) {
            data.splice(index, 1);
        }
        fm.save(rating);
    }

    function getLikeId(id, user) {
        let likeID = undefined;
        let data = fm.load(rating);
        if (data.length >= 1) {
            data.forEach(entry => {
                if (entry.img == id && entry.user == user) {
                    likeID = entry.id;
                }
            });
        }
        return likeID;
    }

    countRating = (id, type) => {
        let numLikes = 0
        let data = fm.load(rating);
        if (data != undefined) {
            data.forEach(data => {
                if (data.img == id && type == data.type) {
                    numLikes++;
                }
            });
        }
        return numLikes;
    }

    dao.getDislikes = (id) => {
        return countRating(id, -1);
    }

    dao.getLikes = (id) => {
        return countRating(id, 1);
    }

    dao.getRate = (id, user) => {
        let hasRated = 0;
        let data = fm.load(rating);
        if (data !== undefined) {
            data.forEach(data => {
                if (data.user == user && data.img == id) {
                    hasRated = data.type;
                }
            });
        }
        return hasRated;
    }

    return dao;
}

function createFileManager() {
    let fileManager = {};
    files = {};

    fileManager.load = (f) => {
        if (!files[f]) {
            try {
                fs.accessSync(f);
                files[f] = JSON.parse(fs.readFileSync(f));
            } catch (err) {
                console.error(err);
                return null;
            }
        }
        let target = files[f];
        return target.data;
    }

    fileManager.reload = (f) => {
        try {
            fs.accessSync(f);
            files[f] = JSON.parse(fs.readFileSync(f));
        } catch (err) {
            console.error(err);
            return null;
        }
        return files[f].data;
    }

    fileManager.save = (f) => {
        try {
            fs.accessSync(f);
            fs.writeFileSync(f, JSON.stringify(files[f]));
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    }
    return fileManager;
}

module.exports = { createDao };