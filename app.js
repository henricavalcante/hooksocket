
'use strict';

const socketIo = require('socket.io');
const koa = require('koa');
const koaRoute = require('koa-route');
const koaBody = require('koa-body');
var app = module.exports = koa();

const nts = require('./events');
const configs = {
  portHooks: 3000,
  portSocket: 3001,
  appSecret: "MySecretAppKey" 
}
var clients = {};

var io = socketIo(configs.portSocket);

io.on('connection', function (socket) {

  socket.on('subscribeClient', function(data) {

    let clientId = data.clientKey || socket.id;

    if (clients[clientId] === undefined) {
      clients[clientId] = {};
    }

    socket.clientId = clientId;

    clients[clientId][socket.id] = socket;

    console.log("clientId: ", clientId, ' - ', socket.id);

  });

  socket.on('disconnect', function() {
    delete clients[socket.clientId][socket.id];
    if (!Object.keys(clients[socket.clientId]).length) {
      delete clients[socket.clientId];
    }
  })

});

app.use(koaBody());

nts.map(function(nt) {
  app.use(koaRoute[nt.route.method](nt.route.path, function *() {
    //let socket = clients[this.request.body.socketId];
    //socket.emit('notification', nt.template);
    this.body = nt.template;
  }));
});

app.listen(configs.portHooks);
