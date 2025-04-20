const mqtt = require('mqtt');

const brokerUrl = 'mqtt://localhost:1883'; // or broker IP
const topic = 'gps/tracker';

const client = mqtt.connect(brokerUrl);

client.on('connect', () => {
    console.log('Publisher connected, sending GPS data...');

    setInterval(() => {
        const message = {
            latitude: 34.0689 + (Math.random() * 0.001),
            longitude: -118.4452 + (Math.random() * 0.001),
            timestamp: new Date().toISOString()
        };

        client.publish(topic, JSON.stringify(message));
        console.log('Sent:', message);
    }, 2000);
});