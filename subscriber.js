const mqtt = require('mqtt');

const brokerUrl = 'mqtt://localhost:1883'; // Change if using remote broker
const topic = 'gps/tracker';

const client = mqtt.connect(brokerUrl);

client.on('connect', () => {
    console.log('Connected to MQTT broker');
    client.subscribe(topic, (err) => {
        if (!err) {
            console.log(`Subscribed to topic: ${topic}`);
        } else {
            console.error('Subscribe error:', err);
        }
    });
});

client.on('message', (topic, message) => {
    try {
        const data = JSON.parse(message.toString());
        console.log(`[${new Date().toISOString()}] ${topic}:`, data);
    } catch (e) {
        console.error('Failed to parse message:', e);
    }
});

client.on('error', (err) => {
    console.error('❗ MQTT connection error:', err);
});