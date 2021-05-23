import json
import os
import flask_socketio
import matplotlib as mpl
import matplotlib.pyplot as plt
import numpy as np
import redis
from flask import Flask, request, send_from_directory
from flask.templating import render_template

app = Flask(__name__, static_folder="./assets", template_folder='./assets')

async_mode = None

from flask_cors import CORS

cors = CORS(app, resources={r"*": {"origins": "*"}})
socketio = flask_socketio.SocketIO(app, cors_allowed_origins="*", async_mode=async_mode)
rcache = redis.Redis()


def colorMix(color1, color2, paletteSize):
    # creates a list of colors that gradually fade from color1 to color2, inclusive. paletteSize is the amount of values that will be generated.
    # The smallest useful paletteSize is 3, as it will return [color1, color1MixedWithColor2, color2]
    palette = [color1]
    colorDifference = [color1[0] - color2[0], color1[1] - color2[1], color1[2] - color2[2]]

    Rstep = (color1[0] - color2[0]) / (paletteSize - 1)
    Gstep = (color1[1] - color2[1]) / (paletteSize - 1)
    Bstep = (color1[2] - color2[2]) / (paletteSize - 1)

    for i in range(1, paletteSize):
        palette.append((color1[0] - Rstep * i, color1[1] - Gstep * i, color1[2] - Bstep * i))

    palette.append(color2)

    return palette


def createColorGrid(resolution, color1, color2, color3, color4):
    # build a new colorGrid using a different process than above. colors are RGB format. For a 1D color fade set pairs of colors
    # like (255,0,0) (255,0,0) (0,255,255) (0,255,255). Colors are ordered from top left corner and follow corners clockwise.
    colorArray = []
    # the first value in colorGrid is always a tuple stating the resolution.
    leftColumn = colorMix(color1, color4, resolution[1])
    rightColumn = colorMix(color2, color3, resolution[1])

    for i in range(0, resolution[1]):
        # color processing goes from top left to top right, then down a row and repeat
        colorArray.append(colorMix(leftColumn[i], rightColumn[i], resolution[0]))
    return colorArray


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


def colorFader(c1, c2, mix=0):  # fade (linear interpolate) from color c1 (at mix=0) to c2 (mix=1)
    c1 = np.array(mpl.colors.to_rgb(c1))
    c2 = np.array(mpl.colors.to_rgb(c2))
    return mpl.colors.to_hex((1 - mix) * c1 + mix * c2)


def hex_to_rgb(value):
    value = value.lstrip('#')
    lv = len(value)
    return tuple(int(value[i : i + lv // 3], 16) for i in range(0, lv, lv // 3))


def val2col(val):
    val = val / 100 * 3
    i = val
    if i < 0.2:
        return (0, 0, 0)
    elif i < 0.4:
        return (135, 206, 250)
    elif i < 0.6:
        return (100, 149, 237)
    elif i < 0.8:
        return (0, 0, 205)
    elif i < 1.0:
        return (25, 25, 112)

    elif i < 1.2:
        return (152, 251, 152)
    elif i < 1.4:
        return (0, 250, 154)
    elif i < 1.6:
        return (60, 179, 113)
    elif i < 1.8:
        return (34, 139, 34)
    elif i < 2.0:
        return (0, 100, 0)

    elif i < 2.2:
        return (255, 160, 122)
    elif i < 2.4:
        return (205, 92, 92)
    elif i < 2.6:
        return (255, 0, 0)
    elif i < 2.8:
        return (178, 34, 34)
    elif i < 3.0:
        return (139, 0, 0)
    else:
        return (0, 0, 0)


def background_thread(scheme_id):
    while True:
        colors = []
        for sensor in config['sensors']:
            data = json.loads(rcache.get(f'sensor/telemetry/{sensor["uuid"]}'))
            colors.append(val2col(data['val']))

        res = createColorGrid((100, 100), colors[0], colors[1], colors[2], colors[3])
        socketio.emit(
            'my_response',
            res,
            namespace='/apisocket0',
        )
        socketio.sleep(1)


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


@app.route('/login')
def login():
    return render_template('login.html')


@app.route('/test')
def test():
    return render_template('test.html')


if __name__ == '__main__':
    FLASK_PORT = os.getenv('FLASK_PORT') if os.getenv('FLASK_PORT') else config.get('port')
    FLASK_HOST = os.getenv('FLASK_HOST') if os.getenv('FLASK_HOST') else config.get('host')
    socketio.run(app, debug=True, host=FLASK_HOST, port=FLASK_PORT)
