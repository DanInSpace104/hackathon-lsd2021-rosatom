import time

from paho.mqtt.client import Client

import config


class SensorEngine:
    LOOP_TIMEOUT = 0.5

    def __init__(self, name: str, uuid: int) -> None:
        self.name = name
        self.uuid = uuid
        self.mqtt = Client()
        self.mqtt.connect(config.MQTT_HOST, config.MQTT_PORT, config.MQTT_KEEPALIVE)

    def loop(self) -> None:
        while True:
            self.loop_once()
            time.sleep(self.LOOP_TIMEOUT)

    def loop_once(self) -> None:
        val = self.generate_value()
        self.mqtt.publish(f'sensor/telemetry/{self.uuid}', val)

    def generate_value(self):
        raise NotImplementedError()
