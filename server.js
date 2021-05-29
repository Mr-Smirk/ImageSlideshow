const handler = require('./requestHandlers.js');
const webAppCreator = require('./serverComponent/web-app-creator.js');
const hostname = '127.0.0.1';
const port = 3000;

const app = webAppCreator.create(hostname, port);

handler.setup();

app.static('wwwPublic');
app.get('/img/next', handler.getNext);
app.get('/img/first', handler.getFirst);
app.get('/img', handler.getImg);
app.get('/img/previous', handler.getPrevious);
app.get('/show', handler.openSlideshow);
app.get('/img/ratings', handler.getRating)

app.start(hostname, port);