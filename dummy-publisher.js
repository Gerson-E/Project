const mqtt = require('mqtt');

const client = mqtt.connect('mqtt://localhost:1883');
const topic = 'gps/tracker';

// USC as centre, ±0.01° random offset
const USC = [34.0205, -118.2856];

client.on('connect', () => {
  console.log('Dummy publisher connected. Sending a point every 3 s...');
  setInterval(() => {
    const lat = USC[0] + (Math.random() - 0.5) * 0.02;
    const lon = USC[1] + (Math.random() - 0.5) * 0.02;
    const stress = +(Math.random().toFixed(2));          // 0.00‑1.00

    const payload = JSON.stringify({
      location: `${lat},${lon}`,
      stress,
    });

    client.publish(topic, payload);
  }, 3000);
});
