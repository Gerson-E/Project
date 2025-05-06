// // Subscribes to MQTT messages on gps/tracker topic
// // Passes pulse, spo2, and temp to a trained ML model using predict.py
// // Stores values in InfluxDB

// require('dotenv').config(); // <-- loads the .env file

// import { influxDB, Point } from '@influxdata/influxdb-client' // instantiate influx client
// // instantiate influxDB with env variables
// const influxDB = new InfluxDB({
//     url: process.env.INFLUX_URL,
//     token: process.env.INFLUX_TOKEN,
//     org: process.env.INFLUX_ORG,
//     bucket: process.env.INFLUX_BUCKET,   
//   });

// const mqtt = require('mqtt');
// const { exec } = require('child_process'); // used to run external system commands from node.js script

// const brokerUrl = 'mqtt://localhost:1883';
// const topic = 'gps/tracker';

// const client = mqtt.connect(brokerUrl);

// client.on('connect', () => {
//     console.log('Connected to MQTT broker');
//     client.subscribe(topic, (err) => {
//         if (!err) {
//             console.log(`Subscribed to topic: ${topic}`);
//         } else {
//             console.error('Subscribe error:', err);
//         }
//     });
// });

// client.on('message', (_topic, payload) => {
//     try {
//         const { location, stress } = JSON.parse(payload.toString());

//         // location: "lat,lon" OR [lat,lon]
//         const [lat, lon] = Array.isArray(location) ? location : location.split(',').map(Number);

//         data = lat, lon, stress; 

//         const { } = data; // for ML
//         console.log(`Received: `, data);

//         // run Python ML model prediction
//         exec(`python predict.py ${lat} ${lon} ${stress}`, (err, stdout) => {
//             if (err) {
//                 console.error('ML prediction error:', err);
//             } else {
//                 console.log('ML Prediction:', stdout.trim());
//             }
//         });

//         // call the api ability to write to influx
//         const writeApi = influxDB.getWriteApi(org, bucket)
//         // overall tag for the key value pairs
//         writeApi.useDefaultTags({app: 'tracker'})
        
//         // make a data point. figure out var names
//         const point = new Point('test_point')
//             .floatField('latitude', lat)
//             .floatField('longitude', lon)
//             .floatField('stress', stress)

//         writeApi.writePoint(point);
//         //need to close it

//     } catch (e) {
//         console.error('JSON parse error or missing fields:', e);
//     }
// });

// client.on('error', (err) => {
//     console.error('MQTT connection error:', err);
// });


// subscriber.js  (CommonJS version ‑ easier to run with Node ≥16)

require('dotenv').config();                 // 1) load .env first
const mqtt        = require('mqtt');
const { exec }    = require('child_process');
const { InfluxDB, Point } = require('@influxdata/influxdb-client');

// ---------- env vars ----------
const {
  INFLUX_URL,
  INFLUX_TOKEN,
  INFLUX_ORG,
  INFLUX_BUCKET,
} = process.env;

if (!INFLUX_URL || !INFLUX_TOKEN || !INFLUX_ORG || !INFLUX_BUCKET) {
  console.error('[subscriber] Missing one or more Influx env vars');
  process.exit(1);
}

// ---------- InfluxDB client ----------
const influx  = new InfluxDB({ url: INFLUX_URL, token: INFLUX_TOKEN });
const writeApi = influx.getWriteApi(INFLUX_ORG, INFLUX_BUCKET, 'ns'); // ns precision
writeApi.useDefaultTags({ app: 'tracker' });

// ---------- MQTT client ----------
const brokerUrl = 'mqtt://localhost:1883';
const topic     = 'gps/tracker';

const client = mqtt.connect(brokerUrl);

client.on('connect', () => {
  console.log('[subscriber] Connected to MQTT broker');
  client.subscribe(topic, err =>
    err ? console.error('[subscriber] subscribe error', err)
        : console.log(`[subscriber] Subscribed to ${topic}`));
});

client.on('message', (_topic, payload) => {
  try {
    const { location, stress } = JSON.parse(payload.toString());

    // location as "lat,lon" OR [lat, lon]
    const [lat, lon] = Array.isArray(location)
      ? location
      : location.split(',').map(Number);

    console.log('[subscriber] received', { lat, lon, stress });

    // optional ML prediction
    exec(`python3 predict.py ${lat} ${lon} ${stress}`, (err, stdout) => {
      if (err) console.error('[subscriber] ML error', err);
      else     console.log('[subscriber] ML prediction:', stdout.trim());
    });

    // write to InfluxDB
    const point = new Point('gps')
      .floatField('lat',    lat)
      .floatField('lon',    lon)
      .floatField('stress', stress);

    writeApi.writePoint(point);
  } catch (e) {
    console.error('[subscriber] JSON parse error', e);
  }
});

client.on('error', err => {
  console.error('[subscriber] MQTT error', err);
});

// flush pending writes on exit
process.on('SIGINT', async () => {
  console.log('\n[subscriber] Flushing writes and exiting…');
  await writeApi.close().catch(e => console.error('[subscriber] close error', e));
  process.exit(0);
});
