import random

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


if __name__ == '__main__':
    t = TemperatureSensor('temperature 1', 1)
    t.loop()
