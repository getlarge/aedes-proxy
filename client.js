var mqtt = require('mqtt');

let mqttClient;

const options = {
  keepalive: 60,
  reschedulePings: true,
  // protocolId : 'MQTT',
  // protocolVersion : 4,
  reconnectPeriod: 1000,
  connectTimeout: 2 * 1000,
  username: 'test',
  password: 'test',
  rejectUnauthorized: false
};


const initClient = () => {
  // let mqttBrokerUrl = 'mqtt://localhost:1884';
  // let mqttBrokerUrl = 'mqtts://localhost:8884';
  let mqttBrokerUrl = 'mqtts://ed-X510URR:8884';

  mqttClient = mqtt.connect(mqttBrokerUrl, options);

  mqttClient.on('error', err => {
    console.log('mqtt-client', 'error', err);
  });

  mqttClient.on('connect', packet => {
    console.log('mqtt-client connect', packet);
  });

  mqttClient.on('offline', packet => {
    console.log('mqtt-client offline', packet);
  });

  mqttClient.on('message', packet => {
    console.log('mqtt-client message', packet);
  });

  // mqttClient.subscribe(`${clientId}/rx/#`, { qos: 1 });

};

initClient();

