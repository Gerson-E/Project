// Subscribes to MQTT messages on gps/tracker topic
// Passes pulse, spo2, and temp to a trained ML model using predict.py

const mqtt = require('mqtt');
const { exec } = require('child_process'); // used to run external system commands from node.js script

const brokerUrl = 'mqtt://localhost:1883';
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
        const { pulse, spo2, temp } = data; // for ML
        console.log(`Received: Pulse=${pulse}, SpO₂=${spo2}, Temp=${temp.toFixed(2)}`);

        // run Python ML model prediction
        exec(`python predict.py ${pulse} ${spo2} ${temp}`, (err, stdout) => {
            if (err) {
                console.error('ML prediction error:', err);
            } else {
                console.log('ML Prediction:', stdout.trim());
            }
        });

    } catch (e) {
        console.error('JSON parse error or missing fields:', e);
    }
});

client.on('error', (err) => {
    console.error('MQTT connection error:', err);
});
