FROM python:3.8-slim-buster

WORKDIR /app

COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt

ARG FLASK_HOST="0.0.0.0"
ARG FLASK_PORT="5000"

ENV FLASK_HOST ${FLASK_HOST}
ENV FLASK_PORT ${FLASK_PORT}

#RUN echo '{"host" : "${FLASK_HOST}" , "port": "${FLASK_PORT}"}' > config.json

COPY . .
EXPOSE 5000
CMD [ "python3", "app.py"]