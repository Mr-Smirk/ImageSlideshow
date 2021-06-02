const fs = require('fs');

function createDao() {
    let dao = {};
    const fm = createFileManager();
    const img = 'data/img.json';
    const rating = 'data/rating.json';
    const user = 'data/user.json';
    const session = 'data/session.json';

    dao.getNext = (id) => {
        let next;
        let dataset = fm.load(img);
        dataset.forEach(data => {
            if(next == undefined && data.id > id) {
                next = data;
            } else if(next != undefined) {
                if(data.id < next.id && data.id > id) {
                    next = data;
                }
            }
        });
        if(!next) {
            next = {};
            next.id = -2147483648; 
            fm.load(img).forEach(data => {
                if(data.id > next.id) {
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
            if(previous == undefined && data.id < id) {
                previous = data;
            } else if(previous != undefined) {
                if(data.id > previous.id && data.id < id) {
                    previous = data;
                }
            }
        });
        if(!previous) {
            previous = {};
            previous.id = 2147483647;
            fm.load(img).forEach(data => {
                if(data.id < previous.id) {
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
            if(d.id == id) {
                return true;
            }
            return false;
        });
    }

    dao.rate = (id, user, type) => {
        if(type === 1 || type === 0 || type === -1) {
            let data = fm.load(rating);
            let currentRating = getLikeId(id, user);
            if(currentRating) {
                deleteRating(currentRating);
            }
            data.push(getId(rating), user, type, user);
            fm.save(rating);
        } else {
            throw 'Error: Invalid rating type';
        }
    }

    function getId(file) {
        let data = fm.load(file);
        if(data !== undefined) {
            return data[data.length-1].id+1;
        }
        return 0;
    }

    function deleteRating(id) {
        let data = fm.load(rating);

        let index = data.find(e => {
            if(entry.id == id) {
                return true;
            }
        });
        
        if(index >= 0) {
            data.splice(index, index+1);
        }
        fm.save(rating);
    }

    function getLikeId(id, user) {
        let likeID = undefined;
        let data = fm.load(rating);
        data.forEach(entry => {
            if(entry.id == id && entry.owner == user) {
                likeID = entry.id;
            }
        });
        return likeID;
    }

    countRating = (id, type) => {
        let numLikes = 0
        let data = fm.load(rating);
        if(data != undefined) {
            data.forEach(data => {
                if(data.img == id && type == data.type) {
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
        if(data !== undefined) {
            data.forEach(data => {
                if(data.owner == user && data.img == id) {
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
            if(!files[f]) {
            try {
                fs.accessSync(f);
                files[f] = JSON.parse(fs.readFileSync(f));
            } catch(err) {
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
        } catch(err) {
            console.error(err);
            return null;
        }
        return files[f].data;
    }

    fileManager.save = (f) => {
        try {
            fs.accessSync(f);
            fs.writeFileSync(f, JSON.stringify(this.content));
            return true;
        } catch(err) {
            console.error(err);
            return false;
        }
    }
    return fileManager;
}

module.exports = { createDao };