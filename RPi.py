import subprocess
import re
import math

def get_rssi():
    result = subprocess.run(["iwconfig", "wlan0"], capture_output=True, text=True)
    match = re.search(r"Signal level=(-?\d+) dBm", result.stdout)
    return int(match.group(1)) if match else None

def rssi_to_distance(rssi, tx_power=-45, path_loss_exponent=2):
    if rssi is None:
        return None
    return round(10 ** ((tx_power - rssi) / (10 * path_loss_exponent)), 2)



import time
import paho.mqtt.client as mqtt

MQTT_BROKER = "192.168.1.x"  # IP of your laptop
TOPIC = "rpi/distance"

client = mqtt.Client()
client.connect(MQTT_BROKER, 1883, 60)

while True:
    rssi = get_rssi()
    distance = rssi_to_distance(rssi)
    if distance:
        print(f"RSSI: {rssi} dBm → Distance: {distance} m")
        client.publish(TOPIC, distance)
    time.sleep(5)