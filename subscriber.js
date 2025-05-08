// // require('dotenv').config();                 // 1) load .env first
// // const mqtt        = require('mqtt');
// // const { exec }    = require('child_process');
// // const { InfluxDB, Point } = require('@influxdata/influxdb-client');

// // // ---------- env vars ----------
// // const {
// //   INFLUX_URL,
// //   INFLUX_TOKEN,
// //   INFLUX_ORG,
// //   INFLUX_BUCKET,
// // } = process.env;

// // if (!INFLUX_URL || !INFLUX_TOKEN || !INFLUX_ORG || !INFLUX_BUCKET) {
// //   console.error('[subscriber] Missing one or more Influx env vars');
// //   process.exit(1);
// // }

// // // ---------- InfluxDB client ----------
// // const influx  = new InfluxDB({ url: INFLUX_URL, token: INFLUX_TOKEN });
// // const writeApi = influx.getWriteApi(INFLUX_ORG, INFLUX_BUCKET, 'ns'); // ns precision
// // writeApi.useDefaultTags({ app: 'tracker' });

// // // ---------- MQTT client ----------
// // // const brokerUrl = 'mqtt://localhost:1883';
// // const brokerUrl = 'mqtt://172.20.10.11:1883';
// // const topic     = 'gps/tracker';

// // const client = mqtt.connect(brokerUrl);

// // client.on('connect', () => {
// //   console.log('[subscriber] Connected to MQTT broker');
// //   client.subscribe(topic, err =>
// //     err ? console.error('[subscriber] subscribe error', err)
// //         : console.log(`[subscriber] Subscribed to ${topic}`));
// // });

// // client.on('message', (_topic, payload) => {
// //   try {
// //     const { location, stress } = JSON.parse(payload.toString());

// //     // location as "lat,lon" OR [lat, lon]
// //     const [lat, lon] = Array.isArray(location)
// //       ? location
// //       : location.split(',').map(Number);

// //     console.log('[subscriber] received', { lat, lon, stress });

// //     // optional ML prediction
// //     exec(`python3 predict.py ${lat} ${lon} ${stress}`, (err, stdout) => {
// //       if (err) console.error('[subscriber] ML error', err);
// //       else     console.log('[subscriber] ML prediction:', stdout.trim());
// //     });

// //     // write to InfluxDB
// //     const point = new Point('gps')
// //       .floatField('lat',    lat)
// //       .floatField('lon',    lon)
// //       .floatField('stress', stress);

// //     writeApi.writePoint(point);
// //   } catch (e) {
// //     console.error('[subscriber] JSON parse error', e);
// //   }
// // });

// // client.on('error', err => {
// //   console.error('[subscriber] MQTT error', err);
// // });

// // // flush pending writes on exit
// // process.on('SIGINT', async () => {
// //   console.log('\n[subscriber] Flushing writes and exiting…');
// //   await writeApi.close().catch(e => console.error('[subscriber] close error', e));
// //   process.exit(0);
// // });

// require('dotenv').config(); // Load environment variables

// const mqtt = require('mqtt');
// const { exec } = require('child_process');
// const { InfluxDB, Point } = require('@influxdata/influxdb-client');

// // ---------- env vars ----------
// const {
//   BROKER_URL,          // e.g., 'mqtt://172.20.10.11:1883'
//   INFLUX_URL,
//   INFLUX_TOKEN,
//   INFLUX_ORG,
//   INFLUX_BUCKET,
// } = process.env;

// // ---------- validate env ----------
// if (!BROKER_URL || !INFLUX_URL || !INFLUX_TOKEN || !INFLUX_ORG || !INFLUX_BUCKET) {
//   console.error('[subscriber] Missing one or more environment variables');
//   process.exit(1);
// }

// // ---------- InfluxDB setup ----------
// const influx = new InfluxDB({ url: INFLUX_URL, token: INFLUX_TOKEN });
// const writeApi = influx.getWriteApi(INFLUX_ORG, INFLUX_BUCKET, 'ns');
// writeApi.useDefaultTags({ app: 'tracker' });

// // ---------- MQTT setup ----------
// const topic = 'gps/tracker';
// const client = mqtt.connect(BROKER_URL);

// client.on('connect', () => {
//   console.log(`[subscriber] Connected to MQTT broker at ${BROKER_URL}`);
//   client.subscribe(topic, err => {
//     if (err) console.error('[subscriber] Subscription error:', err);
//     else console.log(`[subscriber] Subscribed to topic: ${topic}`);
//   });
// });

// client.on('message', (_topic, payload) => {
//   try {
//     const data = JSON.parse(payload.toString());

//     // Flexible parsing of `location`
//     const [lat, lon] = Array.isArray(data.location)
//       ? data.location
//       : data.location.split(',').map(Number);
//     const stress = data.stress ?? data.Stress;

//     const stressMap = {
//       0: "No Stress",
//       1: "Medium Stress",
//       2: "High Stress"
//     };

