import random
import time

from engine import SensorEngine


class TemperatureSensor(SensorEngine):
    def __init__(self, name, uuid):
        super().__init__(name, uuid)
        self.temperature = 10.0

    def generate_value(self):
        rand = random.random()
        self.temperature += 2 * (-1 + rand * 2)
        # print(rand, self.temperature)
        return self.temperature


sensors = [TemperatureSensor('', i) for i in range(100)]

while True:
    for s in sensors:
        s.loop_once()
    time.sleep(0.1)
