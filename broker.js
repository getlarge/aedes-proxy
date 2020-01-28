var aedes = require('aedes');
var aedesPersistence = require('aedes-persistence');
var MQEmitter = require('mqemitter');
var protocolDecoder = require('./protocol-decoder');

const broker = {
  config: {},
};

const decodeProtocol = (client, buff) => {
  const proto = protocolDecoder(client, buff);
  console.log('decodeProtocol:res', proto);

  if (proto.data) {
    console.log('decodeProtocol:proto data', {
      protocolData: proto.data.toString(),
    });
  }

  return proto;
};


const preConnect = (client, cb) => {
  console.log('preConnect:res', {
    connDetails: client.connDetails,
  });

  if (client.connDetails && client.connDetails.ipAddress) {
    client.ip = client.connDetails.ipAddress;
    client.type = client.connDetails.isWebsocket ? 'WS' : 'MQTT';
    return cb(null, true);
  }
  return cb(null, false);
};


const onAuthenticate = async (client, username, password) => {
    if (!client || !client.id) return 1;
    if (!password || !username) return 4;

    let status;

    if (
      username === 'test' &&
      password.toString() === 'test'
    ) {
      status = 0;
      client.user = username;
    } 

    if (!client.ip) return 2;
    if (status === undefined) status = 2;
  
    return status;
};


const authenticate = (client, username, password, cb) => {
  onAuthenticate(client, username, password)
    .then(status => {
      if (status !== 0) {
        return cb({ returnCode: status || 3 }, null);
      }
      return cb(null, true);
    })
    .catch(e => {
      console.log('authenticate:err', e);
      return cb(e, null);
    });
};


const initServers = (brokerInterfaces, brokerInstance) => {
  const tcpServer = require('net')
    .createServer(brokerInstance.handle)
    .listen(brokerInterfaces.mqtt.port);

  return { tcpServer };
};


broker.init = () => {
  broker.config = {
    interfaces: {
      mqtt: { port: 1883 },
    },
  };

  const aedesConf = {
    mq: MQEmitter(),
    persistence: aedesPersistence(),
    concurrency: 100,
    connectTimeout: 2000,
    decodeProtocol,
    preConnect,
    authenticate,
    trustProxy: true,
    // trustProxy: () => {
    //   if (config.MQTT_TRUST_PROXY && config.MQTT_TRUST_PROXY === 'true') {
    //     return true;
    //   }
    //   return false;
    // },
  };

  broker.instance = new aedes.Server(aedesConf);

  const { tcpServer } = initServers(
    broker.config.interfaces,
    broker.instance,
  );

  broker.instance.once('closed', () => {
    tcpServer.close();
  });
  broker.instance.on('client', client => {
    console.log('onClientConnect', client.id); 
  });

  broker.instance.on('clientDisconnect', client => {
    console.log('onClientDisconnect', client.id);
  });

  broker.instance.on('keepaliveTimeout', client => {
    console.log('onKeepaliveTimeout', client.id);
  });

  broker.instance.on('clientError', (client, err) => {
    console.log({ clientId: client.id, error: err.message });
  });


  broker.instance.on('connectionError', (client, err) => {
    console.log('onConnectionError', { clientId: client.id, error: err.message });

  });

};

broker.init()