//     console.log(`[subscriber] Location: (${lat.toFixed(5)}, ${lon.toFixed(5)})`);
//     console.log(`[subscriber] Stress Level: ${stressMap[stress]} (${stress})`);

//     // Optional: ML prediction
//     exec(`python3 predict.py ${lat} ${lon} ${stress}`, (err, stdout) => {
//       if (err) console.error('[subscriber] ML error', err);
//       else console.log('[subscriber] ML prediction:', stdout.trim());
//     });

//     // Write to InfluxDB
//     const point = new Point('gps')
//       .floatField('lat', lat)
//       .floatField('lon', lon)
//       .floatField('stress', stress);
//     writeApi.writePoint(point);
//   } catch (e) {
//     console.error('[subscriber] JSON parse error:', e);
//   }
// });

// client.on('error', err => {
//   console.error('[subscriber] MQTT error:', err);
// });

// process.on('SIGINT', async () => {
//   console.log('\n[subscriber] Flushing writes and exiting...');
//   await writeApi.close().catch(e => console.error('[subscriber] close error:', e));
//   process.exit(0);
// });


require('dotenv').config();
console.log('[debug] INFLUX_URL =', process.env.INFLUX_URL);
console.log('[debug] INFLUX_BUCKET =', process.env.INFLUX_BUCKET);
const mqtt = require('mqtt');
const { spawn } = require('child_process');
const { InfluxDB, Point } = require('@influxdata/influxdb-client');

// ---------- Environment Variables ----------
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

// ---------- InfluxDB Setup ----------
const influx = new InfluxDB({ url: INFLUX_URL, token: INFLUX_TOKEN });
const writeApi = influx.getWriteApi(INFLUX_ORG, INFLUX_BUCKET, 'ns');
writeApi.useDefaultTags({ app: 'tracker' });

// ---------- MQTT Setup ----------
const brokerUrl = 'mqtt://172.20.10.11:1883';
const topic = 'gps/tracker';
const client = mqtt.connect(brokerUrl);

// ---------- MQTT Events ----------
client.on('connect', () => {
  console.log('[subscriber] Connected to MQTT broker');
  client.subscribe(topic, err => {
    if (err) console.error('[subscriber] Subscription error:', err);
    else     console.log(`[subscriber] Subscribed to topic: ${topic}`);
  });
});

client.on('message', (_topic, message) => {
  try {
    const data = JSON.parse(message.toString());

    // Basic GPS/stress logging (if available)
    if (data.location || (data.Latitude && data.Longitude)) {
      const [lat, lon] = data.location
        ? (Array.isArray(data.location) ? data.location : data.location.split(',').map(Number))
        : [data.Latitude, data.Longitude];

      const stress = data.stress ?? null;

      console.log('[subscriber] GPS:', { lat, lon, stress });

      const gpsPoint = new Point('gps')
        .floatField('lat', lat)
        .floatField('lon', lon);

      if (typeof stress === 'number') {
        gpsPoint.floatField('stress', stress);
      }

      writeApi.writePoint(gpsPoint);
    }

    // --------- Feature Extraction for ML ---------
    const features = [
      data.EDAR_Mean, data.EDAR_Min, data.EDAR_Max, data.EDAR_Std,
      data.EDAR_Kurtosis, data.EDAR_Skew, data.Num_PeaksR, data.EDAR_Amphitude,
      data.EDAR_Duration, data.HRR_Mean, data.HRR_Min, data.HRR_Max,
      data.HRR_Std, data.HRR_RMS, data.TEMPR_Mean, data.TEMPR_Min,
      data.TEMPR_Max, data.TEMPR_Std
    ];

    if (features.some(v => typeof v !== 'number' || isNaN(v))) {
      console.warn('[subscriber] Invalid or incomplete features. Skipping ML prediction.');
      return;
    }

    // Run Python ML prediction
    const py = spawn('python3', ['predict.py', ...features.map(String)]);
    let result = '';

    py.stdout.on('data', chunk => result += chunk.toString());
    py.stderr.on('data', chunk => console.error('[subscriber] Prediction error:', chunk.toString()));

    py.on('close', () => {
      const pred = parseInt(result.trim());
      const stressMap = { 0: 'No Stress', 1: 'Medium Stress', 2: 'High Stress' };
      console.log(`[subscriber] Predicted Stress Level: ${stressMap[pred] || 'Unknown'} (${pred})`);
    });

  } catch (e) {
    console.error('[subscriber] JSON parse error:', e);
  }
});

client.on('error', err => {
  console.error('[subscriber] MQTT error:', err);
});

// ---------- Graceful Exit ----------
process.on('SIGINT', async () => {
  console.log('\n[subscriber] Flushing writes and exiting…');
  await writeApi.close().catch(e => console.error('[subscriber] Influx close error:', e));
  process.exit(0);
});
