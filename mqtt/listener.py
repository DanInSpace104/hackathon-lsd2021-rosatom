import json
import time

import redis
from paho.mqtt.client import Client

import config

rcache = redis.Redis()


class LocalClient(Client):
    @staticmethod
    def on_message(client, userdata, msg):
        msg = json.loads(msg.payload)
        print(msg)
        rcache.set(f'sensor/telemetry/{msg["uuid"]}', json.dumps(msg))

    @staticmethod
    def on_connect(client, userdata, flags, rc):
        print('connected', time.time())
        client.subscribe('sensor/telemetry/#')
        rcache.set('mqtt/listener/status', f'connected and subscribed {time.time()}')

    @staticmethod
    def on_disconnect(client, userdata, rc):
        print('disconnected', time.time())
        rcache.set('mqtt/listener/status', f'disconnected {time.time()}')


client = LocalClient()
client.connect(config.HOST, config.PORT, config.KEEPALIVE)
client.loop_forever()
