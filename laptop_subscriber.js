/*

this is the subscriber node 
subscribes to the sam topic as the raspi : gps/tracker
parses the JSON payload
displays the location & predicted stress level

note:
- run npm install mqtt
- ensure mosquitto is running locally (sudo systemctl start mo)

*/

const mqtt = require('mqtt');
const brokerUrl = 'mqtt://172.20.10.11:1883';
const topic = 'gps/tracker';
const client = mqtt.connect(brokerUrl);

client.on('connect', () => {
    console.log('Subscriber connected to broker');
    client.subscribe(topic, (err) => {
        if (err) {
            console.error('Subscription error:', err);
        } else {
            console.log(`Subscribed to topic: ${topic}`);
        }
    });
});

client.on('message', (topic, message) => {
    try {
        const data = JSON.parse(message.toString());

        const stressMap = {
            0: "No Stress",
            1: "Medium Stress",
            2: "High Stress"
        };

        console.log(`Location: (${data.Latitude.toFixed(5)}, ${data.Longitude.toFixed(5)})`);
        console.log(`Stress Level: ${stressMap[data.Stress]} (${data.Stress})\n`);
    } catch (e) {
        console.error("Failed to parse incoming message:", e);
    }
});
