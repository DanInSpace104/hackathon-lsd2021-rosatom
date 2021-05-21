import time

from paho.mqtt.client import Client

import config


class LocalClient(Client):
    @staticmethod
    def on_message(client, userdata, msg):
        print(msg.payload.decode())

    @staticmethod
    def on_connect(client, userdata, flags, rc):
        print('connected', time.time())
        client.subscribe('/')

    @staticmethod
    def on_disconnect(client, userdata, rc):
        print('disconnected', time.time())


client = LocalClient()
client.connect(config.HOST, config.PORT, config.KEEPALIVE)
client.loop_forever()
