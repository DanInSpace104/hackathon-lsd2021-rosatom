import json
import os
import flask_socketio
import redis
from flask import Flask, request, send_from_directory
from flask.templating import render_template

app = Flask(__name__, static_folder="./assets", template_folder='./assets')

async_mode = None

from flask_cors import CORS

cors = CORS(app, resources={r"*": {"origins": "*"}})
socketio = flask_socketio.SocketIO(app, cors_allowed_origins="*", async_mode=async_mode)
rcache = redis.Redis()


with open('config.json') as fl:
    config = json.load(fl)


@socketio.on('connect', namespace='/apisocket0')
def on_connect():
    print('Connect:', request.sid)
    socketio.emit('my_message', {'data': 'Connected', 'count': 1})


@socketio.on('join', namespace='/apisocket0')
def on_join(scheme_id):
    print('Join:', scheme_id)
    flask_socketio.join_room(scheme_id)
    socketio.emit('my_message', f'joined room {scheme_id}')
    socketio.start_background_task(target=background_thread, scheme_id=scheme_id)


@socketio.on('disconnect', namespace='/apisocket0')
def on_disconnect():
    print('Disconnect:', request.sid)


def background_thread(scheme_id):
    while True:
        for sensor in config['sensors']:
            data = rcache.get(f'sensor/telemetry/{sensor["uuid"]}')
            socketio.emit('my_response', json.loads(data), namespace='/apisocket0')
        socketio.sleep(0.5)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/model')
def model_view():
    return render_template('model.html')


@app.route('/yamltest')
def yamltest():
    return render_template('yamltest.html')

@app.route('/testsocket')
def testsocket():
    return render_template('websockettest.html')


if __name__ == '__main__':
    FLASK_PORT = os.getenv('FLASK_PORT') if os.getenv('FLASK_PORT') else config.get('port')
    FLASK_HOST = os.getenv('FLASK_HOST') if os.getenv('FLASK_HOST') else config.get('host')
    socketio.run(app, debug=True, host=FLASK_HOST, port=FLASK_PORT)
