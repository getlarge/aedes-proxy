var aedes = require('aedes')
var mqttPacket = require('mqtt-packet')
var net = require('net')
var proxyProtocol = require('proxy-protocol-js')
var protocolDecoder = require('./protocol-decoder');

var brokerPort = 4883
var proxyPort = 4884
var clientIp = '192.168.0.140'
var packet = {
  cmd: 'connect',
  protocolId: 'MQTT',
  protocolVersion: 4,
  clean: true,
  clientId: 'my-client-proxyV1',
  keepalive: 0
}

var packet2 = {
  cmd: 'disconnect'
}

var packet3 = {
  cmd: 'publish',
  messageId: 42,
  qos: 0,
  dup: false,
  topic: 'test',
  payload: new Buffer('test'),
  retain: false
}

var buf = mqttPacket.generate(packet)
var buf2 = mqttPacket.generate(packet2)
var buf3 = mqttPacket.generate(packet3)
var src = new proxyProtocol.Peer(clientIp, 12345)
var dst = new proxyProtocol.Peer('127.0.0.1', proxyPort)

const decodeProtocol = (client, buff) => {
  const proto = protocolDecoder(client, buff);
  if (proto.data) {
    console.log('decodeProtocol:proto data', {
      protocolData: proto.data.toString(),
      mqttPacket: buf.toString(),
      areEquals: proto.data.toString() === buf.toString()
    });
    // t.equal(proto.data, client.ip)
  } else {
    // t.fail('no MQTT packet extracted from TCP buffer')
  }
  // setImmediate(finish)
  return proto;
};


var broker = aedes({
  decodeProtocol,
  trustProxy: true
})

broker.on('client', client => {
  console.log('onClientConnect', client.id)
});

broker.on('clientDisconnect', client => {
  console.log('onClientDisconnect', client.id)
});

broker.on('publish', (packet, client) => {
  if (!packet.topic.startsWith('$SYS')) {
    console.log('onPublish', packet)
  }
});

var server = net.createServer(broker.handle)
server.listen(brokerPort, function (err) {
  // t.error(err, 'no error')
})

var proxyServer = net.createServer()
proxyServer.listen(proxyPort, function (err) {
  // t.error(err, 'no error')
})


var proxyClient

proxyServer.on('connection', function(socket) { 
  socket.on('end', function(data) {
    proxyClient.end(data, function() {
      proxyClient.connected = false
    })
  })

  socket.on('data', function(data) {
    if (proxyClient && proxyClient.connected) {
      proxyClient.write(data)
    } else {
      var protocol = new proxyProtocol.V1BinaryProxyProtocol(
        proxyProtocol.INETProtocol.TCP4,
        src,
        dst,
        data
      ).build()

      proxyClient = net.connect({
        port: brokerPort,
        timeout: 0
      }, function() {
        proxyClient.write(protocol, function() {
          proxyClient.connected = true
        })
      })
      // setTimeout(() => {
      //   proxyClient.write(protocol)
      // }, 50)
    }
  })
})

var tcpClient 

setInterval(() => {
  tcpClient = net.connect({
    port: proxyPort,
    timeout: 0
  }, function () {
    tcpClient.write(buf)
  })
 
  setTimeout(() => {
    tcpClient.write(buf3)
  }, 200)

  setTimeout(() => {
    tcpClient = tcpClient.end(buf2)
  }, 500)
}, 1000)