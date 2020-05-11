var mosca = require('mosca');
var path = require('path');
require('dotenv').config({ path: path.join(__dirname, './config') });

var moscaSettings = {
  port: 1883,
  secure : {
    port: 8443,
    keyPath: process.env.SECURE_KEY,
    certPath: process.env.SECURE_CERT,
  },
  http: {
    port: +process.env.MQTT_HTTP_PORT || 8080
  },
  https:{
    secure : {
    port:+process.env.MQTT_HTTPS_PORT || 4433,
    keyPath: process.env.SECURE_KEY,
    certPath: process.env.SECURE_CERT,
    }  
  } 
};

var server = new mosca.Server(moscaSettings);	//here we start mosca
server.on('ready', setup);	//on init it fires up setup()

// fired when the mqtt server is ready
function setup() {
  server.authenticate = authenticate;
  console.log('Mosca server is up and running (auth)')
}

var authenticate = function (client, username, password, callback) {
  var mqttUser = process.env.MQTT_USER || 'q4u';
  var mqttPassword = process.env.MQTT_PASSWORD.toString() || '##q4u##';
  
  var authorized = (username === mqttUser && password.toString() === mqttPassword);
  if (authorized) client.user = username;
  callback(null, authorized);
}

server.on('clientConnected', function (client) {
  console.log('Client Connected:', client.id);
});

// fired when a client disconnects
server.on('clientDisconnected', function (client) {
  console.log('Client Disconnected:', client.id);
});

server.on('published', function (packet, client) {
  console.log(packet);
  console.log('Published', packet.payload.toString());
});
