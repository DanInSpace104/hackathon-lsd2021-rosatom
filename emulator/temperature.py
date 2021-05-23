import json
import random
import time

from engine import SensorEngine


class TemperatureSensor(SensorEngine):
    def __init__(self, name, uuid):
        super().__init__(name, uuid)
        self.temperature = 50.0

    def generate_value(self):
        rand = random.random()
        self.temperature += 20 * (-1 + rand * 2)
        print(rand, self.temperature)
        return self.temperature


with open('config.json') as fl:
    config = json.load(fl)

sensors = [TemperatureSensor(sensor['name'], sensor['uuid']) for sensor in config['sensors']]

while True:
    for s in sensors:
        if s.uuid == 1:
            s.loop_once(80)
        else:
            s.loop_once()
        time.sleep(0.25)
