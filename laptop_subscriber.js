/*
Laptop MQTT Subscriber (runs on laptop)

subscribes to the same topic as the raspi : gps/tracker
parses incoming JSON messages from RPi (18 features + location)
sends features to python (predict.py) to predcit stress level
prints location + predicted stress

notes:
- run npm install mqtt
- run mosquitto locally on cmd prompt: "C:\Program Files\mosquitto\mosquitto.exe" -c "C:\Program Files\mosquitto\mosquitto.conf" -v
this is to allow permissions as well
- then run in seperate terminal: "node laptop_subscriber.js" from the Project file
- on publisher on rpi: change broker_ip to laptop ip + run "python3 raspi_publisher.py"
*/

const mqtt = require('mqtt');
const { spawn } = require('child_process');

// connect to MQTT broker on laptop
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

        // features to be extracted to send to python ML model
        const features = [
            data.EDAR_Mean, data.EDAR_Min, data.EDAR_Max, data.EDAR_Std,
            data.EDAR_Kurtosis, data.EDAR_Skew, data.Num_PeaksR, data.EDAR_Amphitude,
            data.EDAR_Duration, data.HRR_Mean, data.HRR_Min, data.HRR_Max,
            data.HRR_Std, data.HRR_RMS, data.TEMPR_Mean, data.TEMPR_Min,
            data.TEMPR_Max, data.TEMPR_Std
        ];

        // make sure all values are members
        if (features.some(v => typeof v !== 'number' || isNaN(v))) {
            console.error("Invalid feature set received:", features);
            return;
        }


        // spawn child python process to run predict.py with the features
        const py = spawn('python', ['predict.py', ...features.map(String)]);

        // listens for output from python script and stores results (0, 1, 2)       let result = '';
        py.stdout.on('data', (chunk) => {
            result += chunk.toString();
        });

        // handles errors
        py.stderr.on('data', (chunk) => {
            console.error('Prediction error:', chunk.toString());
        });

        // print prediction result
        py.on('close', () => {
            const pred = parseInt(result.trim()); // get int prediction from Python 
            const stressMap = {
                0: "No Stress",
                1: "Medium Stress",
                2: "High Stress"
            };

            console.log(`Location: (${data.Latitude.toFixed(5)}, ${data.Longitude.toFixed(5)})`);
            console.log(`Predicted Stress Level: ${stressMap[pred]} (${pred})\n`);
        });
    }
    catch (e) {
        console.error("Failed to parse incoming message:", e);
    }
});
