'''
script for rasp pi

1. loads the test_set_to_send.csv
2. adds simulated location data (lat/long)
3. sends row over MQTT every 5 seconds
'''

import pandas as pd
import random
import time
import json
import paho.mqtt.client as mqtt # make sure to install this onto the Pi!

# configs
# CSV_PATH = "raspi_publisher_laptop_subscriber/test_set_to_send.csv"  # this CSV should be copied to the RPi
CSV_PATH = "test_set_to_send.csv"
BROKER_IP = "172.20.10.11"  # laptop's IP / node 2
TOPIC = "gps/tracker"
DELAY = 5  # seconds between messages


# load test data
df = pd.read_csv(CSV_PATH) 

# simulate random locations around USC next to each row
def random_location():
    lat = 34.0224 + random.uniform(-0.001, 0.001)
    long = -118.2851 + random.uniform(-0.001, 0.001)
    return lat, long

# MQTT client setup
client = mqtt.Client(protocol=mqtt.MQTTv311)
client.connect(BROKER_IP, 1883, 60)
client.loop_start()

# send row-by-row info
for _, row in df.iterrows():
    data = row.to_dict()
    data["Latitude"], data["Longitude"] = random_location()
    client.publish(TOPIC, json.dumps(data))
    print("Published:", json.dumps(data))
    time.sleep(5)
