from flask import Flask, request, send_from_directory
from flask.templating import render_template

import json
import flask_socketio
import redis
from flask import Flask, request

app = Flask(__name__, static_folder="../assets", template_folder='../assets')

async_mode = None

from flask_cors import CORS

cors = CORS(app, resources={r"*": {"origins": "*"}})
socketio = flask_socketio.SocketIO(app, cors_allowed_origins="*", async_mode=async_mode)
rcache = redis.Redis()

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
    for room in rooms.values():
        if request.sid in room:
            room.remove(request.sid)


def background_thread(scheme_id):
    count = 0
    while True:
        data = rcache.get("tmp")
        socketio.emit('my_response', json.dumps(data), namespace='/apisocket0')
        socketio.sleep(1)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/testsocket')
def testsocket():
    return render_template('websockettest.html')


if __name__ == '__main__':
    socketio.run(app, debug=True, host="0.0.0.0", port=5000)
