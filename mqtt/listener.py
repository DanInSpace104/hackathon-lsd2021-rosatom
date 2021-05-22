import json
import time
import os

import influxdb_client
import redis
from influxdb_client.client.write_api import ASYNCHRONOUS
from paho.mqtt.client import Client

with open('config.json') as fl:
    config = json.load(fl)

INFL_ORG = os.getenv('INFL_ORG') if os.getenv('INFL_ORG') else config['influx']['org']
INFL_TOKEN = os.getenv('INFL_TOKEN') if os.getenv('INFL_TOKEN') else config['influx']['token']
INFL_URL = os.getenv('INFL_URL') if os.getenv('INFL_URL') else config['influx']['url']

rcache = redis.Redis()
influx = influxdb_client.InfluxDBClient(
    url=INFL_URL, token=INFL_TOKEN, org=INFL_ORG
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


MQTT_PORT = os.getenv('MQTT_PORT') if os.getenv('MQTT_PORT') else config['mqtt'].get('port')
MQTT_HOST = os.getenv('MQTT_HOST') if os.getenv('MQTT_HOST') else config['mqtt'].get('host')
client = LocalClient()
client.connect(MQTT_HOST, int(MQTT_PORT), config['mqtt']['keepalive'])
client.loop_forever()
