// Subscribes to MQTT messages on gps/tracker topic
// Passes pulse, spo2, and temp to a trained ML model using predict.py
// Stores values in InfluxDB

require('dotenv').config(); // <-- loads the .env file

import { influxDB, Point } from '@influxdata/influxdb-client' // instantiate influx client
// instantiate influxDB with env variables
const influxDB = new InfluxDB({
    url: process.env.INFLUX_URL,
    token: process.env.INFLUX_TOKEN,
    org: process.env.INFLUX_ORG,
  });

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

        // call the api ability to write to influx
        const writeApi = influxDB.getWriteApi(org, bucket)
        // overall tag for the key value pairs
        writeApi.useDefaultTags({app: 'tracker'})
        2
        // make a data point. figure out var names
        const point = new Point('test_point')
            .tag('user', '')
            .floatField('lat', lat)
            .floatField('long', long)
            // .floatField('stress', stress)

            .floatField('stressed', stress)


        writeApi.writePoint(point);
        //need to close it

    } catch (e) {
        console.error('JSON parse error or missing fields:', e);
    }
});

client.on('error', (err) => {
    console.error('MQTT connection error:', err);
});
