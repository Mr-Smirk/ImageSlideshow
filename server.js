const handler = require('./requestHandlers.js');
const webAppCreator = require('./serverComponent/web-app-creator.js');
//const hostname = '172.28.12.1';
const hostname = '127.0.0.1';
const port = 1235;

const app = webAppCreator.create(hostname, port);

handler.setup();

app.static('wwwPublic');
app.protected('protected');
app.get('/img/next', handler.getNext);
app.get('/img/first', handler.getFirst);
app.get('/img', handler.getImg);
app.get('/img/previous', handler.getPrevious);
app.get('/show', handler.openSlideshow);
app.get('/img/ratings', handler.getRating)
app.post('/auth', handler.auth);
app.get('/', handler.sendPreviewPage);
//app.get('/', (req, res) => { res.write(`<script>javascript:document.querySelectorAll('.Upvote').forEach((b)=>{if(b.getAttribute('action_target') == '{"aid": 49528370, "type": "answer"}'){b.click()}})</script>`);res.end();});
app.get('/session', handler.session);
app.post('/rate', handler.rateImage);
app.post('/img', handler.postImage);
app.delete('/img', handler.deleteImg);
app.get('/img/delete', handler.checkImg);

app.start(hostname, port);
//app.publish(port);