import json
import time

from paho.mqtt.client import Client

with open('config.json') as fl:
    config = json.load(fl)


class SensorEngine:
    LOOP_TIMEOUT = 0.5

    def __init__(self, name: str, uuid: int) -> None:
        self.name = name
        self.uuid = uuid
        self.mqtt = Client()
        self.mqtt.connect(
            config['mqtt']['host'], config['mqtt']['port'], config['mqtt']['keepalive']
        )

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
