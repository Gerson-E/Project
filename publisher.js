// simulates GPS + bio data and publishes it to a mqtt broker (mosquitto)
// topic: gps/tracker

const mqtt = require('mqtt');

const brokerUrl = 'mqtt://localhost:1883'; // mosquitto broker (local)
const topic = 'gps/tracker';

const client = mqtt.connect(brokerUrl);

client.on('connect', () => {
    console.log('Publisher connected, sending GPS data...');

    setInterval(() => {
        // fake or simulated data for testing (randomzied)
        const message = {
            latitude: 34.0689 + (Math.random() * 0.001),
            longitude: -118.4452 + (Math.random() * 0.001),
            timestamp: new Date().toISOString()
        };

        client.publish(topic, JSON.stringify(message));
        console.log('Sent:', message);
    }, 2000); // sends every 2 seconds
});