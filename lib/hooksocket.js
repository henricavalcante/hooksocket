
'use strict';

const socketIo = require('socket.io');
const koa = require('koa');
const koaRoute = require('koa-route');
const koaBody = require('koa-body');
const app = koa();
const crypto = require('crypto');
const stringTemplate = require('string-template');

const configs = {
  portHooks: 3000,
  portSocket: 3001,
  secretKey: 'MySecretAppKey',
}

const clients = {};
const native_notifications = [{
    route: {
      method: 'get',
      path: '/'
    },
    scope: 'global',
    msg: {
      template: 'http://github.com/henricavalcante/hooksocket'
    }
  }];

const io = socketIo(configs.portSocket);

module.exports = (notifications, settings) => {

  if (notifications === undefined) {
    notifications = [];
  }

  Object.assign(configs, settings);

  // middleware for body parser
  app.use(koaBody());

  // register routes on koa
  [...native_notifications, ...notifications].map((nt) => {
    app.use(koaRoute[nt.route.method](nt.route.path, function *() {
      const payload = {
        msg: stringTemplate(nt.msg.template, this.request.body.templateParameters),
        date: new Date()
      }

      // append notification paylod
      Object.assign(payload, nt.payload);

      // append body payload
      if (this.request.body.payload) {
        Object.assign(payload, this.request.body.payload);
      }

      switch (nt.scope) {
          case 'client':
              var clientId = this.request.body.clientId; //to-do

              if (!clients[clientId]) {
                break;
              }

              Object.keys(clients[clientId]).map((key) => {
                let socket = clients[clientId][key];
                socket.emit('client_notification', payload);
              });
              break;
          default:
              io.sockets.emit('global_notification', payload);
              break;
      }

      this.body = payload;
    }));
  });

  // socket handlers
  io.on('connection', (socket) => {

    socket.on('subscribeClient', (data) => {

      let clientId = data.clientKey || socket.id;

      if (clients[clientId] === undefined) {
        clients[clientId] = {};
      }

      socket.clientId = clientId;

      clients[clientId][socket.id] = socket;

    });

    socket.on('disconnect', () => {
      delete clients[socket.clientId][socket.id];
      if (!Object.keys(clients[socket.clientId]).length) {
        delete clients[socket.clientId];
      }
    })

  });

  app.listen(configs.portHooks);
}
