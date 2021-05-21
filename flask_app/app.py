from flask import Flask, request, send_from_directory
from flask.templating import render_template

# set the project root directory as the static folder, you can set others.
app = Flask(__name__, static_folder='../assets')


@app.route('/')
def index():
    return render_template('index.html')


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
