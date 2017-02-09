const WebSocketServer = require('ws').Server,
      express = require('express'),
      https = require('https'),
      app = express(),
      fs = require('fs'),
      os = require('os'),
      dns = require('dns');

const sslKey = fs.readFileSync('./ssl/key.pem'),
      sslCert = fs.readFileSync('./ssl/cert.pem'),
      sslOpts = {key: sslKey, cert: sslCert};

var sslServer = null,
    wsServer = null;

app.use(function(req, res, next) {
  if(req.headers['x-forwarded-proto']==='http') {
    return res.redirect(['https://', req.get('Host'), req.url].join(''));
  }
  next();
});

app.use(express.static('client'));

sslServer = https.createServer(sslOpts, app).listen(443);
wsServer = new WebSocketServer({server: sslServer});

wsServer.on('connection', function (client) {
  console.log("A new client was connected.");

  client.on('message', function (message) {
    wsServer.broadcast(message, client);
  });
});

wsServer.broadcast = function (data, exclude) {
  console.log("Broadcasting starts...");
  wsServer.clients.forEach(function(client){
    if (client !== exclude && client.readyState === client.OPEN) {
      console.log("Sending to a client...");
      client.send(data);
    }
  });
};

dns.lookup(os.hostname(), function (err, address, fam) {
  console.log("Server ready. Go to https://" + address);
});
