

# HookSocket

HookSocket is a tiny lightweight service to emit websockets triggered by webhooks


## Getting Started

### Server-side

```
$ npm i hooksocket
```

```javascript
const hooksocket = require('hooksocket');

hooksocket([{
  "route": {
    "method": "post",
    "path": "/path/to/notification"
  },
  "scope": "client",
  "msg": {
    "template": "You receive a new messsage from {sender}, {link} to view."
  }
}]);
```

Send a json data like this to the server

```json
{
    "clientId": "b4e9bb81e9aa37ab2a3b979f7e6f4f87",
    "templateParameters": {
      "sender": "Ball Goats",
      "link": "http://www.com"
    }
}
```
```
$ curl -i -H "Accept: application/json" -H "Content-Type: application/json" -X POST -d '{"clientId": "b4e9bb81e9aa37ab2a3b979f7e6f4f87","templateParameters": {"sender": "Ball Goats","link": "http://www.com"}}' http://localhost:3000/path/to/notification
```

### Client-side

```html
<script src="https://cdn.jsdelivr.net/socket.io-client/1.3.2/socket.io.min.js"></script>
<script>
  var socket = io('ws://localhost:3001/');
  socket.on('connect', function () {

    socket.emit('subscribeClient', {
      clientKey: "b4e9bb81e9aa37ab2a3b979f7e6f4f87",
    });

    socket.on('client_notification', function (payload) {
      console.log('Client Notification', payload);
    });

  });
</script>
```
