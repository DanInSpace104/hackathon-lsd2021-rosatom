import json
import time
import os

from paho.mqtt.client import Client

with open('config.json') as fl:
    config = json.load(fl)


class SensorEngine:
    LOOP_TIMEOUT = 0.5

    def __init__(self, name: str, uuid: int) -> None:
        self.name = name
        self.uuid = uuid
        self.mqtt = Client()
        MQTT_PORT = os.getenv('MQTT_PORT') if os.getenv('MQTT_PORT') else config['mqtt'].get('port')
        MQTT_HOST = os.getenv('MQTT_HOST') if os.getenv('MQTT_HOST') else config['mqtt'].get('host')
        self.mqtt.connect(MQTT_HOST, int(MQTT_PORT), config['mqtt']['keepalive'])

    def loop(self) -> None:
        while True:
            self.loop_once()
            time.sleep(self.LOOP_TIMEOUT)

    def loop_once(self, val=None) -> None:
        val = val or self.generate_value()
        msg = {'uuid': self.uuid, 'name': self.name, 'ts': time.time(), 'val': val}
        self.mqtt.publish(f'sensor/telemetry/{self.uuid}', json.dumps(msg))

    def generate_value(self):
        raise NotImplementedError()
