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
  let mqttBrokerUrl
  // Bypassing TCP proxy
  // mqttBrokerUrl = 'mqtt://localhost:1884';
  // Bypassing HTTP proxy
  // mqttBrokerUrl = 'ws://localhost:3001';
  // Using TCP proxy
  // mqttBrokerUrl = 'mqtt://ed-X510URR:1883';
  // mqttBrokerUrl = 'mqtts://ed-X510URR:8883';
  // Using HTTP proxy
  mqttBrokerUrl = 'ws://ed-X510URR:80';
  // mqttBrokerUrl = 'wss://ed-X510URR:443';

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

};

initClient();

