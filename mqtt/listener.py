import json
import time

import influxdb_client
import redis
from influxdb_client.client.write_api import ASYNCHRONOUS
from paho.mqtt.client import Client

with open('config.json') as fl:
    config = json.load(fl)

rcache = redis.Redis()
influx = influxdb_client.InfluxDBClient(
    url=config['influx']['url'], token=config['influx']['token'], org=config['influx']['org']
)
write_api = influx.write_api(write_options=ASYNCHRONOUS)
query_api = influx.query_api()


class LocalClient(Client):
    @staticmethod
    def on_message(client, userdata, msg):
        msg = json.loads(msg.payload)
        print(msg)
        p = (
            influxdb_client.Point("my_measurement")
            .tag('uuid', msg['uuid']).tag('name', msg['name'])
            .field("temperature", msg['val'])
        )
        write_api.write(bucket=config['influx']['bucket'], org=config['influx']['org'], record=p)
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
client.connect(config['mqtt']['host'], config['mqtt']['port'], config['mqtt']['keepalive'])
client.loop_forever()
